import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { Container, Header, MantineProvider, Text } from '@mantine/core';
import { NotificationsProvider } from '@mantine/notifications';

function MyApp() {
  return (
    <MantineProvider withNormalizeCSS withGlobalStyles>
      <NotificationsProvider>
        <Header height={40} mb={20}>
          <Container fluid>
            <Text size={'xl'}>Image Resizer</Text>
          </Container>
        </Header>
        <App />
      </NotificationsProvider>
    </MantineProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <MyApp />
  </React.StrictMode>
);
