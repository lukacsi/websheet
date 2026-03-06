import { Container, Title, Text, SimpleGrid, Card, Group, Button } from '@mantine/core';
import { Link } from 'react-router-dom';

export function Home() {
  return (
    <Container size="lg" py="xl">
      <Title order={1} ta="center" mb="md">
        WebSheet
      </Title>
      <Text ta="center" c="dimmed" mb="xl" size="lg">
        D&D 5e Character Manager
      </Text>

      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
        <Card
          shadow="sm"
          padding="lg"
          style={{
            backgroundColor: 'var(--mantine-color-dark-7)',
            border: '1px solid var(--mantine-color-dark-5)',
          }}
        >
          <Title order={3} mb="sm">Create Character</Title>
          <Text c="dimmed" mb="md">
            Build a new character from scratch — choose race, class, background, and abilities.
          </Text>
          <Button component={Link} to="/create" variant="filled">
            New Character
          </Button>
        </Card>

        <Card
          shadow="sm"
          padding="lg"
          style={{
            backgroundColor: 'var(--mantine-color-dark-7)',
            border: '1px solid var(--mantine-color-dark-5)',
          }}
        >
          <Title order={3} mb="sm">Load Character</Title>
          <Text c="dimmed" mb="md">
            Open an existing character sheet by name and passphrase.
          </Text>
          <Group>
            <Button component={Link} to="/load" variant="light">
              Load Character
            </Button>
          </Group>
        </Card>
      </SimpleGrid>
    </Container>
  );
}
