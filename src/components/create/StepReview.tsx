import { Stack, Text, PasswordInput, Table, Group, Divider, Title } from '@mantine/core';
import { useFormContext } from 'react-hook-form';
import type { WizardFormData } from '@/types/wizard';
import type { AbilityKey } from '@/types';
import { ABILITY_NAMES, abilityModifier } from '@/types';
import { useRace } from '@/hooks/useRaces';
import { useClass } from '@/hooks/useClasses';
import { useBackground } from '@/hooks/useBackgrounds';
import { finalAbilities, formatModifier, calculateHp, calculateAc, calculateInitiative, proficiencyBonus } from '@/utils/derived-stats';

const ABILITIES: AbilityKey[] = ['str', 'dex', 'con', 'int', 'wis', 'cha'];

export function StepReview() {
  const { register, watch, formState: { errors } } = useFormContext<WizardFormData>();
  const form = watch();

  const { race } = useRace(form.raceId || undefined);
  const { cls } = useClass(form.classId || undefined);
  const { background } = useBackground(form.backgroundId || undefined);

  // Final abilities = base + background bonuses (no racial bonuses in 2024)
  const abilities = finalAbilities(form.baseAbilities, form.backgroundBonuses, {});
  const hp = cls ? calculateHp(cls.hitDie, abilities.con) : 0;
  const ac = calculateAc(abilities.dex);
  const initiative = calculateInitiative(abilities.dex);
  const profBonus = proficiencyBonus(1);

  return (
    <Stack gap="md">
      <Title order={4}>Character Summary</Title>

      {/* Identity */}
      <Group gap="lg">
        <Stack gap={2}>
          <Text size="xs" c="parchment.5">Name</Text>
          <Text fw={600}>{form.name || '\u2014'}</Text>
        </Stack>
        {form.playerName && (
          <Stack gap={2}>
            <Text size="xs" c="parchment.5">Player</Text>
            <Text>{form.playerName}</Text>
          </Stack>
        )}
      </Group>

      {/* Class, Background, Species */}
      <Group gap="lg">
        <Stack gap={2}>
          <Text size="xs" c="parchment.5">Class</Text>
          <Text fw={500}>{cls?.name ?? '\u2014'} (Level 1)</Text>
        </Stack>
        <Stack gap={2}>
          <Text size="xs" c="parchment.5">Background</Text>
          <Text fw={500}>{background?.name ?? '\u2014'}</Text>
        </Stack>
        <Stack gap={2}>
          <Text size="xs" c="parchment.5">Species</Text>
          <Text fw={500}>{race?.name ?? '\u2014'}</Text>
        </Stack>
      </Group>

      <Divider color="dark.4" />

      {/* Combat stats */}
      <Group gap="lg">
        <Stack gap={2}>
          <Text size="xs" c="parchment.5">HP</Text>
          <Text fw={700} size="lg">{hp}</Text>
        </Stack>
        <Stack gap={2}>
          <Text size="xs" c="parchment.5">AC</Text>
          <Text fw={700} size="lg">{ac}</Text>
        </Stack>
        <Stack gap={2}>
          <Text size="xs" c="parchment.5">Initiative</Text>
          <Text fw={700} size="lg">{formatModifier(initiative)}</Text>
        </Stack>
        <Stack gap={2}>
          <Text size="xs" c="parchment.5">Prof. Bonus</Text>
          <Text fw={700} size="lg">{formatModifier(profBonus)}</Text>
        </Stack>
        {cls && (
          <Stack gap={2}>
            <Text size="xs" c="parchment.5">Hit Die</Text>
            <Text fw={700} size="lg">d{cls.hitDie}</Text>
          </Stack>
        )}
      </Group>

      <Divider color="dark.4" />

      {/* Ability scores table */}
      <Table withTableBorder withColumnBorders verticalSpacing="xs" horizontalSpacing="sm">
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Ability</Table.Th>
            <Table.Th ta="center">Base</Table.Th>
            <Table.Th ta="center">Bonus</Table.Th>
            <Table.Th ta="center">Score</Table.Th>
            <Table.Th ta="center">Modifier</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {ABILITIES.map(ability => {
            const bonus = form.backgroundBonuses[ability] ?? 0;
            return (
              <Table.Tr key={ability}>
                <Table.Td><Text fw={500}>{ABILITY_NAMES[ability]}</Text></Table.Td>
                <Table.Td ta="center"><Text>{form.baseAbilities[ability]}</Text></Table.Td>
                <Table.Td ta="center">
                  {bonus > 0 ? <Text c="inkBrown">+{bonus}</Text> : <Text c="parchment.6">{'\u2014'}</Text>}
                </Table.Td>
                <Table.Td ta="center"><Text fw={600}>{abilities[ability]}</Text></Table.Td>
                <Table.Td ta="center"><Text>{formatModifier(abilityModifier(abilities[ability]))}</Text></Table.Td>
              </Table.Tr>
            );
          })}
        </Table.Tbody>
      </Table>

      {/* Proficiencies */}
      {cls && (
        <>
          <Group gap="xs" wrap="wrap">
            <Text size="sm" fw={500}>Saving Throws:</Text>
            <Text size="sm">{cls.savingThrows.map(a => ABILITY_NAMES[a]).join(', ')}</Text>
          </Group>
          {form.chosenSkills.length > 0 && (
            <Group gap="xs" wrap="wrap">
              <Text size="sm" fw={500}>Skills:</Text>
              <Text size="sm">
                {[
                  ...form.chosenSkills.map(s => s.replace(/\b\w/g, c => c.toUpperCase())),
                  ...(background?.skillProficiencies ?? []).map(s => s.replace(/\b\w/g, c => c.toUpperCase())),
                ].join(', ')}
              </Text>
            </Group>
          )}
        </>
      )}

      <Divider color="dark.4" />

      {/* Passphrase */}
      <Stack gap="xs">
        <Text size="sm" fw={500}>Set a passphrase to protect this character</Text>
        <Text size="xs" c="parchment.6">
          You'll need this passphrase to load and edit your character later.
        </Text>
        <PasswordInput
          label="Passphrase"
          placeholder="At least 4 characters"
          required
          error={errors.passphrase?.message}
          {...register('passphrase')}
        />
        <PasswordInput
          label="Confirm Passphrase"
          placeholder="Repeat your passphrase"
          required
          error={errors.passphraseConfirm?.message}
          {...register('passphraseConfirm')}
        />
      </Stack>
    </Stack>
  );
}
