import type { ReactNode } from 'react';
import {
  AppShell as MantineAppShell,
  Group,
  Title,
  Anchor,
  Container,
} from '@mantine/core';
import { Link } from 'react-router-dom';

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <MantineAppShell
      header={{ height: 56 }}
      styles={{
        header: {
          backgroundColor: '#1e1a15',
          borderBottom: '1px solid #3d3227',
        },
        main: {
          backgroundColor: '#1a1612',
        },
      }}
    >
      <MantineAppShell.Header>
        <Container size="xl" h="100%">
          <Group h="100%" justify="space-between">
            <Anchor component={Link} to="/" underline="never">
              <Title order={3} c="parchment.2">WebSheet</Title>
            </Anchor>
            <Group gap="md">
              <Anchor component={Link} to="/create" c="parchment.4" size="sm">
                New Character
              </Anchor>
              <Anchor component={Link} to="/load" c="parchment.4" size="sm">
                Load
              </Anchor>
            </Group>
          </Group>
        </Container>
      </MantineAppShell.Header>

      <MantineAppShell.Main>
        {children}
      </MantineAppShell.Main>
    </MantineAppShell>
  );
}
