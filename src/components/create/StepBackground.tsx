import { Select, Stack, Text, Loader, Group, Badge } from '@mantine/core';
import { useFormContext } from 'react-hook-form';
import type { WizardFormData } from '@/types/wizard';
import { useBackgrounds, useBackground } from '@/hooks/useBackgrounds';
import { EntityCard } from './EntityCard';
import { stripTags } from '@/utils/strip-tags';
import { EntryRenderer } from './EntryRenderer';
import { BackgroundBonusPicker } from './BackgroundBonusPicker';
import { TaggedText } from '@/components/wiki/TaggedText';
import { parseBackgroundAbilities } from '@/utils/parse-background-abilities';
import { ToolProficiencyPicker } from './ToolProficiencyPicker';
import { LanguagePicker } from './LanguagePicker';

/** Parse feat strings like "tireless reveler|abh" → "Tireless Reveler" */
function formatFeat(feat: string): string {
  const name = feat.split('|')[0];
  return name.replace(/\b\w/g, c => c.toUpperCase());
}

function capitalize(s: string): string {
  return s.replace(/\b\w/g, c => c.toUpperCase());
}

export function StepBackground() {
  const { setValue, watch, formState: { errors } } = useFormContext<WizardFormData>();
  const backgroundId = watch('backgroundId');
  const bonusMode = watch('backgroundBonusMode');
  const bonuses = watch('backgroundBonuses');
  const chosenBackgroundTools = watch('chosenBackgroundTools');
  const chosenBackgroundLanguages = watch('chosenBackgroundLanguages');

  const { backgrounds, loading } = useBackgrounds();
  const { background } = useBackground(backgroundId || undefined);

  const eligible = background ? parseBackgroundAbilities(background.entries) : [];

  const selectData = backgrounds.map(b => ({
    value: b.id!,
    label: `${b.name} (${b.source})`,
  }));

  function handleBackgroundChange(id: string | null) {
    setValue('backgroundId', id ?? '');
    setValue('backgroundBonusMode', '+2/+1');
    setValue('backgroundBonuses', {});
    setValue('chosenBackgroundTools', []);
    setValue('chosenBackgroundLanguages', []);
  }

  return (
    <Stack gap="md">
      {loading ? (
        <Loader size="sm" />
      ) : (
        <Select
          label="Background"
          placeholder="Search for a background..."
          data={selectData}
          value={backgroundId || null}
          onChange={handleBackgroundChange}
          searchable
          required
          error={errors.backgroundId?.message}
        />
      )}

      {background && (
        <EntityCard
          name={background.name}
          source={background.source}
        >
          {/* Ability score bonus picker */}
          {eligible.length > 0 && (
            <BackgroundBonusPicker
              eligible={eligible}
              mode={bonusMode}
              bonuses={bonuses}
              onModeChange={m => setValue('backgroundBonusMode', m)}
              onBonusesChange={b => setValue('backgroundBonuses', b)}
            />
          )}

          {/* Skill proficiencies */}
          {background.skillProficiencies?.length > 0 && (
            <Group gap="xs">
              <Text size="sm" fw={500}>Skill Proficiencies:</Text>
              <Text size="sm">
                {background.skillProficiencies.map(s => capitalize(stripTags(s))).join(', ')}
              </Text>
            </Group>
          )}

          {/* Tool proficiencies */}
          {background.toolProficiencies && background.toolProficiencies.length > 0 && (
            <Group gap="xs">
              <Text size="sm" fw={500}>Tool Proficiencies:</Text>
              <Text size="sm">{background.toolProficiencies.map(t => stripTags(t)).join(', ')}</Text>
            </Group>
          )}

          {/* Tool proficiency choices */}
          {background.toolChoices && background.toolChoices.length > 0 && (
            <ToolProficiencyPicker
              choices={background.toolChoices}
              chosen={chosenBackgroundTools}
              onChange={t => setValue('chosenBackgroundTools', t)}
            />
          )}

          {/* Languages */}
          {background.languages && background.languages.length > 0 && (
            <Group gap="xs">
              <Text size="sm" fw={500}>Languages:</Text>
              <Text size="sm">{background.languages.join(', ')}</Text>
            </Group>
          )}

          {/* Language choices */}
          {background.languageChoices && background.languageChoices.length > 0 && (
            <LanguagePicker
              choices={background.languageChoices}
              chosen={chosenBackgroundLanguages}
              onChange={l => setValue('chosenBackgroundLanguages', l)}
              alreadyKnown={background.languages ?? []}
            />
          )}

          {/* Feats */}
          {background.feats && background.feats.length > 0 && (
            <Group gap="xs">
              <Text size="sm" fw={500}>Origin Feat:</Text>
              <Group gap={4}>
                {background.feats.map(f => (
                  <Badge key={f} size="sm" variant="light" color="inkBrown">{formatFeat(f)}</Badge>
                ))}
              </Group>
            </Group>
          )}

          {/* Feature */}
          {background.feature && (
            <Stack gap="xs">
              <Text size="sm" fw={500}>Feature: <TaggedText text={background.feature.name} /></Text>
              <EntryRenderer entries={background.feature.entries ?? []} />
            </Stack>
          )}

          {/* Full entries */}
          {background.entries?.length > 0 && (
            <EntryRenderer entries={background.entries} />
          )}
        </EntityCard>
      )}
    </Stack>
  );
}
