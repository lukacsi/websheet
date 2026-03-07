import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container, Title, Text, TextInput, Group, Stack, Grid, Paper,
  LoadingOverlay, Button, Checkbox, Select, NumberInput,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { fetchOne, createRecord, updateRecord } from '@/api/pocketbase';
import type { Character, Skill } from '@/types';
import { abilityModifier } from '@/types';
import {
  proficiencyBonus as calcProfBonus,
  passivePerception,
} from '@/utils/derived-stats';
import { WikiLink } from '@/components/wiki/WikiLink';
import { useClasses } from '@/hooks/useClasses';
import { useRaces } from '@/hooks/useRaces';
import { useBackgrounds } from '@/hooks/useBackgrounds';
import { AbilityScoresSection } from '@/components/sheet/AbilityScoresSection';
import { CombatSection } from '@/components/sheet/CombatSection';
import { SavingThrowsSection } from '@/components/sheet/SavingThrowsSection';
import { SkillsSection } from '@/components/sheet/SkillsSection';
import { ProficienciesSection } from '@/components/sheet/ProficienciesSection';
import { NotesSection } from '@/components/sheet/NotesSection';
import { DeathSavesSection } from '@/components/sheet/DeathSavesSection';
import { HitDiceSection } from '@/components/sheet/HitDiceSection';
import { ConditionsSection } from '@/components/sheet/ConditionsSection';
import { SpellcastingSection } from '@/components/sheet/SpellcastingSection';
import { SpellsSection } from '@/components/sheet/SpellsSection';
import { CurrencySection } from '@/components/sheet/CurrencySection';
import { InventorySection } from '@/components/sheet/InventorySection';
import { ResourcesSection } from '@/components/sheet/ResourcesSection';

const DEFAULT_CHARACTER: Character = {
  name: '',
  edition: 'one',
  raceId: '',
  raceName: '',
  backgroundId: '',
  backgroundName: '',
  classes: [],
  alignment: '',
  abilities: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
  hp: 10,
  maxHp: 10,
  tempHp: 0,
  ac: 10,
  speed: { walk: 30 },
  initiative: 0,
  proficiencyBonus: 2,
  deathSaves: { successes: 0, failures: 0 },
  hitDice: [],
  conditions: [],
  savingThrowProficiencies: [],
  skillProficiencies: [],
  skillExpertise: [],
  armorProficiencies: [],
  weaponProficiencies: [],
  toolProficiencies: [],
  languages: ['Common'],
  spellcastingAbility: undefined,
  spellSlots: { max: [], used: [] },
  spells: [],
  items: [],
  currency: { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 },
  attunementSlots: 3,
  featureIds: [],
  featureChoices: {},
  resources: [],
  level: 1,
  xp: 0,
  inspiration: false,
  notes: '',
};

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <Title
      order={5}
      tt="uppercase"
      c="parchment.4"
      mb="xs"
      pb={4}
      style={{ borderBottom: '1px solid var(--mantine-color-dark-5)' }}
    >
      {children}
    </Title>
  );
}

export function CharacterSheet() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = id === 'new';

  const [character, setCharacter] = useState<Character>(DEFAULT_CHARACTER);
  const [loading, setLoading] = useState(!isNew);
  const [savedId, setSavedId] = useState<string | undefined>(isNew ? undefined : id);
  const [dirty, setDirty] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  // PB-backed dropdown data
  const { classes } = useClasses();
  const { races } = useRaces();
  const { backgrounds } = useBackgrounds();

  // Build race select data including subraces
  const raceSelectData = races.flatMap((r) => {
    const base = { value: r.id, label: `${r.name} (${r.source})` };
    const subs = Array.isArray(r.subraces) ? r.subraces : [];
    if (subs.length > 0) {
      return [
        base,
        ...subs.map((sr) => ({
          value: `${r.id}::${sr.name}`,
          label: `${sr.name} (${r.name})`,
        })),
      ];
    }
    return [base];
  });
  const classSelectData = classes.map((c) => ({ value: c.id, label: `${c.name} (${c.source})` }));
  const bgSelectData = backgrounds.map((b) => ({ value: b.id, label: `${b.name} (${b.source})` }));

  // Load existing character
  useEffect(() => {
    if (isNew) return;
    let cancelled = false;
    setLoading(true);
    fetchOne<Character>('characters', id!)
      .then((c) => {
        if (!cancelled) {
          setCharacter(c);
          setSavedId(c.id);
        }
      })
      .catch(() => {
        if (!cancelled) {
          notifications.show({
            title: 'Error',
            message: 'Character not found',
            color: 'red',
          });
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [id, isNew]);

  // Debounced auto-save
  const save = useCallback(async (char: Character) => {
    try {
      if (savedId) {
        await updateRecord('characters', savedId, char as unknown as Record<string, unknown>);
      } else {
        const created = await createRecord<Character>('characters', char as unknown as Record<string, unknown>);
        setSavedId(created.id);
        navigate(`/character/${created.id}`, { replace: true });
      }
      setDirty(false);
    } catch (err) {
      notifications.show({
        title: 'Save failed',
        message: err instanceof Error ? err.message : 'Unknown error',
        color: 'red',
      });
    }
  }, [savedId, navigate]);

  function update(partial: Partial<Character>) {
    setCharacter((prev) => {
      const next = { ...prev, ...partial };
      setDirty(true);
      clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => save(next), 1500);
      return next;
    });
  }

  // Dropdown change handlers — auto-populate proficiencies
  function handleRaceChange(value: string | null) {
    if (!value) {
      update({ raceId: '', raceName: '', subraceId: undefined, subraceName: undefined });
      return;
    }
    // Check if it's a subrace selection (format: "raceId::subraceName")
    if (value.includes('::')) {
      const [raceId, subraceName] = value.split('::');
      const race = races.find((r) => r.id === raceId);
      if (!race) return;
      update({
        raceId,
        raceName: race.name,
        subraceId: subraceName,
        subraceName,
        speed: race.speed ?? { walk: 30 },
        languages: [
          ...new Set([
            ...(race.languages ?? []),
          ]),
        ],
      });
    } else {
      const race = races.find((r) => r.id === value);
      if (!race) return;
      update({
        raceId: value,
        raceName: race.name,
        subraceId: undefined,
        subraceName: undefined,
        speed: race.speed ?? { walk: 30 },
        languages: [
          ...new Set([
            ...(race.languages ?? []),
          ]),
        ],
      });
    }
  }

  function handleClassChange(classId: string | null) {
    const cls = classes.find((c) => c.id === classId);
    if (cls) {
      update({
        classes: [{
          classId: cls.id,
          className: cls.name,
          level: character.level,
        }],
        savingThrowProficiencies: [...cls.savingThrows],
        armorProficiencies: [...(cls.armorProficiencies ?? [])],
        weaponProficiencies: [...(cls.weaponProficiencies ?? [])],
        toolProficiencies: [...(cls.toolProficiencies ?? [])],
        hitDice: [{ die: cls.hitDie, total: character.level, used: 0 }],
        spellcastingAbility: cls.spellcastingAbility,
      });
    } else {
      update({ classes: [] });
    }
  }

  function handleBackgroundChange(bgId: string | null) {
    const bg = backgrounds.find((b) => b.id === bgId);
    if (bg) {
      update({
        backgroundId: bgId ?? '',
        backgroundName: bg.name,
        skillProficiencies: [
          ...new Set([
            ...character.skillProficiencies,
            ...(bg.skillProficiencies ?? []).map((s) => s.toLowerCase() as Skill),
          ]),
        ],
        toolProficiencies: [
          ...new Set([
            ...character.toolProficiencies,
            ...(bg.toolProficiencies ?? []),
          ]),
        ],
        languages: [
          ...new Set([
            ...character.languages,
            ...(bg.languages ?? []),
          ]),
        ],
      });
    } else {
      update({ backgroundId: '', backgroundName: '' });
    }
  }

  // Rest actions
  function shortRest() {
    update({
      // Recover hit dice (half total, round down) — not auto, just reset used to allow spending
      // Reset short-rest resources
      resources: character.resources.map((r) =>
        r.resetsOn === 'short' ? { ...r, used: 0 } : r
      ),
    });
    notifications.show({ title: 'Short Rest', message: 'Short rest resources recovered', color: 'teal' });
  }

  function longRest() {
    const halfHitDice = Math.max(1, Math.floor(character.level / 2));
    update({
      hp: character.maxHp,
      tempHp: 0,
      deathSaves: { successes: 0, failures: 0 },
      conditions: [],
      // Recover hit dice up to half total (minimum 1)
      hitDice: character.hitDice.map((hd) => ({
        ...hd,
        used: Math.max(0, hd.used - halfHitDice),
      })),
      // Reset all spell slots
      spellSlots: {
        max: character.spellSlots.max,
        used: character.spellSlots.max.map(() => 0),
      },
      // Reset short + long rest resources
      resources: character.resources.map((r) =>
        r.resetsOn === 'short' || r.resetsOn === 'long' || r.resetsOn === 'dawn'
          ? { ...r, used: 0 }
          : r
      ),
    });
    notifications.show({ title: 'Long Rest', message: 'HP restored, spell slots and resources recovered', color: 'teal' });
  }

  // Calculated values
  const calcInitiative = abilityModifier(character.abilities.dex);
  const calcProfBonusVal = calcProfBonus(character.level);
  const passPerception = passivePerception(
    character.abilities.wis,
    character.skillProficiencies.includes('perception'),
    character.level,
  );

  if (loading) {
    return (
      <Container size="xl" py="xl" pos="relative" mih={300}>
        <LoadingOverlay visible />
      </Container>
    );
  }

  return (
    <Container size="xl" py="md">
      {/* Header */}
      <Paper
        p="md"
        mb="md"
        style={{
          backgroundColor: 'var(--mantine-color-dark-7)',
          border: '1px solid var(--mantine-color-dark-5)',
        }}
      >
        <Grid>
          <Grid.Col span={{ base: 12, sm: 3 }}>
            <TextInput
              label="Character Name"
              value={character.name}
              onChange={(e) => update({ name: e.currentTarget.value })}
              size="md"
              styles={{ input: { fontFamily: 'Cinzel, serif', fontWeight: 700, fontSize: 20 } }}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 6, sm: 2 }}>
            <Stack gap={2}>
              <Select
                label="Race"
                data={raceSelectData}
                value={character.subraceId ? `${character.raceId}::${character.subraceId}` : (character.raceId || null)}
                onChange={handleRaceChange}
                searchable
                clearable
                size="xs"
                placeholder="Search..."
              />
              {character.raceName && (
                <Group gap={4}>
                  <WikiLink tagType="race" name={character.raceName} />
                  {character.subraceName && (
                    <Text size="xs" c="dimmed">({character.subraceName})</Text>
                  )}
                </Group>
              )}
            </Stack>
          </Grid.Col>
          <Grid.Col span={{ base: 6, sm: 2 }}>
            <Stack gap={2}>
              <Select
                label="Class"
                data={classSelectData}
                value={character.classes[0]?.classId || null}
                onChange={handleClassChange}
                searchable
                clearable
                size="xs"
                placeholder="Search..."
              />
              {character.classes[0]?.className && (
                <WikiLink tagType="class" name={character.classes[0].className} />
              )}
            </Stack>
          </Grid.Col>
          <Grid.Col span={{ base: 6, sm: 2 }}>
            <Stack gap={2}>
              <Select
                label="Background"
                data={bgSelectData}
                value={character.backgroundId || null}
                onChange={handleBackgroundChange}
                searchable
                clearable
                size="xs"
                placeholder="Search..."
              />
              {character.backgroundName && (
                <WikiLink tagType="background" name={character.backgroundName} />
              )}
            </Stack>
          </Grid.Col>
          <Grid.Col span={{ base: 6, sm: 1.5 }}>
            <TextInput
              label="Alignment"
              value={character.alignment ?? ''}
              onChange={(e) => update({ alignment: e.currentTarget.value })}
              size="xs"
            />
          </Grid.Col>
          <Grid.Col span={{ base: 6, sm: 1.5 }}>
            <TextInput
              label="Player"
              value={character.playerName ?? ''}
              onChange={(e) => update({ playerName: e.currentTarget.value })}
              size="xs"
            />
          </Grid.Col>
        </Grid>
        <Group gap="md" mt="xs">
          <Checkbox
            label="Inspiration"
            checked={character.inspiration}
            onChange={(e) => update({ inspiration: e.currentTarget.checked })}
            size="sm"
          />
          <Select
            label="Edition"
            value={character.edition}
            onChange={(v) => update({ edition: (v ?? 'one') as 'one' | 'classic' })}
            data={[
              { value: 'one', label: '2024' },
              { value: 'classic', label: '2014' },
            ]}
            size="xs"
            w={80}
          />
          <NumberInput
            label="XP"
            value={character.xp ?? 0}
            onChange={(v) => update({ xp: typeof v === 'number' ? v : 0 })}
            min={0}
            size="xs"
            w={100}
          />
        </Group>
      </Paper>

      <Grid gutter="md">
        {/* Left column: Abilities, Saves, Skills */}
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Stack gap="md">
            <div>
              <SectionTitle>Ability Scores</SectionTitle>
              <AbilityScoresSection
                abilities={character.abilities}
                onChange={(abilities) => update({ abilities })}
              />
            </div>

            <div>
              <SectionTitle>Saving Throws</SectionTitle>
              <SavingThrowsSection
                abilities={character.abilities}
                proficiencies={character.savingThrowProficiencies}
                level={character.level}
                onChange={(profs) => update({ savingThrowProficiencies: profs })}
              />
            </div>

            <div>
              <SectionTitle>Skills</SectionTitle>
              <SkillsSection
                abilities={character.abilities}
                proficiencies={character.skillProficiencies}
                expertise={character.skillExpertise}
                level={character.level}
                onProfChange={(profs) => update({ skillProficiencies: profs })}
                onExpertiseChange={(exp) => update({ skillExpertise: exp })}
              />
              <Text size="xs" c="dimmed" mt={4}>
                Passive Perception: {passPerception}
              </Text>
            </div>
          </Stack>
        </Grid.Col>

        {/* Right column */}
        <Grid.Col span={{ base: 12, md: 8 }}>
          <Stack gap="md">
            <div>
              <Group justify="space-between" align="flex-end">
                <SectionTitle>Combat</SectionTitle>
                <Group gap="xs" mb="xs">
                  <Button size="compact-sm" variant="light" color="teal" onClick={shortRest}>
                    Short Rest
                  </Button>
                  <Button size="compact-sm" variant="light" color="blue" onClick={longRest}>
                    Long Rest
                  </Button>
                </Group>
              </Group>
              <CombatSection
                character={character}
                calculatedInitiative={calcInitiative}
                calculatedProfBonus={calcProfBonusVal}
                onChange={update}
              />
            </div>

            <Grid gutter="md">
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <SectionTitle>Death Saves</SectionTitle>
                <DeathSavesSection
                  deathSaves={character.deathSaves}
                  onChange={(deathSaves) => update({ deathSaves })}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <SectionTitle>Hit Dice</SectionTitle>
                <HitDiceSection
                  hitDice={character.hitDice}
                  onChange={(hitDice) => update({ hitDice })}
                />
              </Grid.Col>
            </Grid>

            <div>
              <SectionTitle>Conditions</SectionTitle>
              <ConditionsSection
                conditions={character.conditions}
                onChange={(conditions) => update({ conditions })}
              />
            </div>

            <div>
              <SectionTitle>Spellcasting</SectionTitle>
              <SpellcastingSection
                spellcastingAbility={character.spellcastingAbility}
                abilities={character.abilities}
                level={character.level}
                spellSlots={character.spellSlots}
                onAbilityChange={(ability) => update({ spellcastingAbility: ability })}
                onSlotsChange={(spellSlots) => update({ spellSlots })}
              />
            </div>

            <div>
              <SectionTitle>Spells</SectionTitle>
              <SpellsSection
                spells={character.spells}
                onChange={(spells) => update({ spells })}
              />
            </div>

            <div>
              <SectionTitle>Proficiencies &amp; Languages</SectionTitle>
              <ProficienciesSection
                armorProficiencies={character.armorProficiencies}
                weaponProficiencies={character.weaponProficiencies}
                toolProficiencies={character.toolProficiencies}
                languages={character.languages}
                onChange={(field, values) => update({ [field]: values })}
              />
            </div>

            <Grid gutter="md">
              <Grid.Col span={{ base: 12, sm: 7 }}>
                <SectionTitle>Inventory</SectionTitle>
                <InventorySection
                  items={character.items}
                  attunementSlots={character.attunementSlots}
                  onChange={(items) => update({ items })}
                  onAttunementChange={(attunementSlots) => update({ attunementSlots })}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 5 }}>
                <SectionTitle>Currency</SectionTitle>
                <CurrencySection
                  currency={character.currency}
                  onChange={(currency) => update({ currency })}
                />
              </Grid.Col>
            </Grid>

            <div>
              <SectionTitle>Resources</SectionTitle>
              <ResourcesSection
                resources={character.resources}
                onChange={(resources) => update({ resources })}
              />
            </div>

            <div>
              <SectionTitle>Notes</SectionTitle>
              <NotesSection
                notes={character.notes}
                onChange={(notes) => update({ notes })}
              />
            </div>
          </Stack>
        </Grid.Col>
      </Grid>

      {/* Save indicator */}
      <Group justify="flex-end" mt="md">
        <Text size="xs" c={dirty ? 'yellow' : 'dimmed'}>
          {dirty ? 'Unsaved changes...' : (savedId ? 'All changes saved' : 'New character')}
        </Text>
        <Button
          size="xs"
          variant="light"
          onClick={() => save(character)}
        >
          {savedId ? 'Save Now' : 'Create Character'}
        </Button>
      </Group>
    </Container>
  );
}
