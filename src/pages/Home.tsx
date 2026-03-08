import { useEffect, useState } from 'react';
import { Container, Title, Text, SimpleGrid, Card, Button, Stack, Group, Badge, List, ThemeIcon } from '@mantine/core';
import { IconWand, IconFileText, IconSearch } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import pb from '@/api/pocketbase';
import { cardStyle, elevatedStyle, glowAccent } from '@/theme/styles';

interface RecentCharacter {
  id: string;
  name: string;
  raceName: string;
  classes: { className: string; level: number }[];
  level: number;
}

export function Home() {
  const [recent, setRecent] = useState<RecentCharacter[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    pb.collection('characters').getList(1, 8, { sort: '-updated' })
      .then((res) => { if (!cancelled) { setRecent(res.items as unknown as RecentCharacter[]); setLoaded(true); } })
      .catch(() => { if (!cancelled) setLoaded(true); });
    return () => { cancelled = true; };
  }, []);

  const classLabel = (char: RecentCharacter) =>
    char.classes?.map((c) => `${c.className} ${c.level}`).join(' / ') || `Lv ${char.level}`;

  return (
    <Container size="md" py="xl">
      <Title order={2} ta="center" mb={4}>
        WebSheet
      </Title>
      <Text ta="center" c="parchment.5" mb="xl" size="md">
        D&D 5e Character Manager
      </Text>

      {/* Hero — Guided Create */}
      <Card padding="xl" mb="lg" style={{ ...elevatedStyle, ...glowAccent }}>
        <Group justify="space-between" align="flex-start" wrap="nowrap">
          <Stack gap="xs" style={{ flex: 1 }}>
            <Title order={3}>Guided Create</Title>
            <Text c="parchment.4" size="sm">
              Step-by-step wizard with race, class, background, and ability selection.
            </Text>
            <List
              size="sm"
              c="parchment.5"
              spacing={2}
              icon={
                <ThemeIcon size={16} variant="transparent" color="gold">
                  <IconWand size={12} />
                </ThemeIcon>
              }
            >
              <List.Item>Choose from 140+ races, classes, and backgrounds</List.Item>
              <List.Item>Auto-calculated stats, proficiencies, and features</List.Item>
              <List.Item>Full 5e.tools data with inline wiki previews</List.Item>
            </List>
          </Stack>
          <Button
            component={Link}
            to="/create"
            variant="filled"
            color="gold"
            size="md"
            mt="xs"
            leftSection={<IconWand size={18} />}
          >
            Start Wizard
          </Button>
        </Group>
      </Card>

      {/* Secondary — Quick Create + Load */}
      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg" mb="xl">
        <Card padding="lg" style={cardStyle}>
          <Group gap="xs" mb="xs">
            <IconFileText size={18} color="var(--mantine-color-parchment-5)" />
            <Title order={4}>Quick Create</Title>
          </Group>
          <Text c="parchment.5" size="sm" mb="md">
            Blank sheet — fill in whatever you want, no rules enforced.
          </Text>
          <Button component={Link} to="/character/new" variant="outline" size="sm" fullWidth>
            Blank Sheet
          </Button>
        </Card>

        <Card padding="lg" style={cardStyle}>
          <Group gap="xs" mb="xs">
            <IconSearch size={18} color="var(--mantine-color-parchment-5)" />
            <Title order={4}>Load Character</Title>
          </Group>
          <Text c="parchment.5" size="sm" mb="md">
            Open an existing character by name and passphrase.
          </Text>
          <Button component={Link} to="/load" variant="outline" size="sm" fullWidth>
            Load Character
          </Button>
        </Card>
      </SimpleGrid>

      {/* Recent Characters — always shown */}
      <Stack>
        <Title order={4} c="parchment.5">Recent Characters</Title>
        {loaded && recent.length === 0 ? (
          <Text c="parchment.6" size="sm" fs="italic">
            No characters yet — <Text component={Link} to="/create" c="gold.5" inherit>create your first one</Text>.
          </Text>
        ) : (
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
        )}
      </Stack>
    </Container>
  );
}
