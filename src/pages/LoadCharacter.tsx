import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container, Title, TextInput, Stack, Card, Text, Group, Badge,
  Button, PasswordInput, Loader,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import pb from '@/api/pocketbase';
import { verifyPassphrase } from '@/utils/passphrase';
import { darkPaperStyle } from '@/theme/styles';

interface CharacterSummary {
  id: string;
  name: string;
  raceName: string;
  backgroundName: string;
  classes: { className: string; level: number }[];
  level: number;
  passphraseHash?: string;
  updatedAt?: string;
}

export function LoadCharacter() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<CharacterSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  // Passphrase prompt state
  const [promptChar, setPromptChar] = useState<CharacterSummary | null>(null);
  const [passphrase, setPassphrase] = useState('');
  const [verifying, setVerifying] = useState(false);

  async function handleSearch() {
    const term = search.trim();
    if (!term) return;
    setLoading(true);
    setSearched(true);
    try {
      const records = await pb.collection('characters').getList(1, 20, {
        filter: `name~"${term.replace(/"/g, '\\"')}"`,
        sort: '-updated',
      });
      setResults(records.items as unknown as CharacterSummary[]);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  function handleSelect(char: CharacterSummary) {
    if (char.passphraseHash) {
      setPromptChar(char);
      setPassphrase('');
    } else {
      navigate(`/character/${char.id}`);
    }
  }

  async function handleVerify() {
    if (!promptChar) return;
    setVerifying(true);
    try {
      const match = await verifyPassphrase(passphrase, promptChar.passphraseHash!);
      if (match) {
        navigate(`/character/${promptChar.id}`);
      } else {
        notifications.show({ title: 'Wrong passphrase', message: 'Try again', color: 'red' });
      }
    } finally {
      setVerifying(false);
    }
  }

  const classLabel = (char: CharacterSummary) =>
    char.classes?.map((c) => `${c.className} ${c.level}`).join(' / ') || `Level ${char.level}`;

  return (
    <Container size="md" py="xl">
      <Title order={2} mb="lg">Load Character</Title>

      <Group gap="xs" mb="lg">
        <TextInput
          placeholder="Search by character name..."
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          style={{ flex: 1 }}
        />
        <Button onClick={handleSearch} loading={loading}>
          Search
        </Button>
      </Group>

      {loading && <Loader size="sm" />}

      {!loading && searched && results.length === 0 && (
        <Text c="dimmed">No characters found.</Text>
      )}

      <Stack gap="sm">
        {results.map((char) => (
          <Card
            key={char.id}
            padding="md"
            style={{ ...darkPaperStyle, cursor: 'pointer' }}
            onClick={() => handleSelect(char)}
          >
            <Group justify="space-between">
              <div>
                <Text fw={700} size="lg">{char.name}</Text>
                <Group gap="xs" mt={4}>
                  <Badge size="sm" variant="light" color="blue">{classLabel(char)}</Badge>
                  {char.raceName && <Badge size="sm" variant="light" color="green">{char.raceName}</Badge>}
                  {char.backgroundName && <Badge size="sm" variant="light" color="orange">{char.backgroundName}</Badge>}
                </Group>
              </div>
              {char.passphraseHash && (
                <Badge size="xs" variant="outline" color="gray">Protected</Badge>
              )}
            </Group>
          </Card>
        ))}
      </Stack>

      {/* Passphrase prompt modal-style */}
      {promptChar && (
        <Card
          padding="lg"
          mt="lg"
          style={{
            backgroundColor: 'var(--mantine-color-dark-6)',
            border: '2px solid var(--mantine-color-parchment-6)',
          }}
        >
          <Text fw={600} mb="sm">Enter passphrase for {promptChar.name}</Text>
          <Group gap="xs">
            <PasswordInput
              placeholder="Passphrase"
              value={passphrase}
              onChange={(e) => setPassphrase(e.currentTarget.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
              style={{ flex: 1 }}
            />
            <Button onClick={handleVerify} loading={verifying}>
              Unlock
            </Button>
            <Button variant="subtle" onClick={() => setPromptChar(null)}>
              Cancel
            </Button>
          </Group>
        </Card>
      )}
    </Container>
  );
}
