import { useEffect } from 'react';
import { Drawer, Group, ActionIcon, Loader, Text, Stack } from '@mantine/core';
import { IconArrowLeft, IconX } from '@tabler/icons-react';
import { useWikiDrawer } from './WikiDrawerContext';
import { useEntityLookup } from '@/hooks/useEntityLookup';
import { EntityDetailView } from './EntityDetailView';

export function EntityDrawer() {
  const { stack, back, close } = useWikiDrawer();
  const current = stack[stack.length - 1] ?? null;
  const opened = stack.length > 0;

  const { data, loading, error, lookup } = useEntityLookup();

  useEffect(() => {
    if (current) {
      lookup(current.tagType, current.name, current.source);
    }
  }, [current, lookup]);

  return (
    <Drawer
      opened={opened}
      onClose={close}
      position="right"
      size="lg"
      withCloseButton={false}
      styles={{
        body: { padding: 'var(--mantine-spacing-md)', height: '100%' },
        content: { backgroundColor: 'var(--mantine-color-dark-8)' },
        header: { backgroundColor: 'var(--mantine-color-dark-8)' },
      }}
    >
      <Stack gap="md" h="100%">
        {/* Header */}
        <Group justify="space-between">
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

        {/* Content */}
        {loading && <Loader size="sm" mx="auto" mt="xl" />}
        {error && !loading && (
          <Text c="dimmed" ta="center" mt="xl">
            {error === 'Not found' && current
              ? `No data available for "${current.name}" yet.`
              : error}
          </Text>
        )}
        {data && !loading && current && (
          <EntityDetailView tagType={current.tagType} data={data} />
        )}
      </Stack>
    </Drawer>
  );
}
