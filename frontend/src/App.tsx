import {
  ActionIcon,
  Button,
  Card,
  Container,
  Grid,
  Group,
  Image,
  NumberInput,
  TextInput,
} from '@mantine/core';
import { FileWithPath } from 'file-selector';
import { useState } from 'react';
import FileDrop from './FileDrop';
import { useForm } from '@mantine/form';
import { randomId } from '@mantine/hooks';
import { IconTrash } from '@tabler/icons';
import axios from 'axios';
interface UploadedFile {
  id: string;
  image: FileWithPath;
}

function App() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  function addFiles(files: FileWithPath[]) {
    const filesToAdd: UploadedFile[] = files.map((file) => ({
      id: randomId(),
      image: file,
    }));
    setFiles((files) => [...files, ...filesToAdd]);
  }
  function removeFile(id: string) {
    setFiles((files) => files.filter((file) => file.id !== id));
  }

  const form = useForm({
    initialValues: {
      sizes: [
        {
          height: 0,
          width: 0,
          prefix: '',
          key: randomId(),
        },
      ],
    },
  });

  const fields = form.values.sizes.map((item, index) => (
    <Group key={item.key} mt="xs">
      <NumberInput
        placeholder="Height"
        withAsterisk
        value={item.height}
        sx={{ flex: 1 }}
        {...form.getInputProps(`sizes.${index}.height`)}
      />
      <NumberInput
        placeholder="Width"
        withAsterisk
        sx={{ flex: 1 }}
        value={item.width}
        {...form.getInputProps(`sizes.${index}.width`)}
      />
      <TextInput
        placeholder="Prefix"
        withAsterisk
        sx={{ flex: 1 }}
        value={item.prefix}
        {...form.getInputProps(`sizes.${index}.prefix`)}
      />
      <ActionIcon
        color="red"
        onClick={() => form.removeListItem('sizes', index)}
      >
        <IconTrash size={20} />
      </ActionIcon>
    </Group>
  ));

  async function resizeFiles() {
    const formdata = new FormData();
    formdata.append('sizes', JSON.stringify(form.values.sizes));
    files.forEach((file) => {
      formdata.append('files', file.image);
    });

    console.log(formdata.getAll('files'));
    axios
      .post('http://127.0.0.1:3001/resize', formdata, {
        responseType: 'blob',
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      .then((res) => {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(res.data);
        link.download = `images-${+new Date()}.zip`;
        link.click();
        link.remove();
      });
  }

  return (
    <Container fluid>
      <FileDrop addFiles={addFiles} />

      <Grid gutter={10} mt={20}>
        {files.map((file) => {
          const imageUrl = URL.createObjectURL(file.image);
          return (
            <Grid.Col span={2} md={3} xs={6} lg={2} sm={4}>
              <Card withBorder key={file.id}>
                <Image height={100} src={imageUrl} />
                <ActionIcon color="red" onClick={() => removeFile(file.id)}>
                  <IconTrash size={20} />
                </ActionIcon>
              </Card>
            </Grid.Col>
          );
        })}
      </Grid>
      {fields}

      <Group position="center" mt="md">
        <Button
          onClick={() =>
            form.insertListItem('sizes', {
              height: 0,
              width: 0,
              prefix: '',
              key: randomId(),
            })
          }
        >
          Add Size
        </Button>
        <Button onClick={resizeFiles}>Resize</Button>
      </Group>

      {}
    </Container>
  );
}

export default App;
