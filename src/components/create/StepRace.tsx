import { Select, Stack, Text, Loader, Group } from '@mantine/core';
import { useFormContext } from 'react-hook-form';
import type { WizardFormData } from '@/types/wizard';
import { useRaces, useRace } from '@/hooks/useRaces';
import { EntityCard } from './EntityCard';
import { ResistancePicker } from './ResistancePicker';
import { LanguagePicker } from './LanguagePicker';

export function StepRace() {
  const { setValue, watch, formState: { errors } } = useFormContext<WizardFormData>();
  const raceId = watch('raceId');
  const chosenRaceLanguages = watch('chosenRaceLanguages');
  const chosenResistance = watch('chosenResistance');

  const { races, loading } = useRaces();
  const { race } = useRace(raceId || undefined);

  const selectData = races.map(r => ({
    value: r.id,
    label: `${r.name} (${r.source})`,
  }));

  function handleRaceChange(id: string | null) {
    setValue('raceId', id ?? '');
    setValue('chosenRaceLanguages', []);
    setValue('chosenResistance', '');
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

      {!raceId && !loading && (
        <Text size="sm" c="parchment.6" ta="center" py="xl" fs="italic">
          Select a species to see its traits and abilities.
        </Text>
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

          {/* Resistance choices */}
          {race.resistanceChoices && race.resistanceChoices.length > 0 && (
            <ResistancePicker
              choices={race.resistanceChoices}
              chosen={chosenResistance}
              onChange={r => setValue('chosenResistance', r)}
            />
          )}

          {/* Language choices */}
          {race.languageChoices && race.languageChoices.length > 0 && (
            <LanguagePicker
              choices={race.languageChoices}
              chosen={chosenRaceLanguages}
              onChange={l => setValue('chosenRaceLanguages', l)}
              alreadyKnown={race.languages ?? []}
            />
          )}
        </EntityCard>
      )}
    </Stack>
  );
}
