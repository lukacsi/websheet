import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { ModalsProvider } from '@mantine/modals';
import { theme } from './theme';
import { AppShell } from './components/AppShell';
import { Home } from './pages/Home';
import { CreateCharacter } from './pages/CreateCharacter';
import { LoadCharacter } from './pages/LoadCharacter';
import { CharacterSheet } from './pages/CharacterSheet';

import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import './theme/global.css';

export default function App() {
  return (
    <MantineProvider theme={theme} defaultColorScheme="dark">
      <Notifications position="top-right" />
      <ModalsProvider>
        <BrowserRouter>
          <AppShell>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/create" element={<CreateCharacter />} />
              <Route path="/load" element={<LoadCharacter />} />
              <Route path="/character/:id" element={<CharacterSheet />} />
            </Routes>
          </AppShell>
        </BrowserRouter>
      </ModalsProvider>
    </MantineProvider>
  );
}
