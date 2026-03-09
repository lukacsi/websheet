import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container, Title, TextInput, Stack, Card, Text, Group, Badge,
  Button, PasswordInput, Loader, Modal, Center, FileButton,
} from '@mantine/core';
import { IconSearch, IconLock, IconUpload } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import pb, { createRecord } from '@/api/pocketbase';
import { verifyPassphrase } from '@/utils/passphrase';
import { importCharacter } from '@/utils/character-import';
import { cardStyle, elevatedStyle } from '@/theme/styles';
import type { Character } from '@/types';

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
  const [allChars, setAllChars] = useState<CharacterSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);

  // Passphrase modal state
  const [promptChar, setPromptChar] = useState<CharacterSummary | null>(null);
  const [passphrase, setPassphrase] = useState('');
  const [verifying, setVerifying] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  async function handleImport(file: File | null) {
    if (!file) return;
    try {
      const text = await file.text();
      const char = importCharacter(text);
      const created = await createRecord<Character>('characters', char as unknown as Record<string, unknown>);
      notifications.show({
        title: 'Character imported',
        message: `${char.name} has been created.`,
        color: 'gold',
      });
      navigate(`/character/${created.id}`);
    } catch (err) {
      notifications.show({
        title: 'Import failed',
        message: err instanceof Error ? err.message : 'Invalid file',
        color: 'red',
      });
    }
  }

  // Load all characters on mount
  useEffect(() => {
    fetchCharacters('');
  }, []);

  async function fetchCharacters(term: string) {
    setLoading(true);
    try {
      const options: Record<string, unknown> = {
        sort: 'name',
        requestKey: `load-chars-${Date.now()}`,
      };
      if (term) {
        options.filter = `name~"${term.replace(/"/g, '\\"')}"`;
      }
      const records = await pb.collection('characters').getList(1, 50, options);
      setAllChars(records.items as unknown as CharacterSummary[]);
    } catch {
      setAllChars([]);
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  }

  function handleSearchChange(value: string) {
    setSearch(value);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchCharacters(value.trim());
    }, 300);
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
        notifications.show({ title: 'Wrong passphrase', message: 'Try again', color: 'bloodRed' });
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

      <Group mb="lg" gap="sm">
        <TextInput
          placeholder="Filter by name..."
          leftSection={<IconSearch size={16} />}
          value={search}
          onChange={(e) => handleSearchChange(e.currentTarget.value)}
          style={{ flex: 1 }}
        />
        <FileButton onChange={handleImport} accept="application/json,.json">
          {(props) => (
            <Button {...props} variant="light" leftSection={<IconUpload size={16} />}>
              Import
            </Button>
          )}
        </FileButton>
      </Group>

      {loading && initialLoad && (
        <Center py="xl"><Loader size="sm" /></Center>
      )}

      {!loading && allChars.length === 0 && !search && (
        <Card padding="lg" style={cardStyle}>
          <Text c="parchment.5" ta="center">
            No characters yet — <Text component="a" href="/create" c="gold" inherit>create your first one</Text>.
          </Text>
        </Card>
      )}

      {!loading && allChars.length === 0 && search && (
        <Text c="parchment.6">No characters matching &ldquo;{search}&rdquo;</Text>
      )}

      <Stack gap="sm">
        {allChars.map((char) => (
          <Card
            key={char.id}
            padding="md"
            style={{ ...cardStyle, cursor: 'pointer' }}
            onClick={() => handleSelect(char)}
          >
            <Group justify="space-between">
              <div>
                <Text fw={700} size="lg">{char.name}</Text>
                <Group gap="xs" mt={4}>
                  <Badge size="sm" variant="light" color="inkBrown">{classLabel(char)}</Badge>
                  {char.raceName && <Badge size="sm" variant="light" color="gold">{char.raceName}</Badge>}
                  {char.backgroundName && <Badge size="sm" variant="light" color="parchment">{char.backgroundName}</Badge>}
                </Group>
              </div>
              {char.passphraseHash && (
                <IconLock size={16} style={{ opacity: 0.5 }} />
              )}
            </Group>
          </Card>
        ))}
      </Stack>

      {/* Passphrase modal */}
      <Modal
        opened={!!promptChar}
        onClose={() => setPromptChar(null)}
        title={
          <Group gap="xs">
            <IconLock size={18} />
            <Text fw={600}>Unlock {promptChar?.name}</Text>
          </Group>
        }
        centered
        styles={{ content: { ...elevatedStyle } }}
      >
        <Stack gap="sm">
          <Text size="sm" c="parchment.5">This character is passphrase-protected.</Text>
          <PasswordInput
            placeholder="Enter passphrase"
            value={passphrase}
            onChange={(e) => setPassphrase(e.currentTarget.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
            leftSection={<IconLock size={16} />}
          />
          <Group justify="flex-end" gap="xs">
            <Button variant="subtle" onClick={() => setPromptChar(null)}>
              Cancel
            </Button>
            <Button onClick={handleVerify} loading={verifying}>
              Unlock
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
}
