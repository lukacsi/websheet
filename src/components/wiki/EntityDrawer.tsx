import { useEffect, useState } from 'react';
import { Drawer, Group, ActionIcon, Loader, Text, Stack, ScrollArea } from '@mantine/core';
import { IconArrowLeft, IconX } from '@tabler/icons-react';
import { useWikiDrawer, type WikiTarget } from './WikiDrawerContext';
import { lookupEntity } from '@/api/wiki';
import { EntityDetailView } from './EntityDetailView';

/** Inner content that re-fetches when target changes */
function DrawerContent({ target }: { target: WikiTarget }) {
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setData(null);

    lookupEntity(target.tagType, target.name, target.source).then(result => {
      if (cancelled) return;
      setData(result);
      if (!result) setError('Not found');
      setLoading(false);
    }).catch(err => {
      if (cancelled) return;
      setError(err instanceof Error ? err.message : 'Lookup failed');
      setLoading(false);
    });

    return () => { cancelled = true; };
  }, [target.tagType, target.name, target.source]);

  if (loading) return <Loader size="sm" mx="auto" mt="xl" />;

  if (error) {
    return (
      <Text c="dimmed" ta="center" mt="xl">
        {error === 'Not found'
          ? `No data available for "${target.name}" yet.`
          : error}
      </Text>
    );
  }

  if (data) return <EntityDetailView tagType={target.tagType} data={data} />;

  return null;
}

export function EntityDrawer() {
  const { stack, back, close } = useWikiDrawer();
  const current = stack[stack.length - 1] ?? null;
  const opened = stack.length > 0;

  return (
    <Drawer
      opened={opened}
      onClose={close}
      position="right"
      size="xl"
      withCloseButton={false}
      styles={{
        body: { padding: 0, height: '100%', display: 'flex', flexDirection: 'column' },
        content: { backgroundColor: 'var(--mantine-color-dark-8)' },
        header: { backgroundColor: 'var(--mantine-color-dark-8)' },
      }}
    >
      {/* Sticky header */}
      <Group
        justify="space-between"
        px="md"
        py="sm"
        style={{
          borderBottom: '1px solid var(--mantine-color-dark-5)',
          flexShrink: 0,
        }}
      >
        <Group gap="xs">
          {stack.length > 1 && (
            <ActionIcon variant="subtle" onClick={back} aria-label="Back">
              <IconArrowLeft size={18} />
            </ActionIcon>
          )}
          {current && (
            <Text fw={700} size="lg">{current.name}</Text>
          )}
        </Group>
        <ActionIcon variant="subtle" onClick={close} aria-label="Close">
          <IconX size={18} />
        </ActionIcon>
      </Group>

      {/* Scrollable content — keyed on stack length + name to force remount on nav */}
      <ScrollArea style={{ flex: 1 }} p="md">
        {current && (
          <DrawerContent
            key={`${stack.length}::${current.tagType}::${current.name}::${current.source ?? ''}`}
            target={current}
          />
        )}
      </ScrollArea>
    </Drawer>
  );
}
