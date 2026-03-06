import { Select, Stack, Text, Loader, Group } from '@mantine/core';
import { useFormContext } from 'react-hook-form';
import type { WizardFormData } from '@/types/wizard';
import { useRaces, useRace } from '@/hooks/useRaces';
import { EntityCard } from './EntityCard';

export function StepRace() {
  const { setValue, watch, formState: { errors } } = useFormContext<WizardFormData>();
  const raceId = watch('raceId');

  const { races, loading } = useRaces();
  const { race } = useRace(raceId || undefined);

  const selectData = races.map(r => ({
    value: r.id,
    label: `${r.name} (${r.source})`,
  }));

  function handleRaceChange(id: string | null) {
    setValue('raceId', id ?? '');
  }

  const badges: string[] = [];
  if (race) {
    if (race.size?.length) badges.push(`Size: ${race.size.join('/')}`);
    if (race.speed?.walk) badges.push(`Speed: ${race.speed.walk} ft`);
    if (race.darkvision) badges.push(`Darkvision: ${race.darkvision} ft`);
  }

  return (
    <Stack gap="md">
      {loading ? (
        <Loader size="sm" />
      ) : (
        <Select
          label="Species"
          placeholder="Search for a species..."
          data={selectData}
          value={raceId || null}
          onChange={handleRaceChange}
          searchable
          required
          error={errors.raceId?.message}
        />
      )}

      {race && (
        <EntityCard
          name={race.name}
          source={race.source}
          badges={badges}
          entries={race.traits}
        >
          {/* Languages */}
          {race.languages?.length > 0 && (
            <Group gap="xs">
              <Text size="sm" fw={500}>Languages:</Text>
              <Text size="sm">{race.languages.join(', ')}</Text>
            </Group>
          )}

          {/* Skill proficiencies */}
          {race.skillProficiencies && race.skillProficiencies.length > 0 && (
            <Group gap="xs">
              <Text size="sm" fw={500}>Skill Proficiencies:</Text>
              <Text size="sm">{race.skillProficiencies.join(', ')}</Text>
            </Group>
          )}
        </EntityCard>
      )}
    </Stack>
  );
}
