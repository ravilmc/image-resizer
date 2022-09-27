import {
  Body,
  Controller,
  Get,
  Post,
  StreamableFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import * as archiver from 'archiver';
import { AppService } from './app.service';

import * as sharp from 'sharp';
interface Size {
  height: number;
  width: number;
  prefix: number;
}
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('resize')
  @UseInterceptors(AnyFilesInterceptor())
  async uploadFile(
    @UploadedFiles() uploads: Array<Express.Multer.File>,
    @Body() body,
  ) {
    const sizes: Size[] = JSON.parse(body.sizes);
    const files = uploads.filter((u) => u.fieldname == 'files');
    const zip = archiver('zip');

    async function createResizedBuffer(file: Express.Multer.File, attr: Size) {
      const buffer = await sharp(file.buffer)
        .resize(attr.width, attr.height)
        .toBuffer();
      return {
        buffer,
        name: file.originalname.split('.').join(attr.prefix + '.'),
      };
    }

    const filesandsizes: {
      file: Express.Multer.File;
      attr: Size;
    }[] = [];

    for (let i = 0; i < files.length; i++) {
      for (let j = 0; j < sizes.length; j++) {
        const size = sizes[j];
        filesandsizes.push({
          file: files[i],
          attr: size,
        });
      }
    }

    const resizedFilesandBuffers = await Promise.all(
      filesandsizes.map(({ file, attr }) => createResizedBuffer(file, attr)),
    );

    resizedFilesandBuffers.forEach(({ name, buffer }) => {
      zip.append(buffer, { name });
    });
    zip.finalize();
    return new StreamableFile(zip);
  }
}
