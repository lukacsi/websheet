import { Select, Stack, Text, Loader, Group, Badge, Divider } from '@mantine/core';
import { useFormContext } from 'react-hook-form';
import type { WizardFormData } from '@/types/wizard';
import type { Skill, AbilityKey } from '@/types';
import { ABILITY_NAMES } from '@/types';
import { useClasses, useClass } from '@/hooks/useClasses';
import { EntityCard } from './EntityCard';
import { EntryRenderer } from './EntryRenderer';
import { SkillPicker } from './SkillPicker';
import { stripTags } from '@/utils/strip-tags';
import { TaggedText } from '@/components/wiki/TaggedText';
import { WikiLink } from '@/components/wiki/WikiLink';

/** primaryAbility can be AbilityKey[] or [{dex: true, wis: true}] from PocketBase */
function parsePrimaryAbilities(primaryAbility: unknown): string[] {
  if (!primaryAbility || !Array.isArray(primaryAbility)) return [];
  return primaryAbility.flatMap(item => {
    if (typeof item === 'string') return [ABILITY_NAMES[item as AbilityKey] ?? item];
    if (typeof item === 'object' && item !== null) {
      return Object.keys(item)
        .filter(k => (item as Record<string, boolean>)[k])
        .map(k => ABILITY_NAMES[k as AbilityKey] ?? k);
    }
    return [];
  });
}

export function StepClass() {
  const { setValue, watch, formState: { errors } } = useFormContext<WizardFormData>();
  const classId = watch('classId');
  const chosenSkills = watch('chosenSkills');

  const { classes, loading } = useClasses();
  const { cls } = useClass(classId || undefined);

  const selectData = classes.map(c => ({
    value: c.id,
    label: `${c.name} (${c.source})`,
  }));

  function handleClassChange(id: string | null) {
    setValue('classId', id ?? '');
    setValue('chosenSkills', []);
  }

  const badges: string[] = [];
  if (cls) {
    badges.push(`Hit Die: d${cls.hitDie}`);
    const primaryNames = parsePrimaryAbilities(cls.primaryAbility);
    if (primaryNames.length) {
      badges.push(`Primary: ${primaryNames.join(', ')}`);
    }
    if (cls.spellcastingAbility) {
      badges.push(`Casting: ${ABILITY_NAMES[cls.spellcastingAbility]}`);
    }
  }

  // Background skills not known yet at this step, but race skills might be
  const alreadyProficient: Skill[] = [];

  return (
    <Stack gap="md">
      {loading ? (
        <Loader size="sm" />
      ) : (
        <Select
          label="Class"
          placeholder="Search for a class..."
          data={selectData}
          value={classId || null}
          onChange={handleClassChange}
          searchable
          required
          error={errors.classId?.message}
        />
      )}

      {cls && (
        <EntityCard
          name={cls.name}
          source={cls.source}
          badges={badges}
        >
          {/* Clickable class name for wiki exploration */}
          <WikiLink tagType="class" name={cls.name} source={cls.source} displayText={`Explore ${cls.name} details`} />

          {/* Saving throws */}
          <Group gap="xs">
            <Text size="sm" fw={500}>Saving Throws:</Text>
            <Text size="sm">{cls.savingThrows.map(a => ABILITY_NAMES[a]).join(', ')}</Text>
          </Group>

          {/* Armor proficiencies */}
          {cls.armorProficiencies?.length > 0 && (
            <Group gap="xs">
              <Text size="sm" fw={500}>Armor:</Text>
              <Group gap={4}>
                {cls.armorProficiencies.map(a => (
                  <Badge key={a} size="xs" variant="outline">{stripTags(a)}</Badge>
                ))}
              </Group>
            </Group>
          )}

          {/* Weapon proficiencies */}
          {cls.weaponProficiencies?.length > 0 && (
            <Group gap="xs">
              <Text size="sm" fw={500}>Weapons:</Text>
              <Group gap={4}>
                {cls.weaponProficiencies.map(w => (
                  <Badge key={w} size="xs" variant="outline">{stripTags(w)}</Badge>
                ))}
              </Group>
            </Group>
          )}

          {/* Tool proficiencies */}
          {cls.toolProficiencies?.length > 0 && (
            <Group gap="xs">
              <Text size="sm" fw={500}>Tools:</Text>
              <Text size="sm">{cls.toolProficiencies.map((t, i) => (
                <span key={i}>{i > 0 && ', '}<TaggedText text={t} /></span>
              ))}</Text>
            </Group>
          )}

          {/* Starting equipment */}
          {cls.startingEquipment?.length > 0 && (
            <>
              <Divider color="dark.4" />
              <Text size="sm" fw={500}>Starting Equipment</Text>
              <EntryRenderer entries={cls.startingEquipment} />
            </>
          )}

          {/* Skill choices */}
          {cls.skillChoices && (
            <SkillPicker
              from={cls.skillChoices.from}
              count={cls.skillChoices.count}
              chosen={chosenSkills as Skill[]}
              onChange={s => setValue('chosenSkills', s)}
              alreadyProficient={alreadyProficient}
            />
          )}
        </EntityCard>
      )}
    </Stack>
  );
}
