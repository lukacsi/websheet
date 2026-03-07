import { Container, Title, Text, SimpleGrid, Card, Button } from '@mantine/core';
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

      <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="lg">
        <Card
          shadow="sm"
          padding="lg"
          style={{
            backgroundColor: 'var(--mantine-color-dark-7)',
            border: '1px solid var(--mantine-color-dark-5)',
          }}
        >
          <Title order={3} mb="sm">Guided Create</Title>
          <Text c="dimmed" mb="md">
            Step-by-step wizard — pick race, class, background, and abilities with guidance.
          </Text>
          <Button component={Link} to="/create" variant="filled">
            Wizard
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
          <Title order={3} mb="sm">Quick Create</Title>
          <Text c="dimmed" mb="md">
            Blank character sheet — fill in whatever you want, no rules enforced.
          </Text>
          <Button component={Link} to="/character/new" variant="light">
            Blank Sheet
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
          <Button component={Link} to="/load" variant="light">
            Load Character
          </Button>
        </Card>
      </SimpleGrid>
    </Container>
  );
}
