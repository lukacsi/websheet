import { useEffect, useState } from 'react';
import { Container, Title, Text, SimpleGrid, Card, Button, Stack, Group, Badge } from '@mantine/core';
import { Link } from 'react-router-dom';
import pb from '@/api/pocketbase';
import { cardStyle } from '@/theme/styles';

interface RecentCharacter {
  id: string;
  name: string;
  raceName: string;
  classes: { className: string; level: number }[];
  level: number;
}

export function Home() {
  const [recent, setRecent] = useState<RecentCharacter[]>([]);

  useEffect(() => {
    let cancelled = false;
    pb.collection('characters').getList(1, 8, { sort: '-updated' })
      .then((res) => { if (!cancelled) setRecent(res.items as unknown as RecentCharacter[]); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  const classLabel = (char: RecentCharacter) =>
    char.classes?.map((c) => `${c.className} ${c.level}`).join(' / ') || `Lv ${char.level}`;

  return (
    <Container size="lg" py="xl">
      <Title order={1} ta="center" mb="md">
        WebSheet
      </Title>
      <Text ta="center" c="parchment.5" mb="xl" size="lg">
        D&D 5e Character Manager
      </Text>

      <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="lg">
        <Card shadow="sm" padding="lg" style={cardStyle}>
          <Title order={3} mb="sm">Guided Create</Title>
          <Text c="parchment.6" mb="md">
            Step-by-step wizard — pick race, class, background, and abilities with guidance.
          </Text>
          <Button component={Link} to="/create" variant="filled">
            Wizard
          </Button>
        </Card>

        <Card shadow="sm" padding="lg" style={cardStyle}>
          <Title order={3} mb="sm">Quick Create</Title>
          <Text c="parchment.6" mb="md">
            Blank character sheet — fill in whatever you want, no rules enforced.
          </Text>
          <Button component={Link} to="/character/new" variant="light">
            Blank Sheet
          </Button>
        </Card>

        <Card shadow="sm" padding="lg" style={cardStyle}>
          <Title order={3} mb="sm">Load Character</Title>
          <Text c="parchment.6" mb="md">
            Open an existing character sheet by name and passphrase.
          </Text>
          <Button component={Link} to="/load" variant="light">
            Load Character
          </Button>
        </Card>
      </SimpleGrid>

      {recent.length > 0 && (
        <Stack mt="xl">
          <Title order={3}>Recent Characters</Title>
          <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="sm">
            {recent.map((char) => (
              <Card
                key={char.id}
                component={Link}
                to={`/character/${char.id}`}
                padding="sm"
                style={{ ...cardStyle, textDecoration: 'none' }}
              >
                <Text fw={600} truncate>{char.name || 'Unnamed'}</Text>
                <Group gap={4} mt={4}>
                  <Badge size="xs" variant="light" color="inkBrown">{classLabel(char)}</Badge>
                  {char.raceName && <Badge size="xs" variant="light" color="gold">{char.raceName}</Badge>}
                </Group>
              </Card>
            ))}
          </SimpleGrid>
        </Stack>
      )}
    </Container>
  );
}
