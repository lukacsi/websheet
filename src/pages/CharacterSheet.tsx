import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container, Title, Text, TextInput, Group, Stack, Grid, Paper,
  LoadingOverlay, Button, Checkbox, Select, NumberInput, Tabs,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { fetchOne, createRecord, updateRecord } from '@/api/pocketbase';
import { lookupEntity } from '@/api/wiki';
import type { Character, CharacterFeat, Skill } from '@/types';
import { abilityModifier } from '@/types';
import {
  proficiencyBonus as calcProfBonus,
} from '@/utils/derived-stats';
import { WikiLink } from '@/components/wiki/WikiLink';
import { useClasses, useSubclasses } from '@/hooks/useClasses';
import { useRaces } from '@/hooks/useRaces';
import { useBackgrounds } from '@/hooks/useBackgrounds';
import { getSubclass } from '@/api/classes';
import { AbilityBlock } from '@/components/sheet/AbilityBlock';
import { CombatSidebar } from '@/components/sheet/CombatSidebar';
import { SensesSection } from '@/components/sheet/SensesSection';
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
import { AttacksSection } from '@/components/sheet/AttacksSection';
import { FeaturesSection } from '@/components/sheet/FeaturesSection';
import { PersonalitySection } from '@/components/sheet/PersonalitySection';
import { AppearanceSection } from '@/components/sheet/AppearanceSection';
import { BackstorySection } from '@/components/sheet/BackstorySection';

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
  exhaustionLevel: 0,
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
  attacks: [],
  featureIds: [],
  featureChoices: {},
  feats: [],
  resources: [],
  personalityTraits: '',
  ideals: '',
  bonds: '',
  flaws: '',
  appearance: { age: '', height: '', weight: '', eyes: '', skin: '', hair: '' },
  backstory: '',
  alliesAndOrganizations: '',
  additionalFeaturesAndTraits: '',
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

/* Header height for viewport calc — adjust if header design changes */
const HEADER_HEIGHT = 110;

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

  // Subclass dropdown data
  const currentClass = classes.find((c) => c.id === character.classes[0]?.classId);
  const { subclasses } = useSubclasses(currentClass?.name, currentClass?.source);
  const subclassSelectData = subclasses.map((sc) => ({
    value: sc.id,
    label: `${sc.name} (${sc.source})`,
  }));

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
          // PB returns null for empty JSON fields — strip nulls so defaults survive
          const clean = Object.fromEntries(
            Object.entries(c).filter(([, v]) => v != null),
          );
          setCharacter({ ...DEFAULT_CHARACTER, ...clean });
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
        // Clear subclass spells when class changes
        spells: character.spells.filter((s) => s.source !== 'subclass'),
      });
    } else {
      update({
        classes: [],
        spells: character.spells.filter((s) => s.source !== 'subclass'),
      });
    }
  }

  async function handleSubclassChange(subclassId: string | null) {
    if (!subclassId || !character.classes[0]) {
      update({
        classes: character.classes.map((c, i) =>
          i === 0 ? { ...c, subclassId: undefined, subclassName: undefined } : c
        ),
        spells: character.spells.filter((s) => s.source !== 'subclass'),
      });
      return;
    }

    const sc = await getSubclass(subclassId);
    const partial: Partial<Character> = {
      classes: character.classes.map((c, i) =>
        i === 0 ? { ...c, subclassId: sc.id, subclassName: sc.shortName } : c
      ),
    };

    // Override spellcasting ability if subclass specifies one
    if (sc.spellcastingAbility) {
      partial.spellcastingAbility = sc.spellcastingAbility;
    }

    // Auto-populate subclass spells (domain spells, oath spells, etc.)
    // For single-variant subclasses, use the first (only) entry.
    // Multi-variant subclasses (e.g. Circle of the Land) need a separate choice step.
    if (sc.additionalSpells?.length === 1) {
      const subSpells: typeof character.spells = [];
      const spellEntry = sc.additionalSpells[0];
      const prepared = spellEntry.prepared ?? {};
      for (const [, spellNames] of Object.entries(prepared)) {
        for (const entry of spellNames) {
          const name = typeof entry === 'string' ? entry.split('|')[0] : '';
          if (!name) continue;
          if (!character.spells.some((s) => s.name === name && s.source === 'subclass')) {
            subSpells.push({
              spellId: '',
              name,
              prepared: true,
              alwaysPrepared: true,
              source: 'subclass',
            });
          }
        }
      }
      // Remove old subclass spells and add new ones
      partial.spells = [
        ...character.spells.filter((s) => s.source !== 'subclass'),
        ...subSpells,
      ];
    } else if (sc.additionalSpells && sc.additionalSpells.length > 1) {
      // Multi-variant: clear old subclass spells, user picks variant via feature choices
      partial.spells = character.spells.filter((s) => s.source !== 'subclass');
    }

    update(partial);
  }

  async function handleBackgroundChange(bgId: string | null) {
    // Remove old background's proficiencies and feats before adding new ones
    const oldBg = backgrounds.find((b) => b.id === character.backgroundId);
    const oldSkills = new Set((oldBg?.skillProficiencies ?? []).map((s) => s.toLowerCase()));
    const oldTools = new Set(oldBg?.toolProficiencies ?? []);
    const oldLangs = new Set(oldBg?.languages ?? []);

    const baseSkills = character.skillProficiencies.filter((s) => !oldSkills.has(s));
    const baseTools = character.toolProficiencies.filter((t) => !oldTools.has(t));
    const baseLangs = character.languages.filter((l) => !oldLangs.has(l));
    const baseFeats = character.feats.filter((f) => f.source !== 'background');

    const newBg = backgrounds.find((b) => b.id === bgId);
    if (newBg) {
      // Resolve background feats
      const bgFeats: CharacterFeat[] = [];
      const bgRecord = await fetchOne<{ feats: string[] }>('backgrounds', bgId!);
      if (bgRecord.feats?.length) {
        for (const featRef of bgRecord.feats) {
          const [nameAndSpec, featSource] = featRef.split('|');
          const baseName = nameAndSpec.split(';')[0].trim();
          const titleName = baseName.replace(/\b\w/g, (c: string) => c.toUpperCase());
          const record = await lookupEntity('feat', titleName, featSource?.toUpperCase() || undefined);
          bgFeats.push({
            featId: record?.id as string ?? '',
            name: record?.name as string ?? titleName,
            source: 'background',
          });
        }
      }

      update({
        backgroundId: bgId ?? '',
        backgroundName: newBg.name,
        skillProficiencies: [
          ...new Set([
            ...baseSkills,
            ...(newBg.skillProficiencies ?? []).map((s) => s.toLowerCase() as Skill),
          ]),
        ],
        toolProficiencies: [
          ...new Set([
            ...baseTools,
            ...(newBg.toolProficiencies ?? []),
          ]),
        ],
        languages: [
          ...new Set([
            ...baseLangs,
            ...(newBg.languages ?? []),
          ]),
        ],
        feats: [...baseFeats, ...bgFeats],
      });
    } else {
      update({
        backgroundId: '',
        backgroundName: '',
        skillProficiencies: baseSkills as Skill[],
        toolProficiencies: baseTools,
        languages: baseLangs,
        feats: baseFeats,
      });
    }
  }

  // Rest actions
  function shortRest() {
    update({
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
      exhaustionLevel: Math.max(0, character.exhaustionLevel - 1),
      conditions: character.exhaustionLevel > 1
        ? character.conditions.filter((c) => c === 'exhaustion')
        : [],
      hitDice: character.hitDice.map((hd) => ({
        ...hd,
        used: Math.max(0, hd.used - halfHitDice),
      })),
      spellSlots: {
        max: character.spellSlots.max,
        used: character.spellSlots.max.map(() => 0),
      },
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

  if (loading) {
    return (
      <Container size="xl" py="xl" pos="relative" mih={300}>
        <LoadingOverlay visible />
      </Container>
    );
  }

  return (
    <Container fluid px="md" py={0}>
      {/* ── Header ── */}
      <Paper
        p="xs"
        mb="xs"
        style={{
          backgroundColor: 'var(--mantine-color-dark-7)',
          border: '1px solid var(--mantine-color-dark-5)',
        }}
      >
        <Grid gutter="xs">
          <Grid.Col span={{ base: 12, sm: 2.5 }}>
            <TextInput
              value={character.name}
              onChange={(e) => update({ name: e.currentTarget.value })}
              size="sm"
              placeholder="Character Name"
              styles={{ input: { fontFamily: 'Cinzel, serif', fontWeight: 700, fontSize: 18 } }}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 6, sm: 2 }}>
            <Stack gap={0}>
              <Select
                data={raceSelectData}
                value={character.subraceId ? `${character.raceId}::${character.subraceId}` : (character.raceId || null)}
                onChange={handleRaceChange}
                searchable
                clearable
                size="xs"
                placeholder="Race"
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
          <Grid.Col span={{ base: 6, sm: 1.5 }}>
            <Stack gap={0}>
              <Select
                data={classSelectData}
                value={character.classes[0]?.classId || null}
                onChange={handleClassChange}
                searchable
                clearable
                size="xs"
                placeholder="Class"
              />
              {character.classes[0]?.className && (
                <WikiLink tagType="class" name={character.classes[0].className} />
              )}
            </Stack>
          </Grid.Col>
          {currentClass && subclassSelectData.length > 0 && (
            <Grid.Col span={{ base: 6, sm: 1.5 }}>
              <Stack gap={0}>
                <Select
                  data={subclassSelectData}
                  value={character.classes[0]?.subclassId || null}
                  onChange={handleSubclassChange}
                  searchable
                  clearable
                  size="xs"
                  placeholder={currentClass.subclassTitle || 'Subclass'}
                />
                {character.classes[0]?.subclassName && (
                  <WikiLink tagType="subclass" name={character.classes[0].subclassName} />
                )}
              </Stack>
            </Grid.Col>
          )}
          <Grid.Col span={{ base: 6, sm: 1.5 }}>
            <Stack gap={0}>
              <Select
                data={bgSelectData}
                value={character.backgroundId || null}
                onChange={handleBackgroundChange}
                searchable
                clearable
                size="xs"
                placeholder="Background"
              />
              {character.backgroundName && (
                <WikiLink tagType="background" name={character.backgroundName} />
              )}
            </Stack>
          </Grid.Col>
          <Grid.Col span={{ base: 3, sm: 1.5 }}>
            <TextInput
              value={character.alignment ?? ''}
              onChange={(e) => update({ alignment: e.currentTarget.value })}
              size="xs"
              placeholder="Alignment"
            />
          </Grid.Col>
          <Grid.Col span={{ base: 3, sm: 1.5 }}>
            <TextInput
              value={character.playerName ?? ''}
              onChange={(e) => update({ playerName: e.currentTarget.value })}
              size="xs"
              placeholder="Player"
            />
          </Grid.Col>
        </Grid>

        <Group gap="sm" mt={4}>
          <Checkbox
            label="Inspiration"
            checked={character.inspiration}
            onChange={(e) => update({ inspiration: e.currentTarget.checked })}
            size="xs"
          />
          <Select
            value={character.edition}
            onChange={(v) => update({ edition: (v ?? 'one') as 'one' | 'classic' })}
            data={[
              { value: 'one', label: '2024' },
              { value: 'classic', label: '2014' },
            ]}
            size="xs"
            w={75}
          />
          <NumberInput
            value={character.xp ?? 0}
            onChange={(v) => update({ xp: typeof v === 'number' ? v : 0 })}
            min={0}
            size="xs"
            w={90}
            placeholder="XP"
          />
          <Button size="compact-xs" variant="light" color="teal" onClick={shortRest}>
            Short Rest
          </Button>
          <Button size="compact-xs" variant="light" color="blue" onClick={longRest}>
            Long Rest
          </Button>
          <div style={{ flex: 1 }} />
          <Text size="xs" c={dirty ? 'yellow' : 'dimmed'}>
            {dirty ? 'Unsaved...' : (savedId ? 'Saved' : 'New')}
          </Text>
          <Button size="compact-xs" variant="light" onClick={() => save(character)}>
            {savedId ? 'Save' : 'Create'}
          </Button>
        </Group>
      </Paper>

      {/* ── 3-Column Body ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '260px 1fr 240px',
          gap: 'var(--mantine-spacing-sm)',
          height: `calc(100vh - ${HEADER_HEIGHT}px)`,
        }}
        className="sheet-body"
      >
        {/* ── Left Sidebar: Abilities + Skills ── */}
        <div style={{ overflowY: 'auto', paddingRight: 4 }}>
          <SectionTitle>Abilities</SectionTitle>
          <AbilityBlock
            abilities={character.abilities}
            savingThrowProficiencies={character.savingThrowProficiencies}
            level={character.level}
            onAbilitiesChange={(abilities) => update({ abilities })}
            onSavesChange={(profs) => update({ savingThrowProficiencies: profs })}
          />

          <SectionTitle>Skills</SectionTitle>
          <SkillsSection
            abilities={character.abilities}
            proficiencies={character.skillProficiencies}
            expertise={character.skillExpertise}
            level={character.level}
            onProfChange={(profs) => update({ skillProficiencies: profs })}
            onExpertiseChange={(exp) => update({ skillExpertise: exp })}
          />
        </div>

        {/* ── Center: Combat Stats + Tabbed Content ── */}
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: 0, overflowY: 'auto' }}>
          <CombatSidebar
            character={character}
            calculatedInitiative={calcInitiative}
            calculatedProfBonus={calcProfBonusVal}
            onChange={update}
          />

        <Tabs defaultValue="combat" keepMounted={false} style={{ marginTop: 'var(--mantine-spacing-sm)' }} styles={{
          root: { display: 'flex', flexDirection: 'column', minHeight: 0 },
          panel: { flex: 1, overflowY: 'auto', paddingTop: 'var(--mantine-spacing-sm)' },
          tab: {
            fontFamily: '"Cinzel", serif',
            textTransform: 'uppercase',
            fontSize: 11,
            letterSpacing: '0.5px',
          },
        }}>
          <Tabs.List>
            <Tabs.Tab value="combat">Combat</Tabs.Tab>
            <Tabs.Tab value="spells">Spells</Tabs.Tab>
            <Tabs.Tab value="inventory">Inventory</Tabs.Tab>
            <Tabs.Tab value="features">Features</Tabs.Tab>
            <Tabs.Tab value="notes">Notes</Tabs.Tab>
            <Tabs.Tab value="about">About</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="combat">
            <Stack gap="md">
              <div>
                <SectionTitle>Attacks &amp; Spellcasting</SectionTitle>
                <AttacksSection
                  attacks={character.attacks}
                  items={character.items}
                  abilities={character.abilities}
                  level={character.level}
                  onChange={(attacks) => update({ attacks })}
                />
              </div>
              <div>
                <SectionTitle>Resources</SectionTitle>
                <ResourcesSection
                  resources={character.resources}
                  onChange={(resources) => update({ resources })}
                />
              </div>
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="spells">
            <Stack gap="md">
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
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="inventory">
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
          </Tabs.Panel>

          <Tabs.Panel value="features">
            <SectionTitle>Features &amp; Traits</SectionTitle>
            <FeaturesSection
              classes={character.classes}
              level={character.level}
              raceId={character.raceId}
              raceName={character.raceName}
              backgroundId={character.backgroundId}
              feats={character.feats}
              onFeatsChange={(feats) => update({ feats })}
              featureChoices={character.featureChoices}
              onFeatureChoicesChange={(featureChoices) => update({ featureChoices })}
            />
          </Tabs.Panel>

          <Tabs.Panel value="notes">
            <SectionTitle>Notes</SectionTitle>
            <NotesSection
              notes={character.notes}
              onChange={(notes) => update({ notes })}
            />
          </Tabs.Panel>

          <Tabs.Panel value="about">
            <Stack gap="md">
              <div>
                <SectionTitle>Personality</SectionTitle>
                <PersonalitySection
                  personalityTraits={character.personalityTraits}
                  ideals={character.ideals}
                  bonds={character.bonds}
                  flaws={character.flaws}
                  onChange={(field, value) => update({ [field]: value })}
                />
              </div>
              <div>
                <SectionTitle>Appearance</SectionTitle>
                <AppearanceSection
                  appearance={character.appearance}
                  portraitUrl={character.portraitUrl}
                  onChange={(appearance) => update({ appearance })}
                  onPortraitChange={(portraitUrl) => update({ portraitUrl })}
                />
              </div>
              <div>
                <SectionTitle>Backstory &amp; Allies</SectionTitle>
                <BackstorySection
                  backstory={character.backstory}
                  alliesAndOrganizations={character.alliesAndOrganizations}
                  onBackstoryChange={(backstory) => update({ backstory })}
                  onAlliesChange={(alliesAndOrganizations) => update({ alliesAndOrganizations })}
                />
              </div>
            </Stack>
          </Tabs.Panel>
        </Tabs>
        </div>

        {/* ── Right Sidebar ── */}
        <div style={{ overflowY: 'auto', paddingLeft: 4 }}>
          <SectionTitle>Death Saves</SectionTitle>
          <DeathSavesSection
            deathSaves={character.deathSaves}
            onChange={(deathSaves) => update({ deathSaves })}
          />

          <SectionTitle>Hit Dice</SectionTitle>
          <HitDiceSection
            hitDice={character.hitDice}
            onChange={(hitDice) => update({ hitDice })}
          />

          <SectionTitle>Conditions</SectionTitle>
          <ConditionsSection
            conditions={character.conditions}
            edition={character.edition}
            exhaustionLevel={character.exhaustionLevel}
            onChange={(conditions) => update({ conditions })}
            onExhaustionChange={(exhaustionLevel) => update({ exhaustionLevel })}
          />

          <SectionTitle>Senses</SectionTitle>
          <SensesSection
            abilities={character.abilities}
            skillProficiencies={character.skillProficiencies}
            level={character.level}
          />

          <SectionTitle>Proficiencies &amp; Languages</SectionTitle>
          <ProficienciesSection
            armorProficiencies={character.armorProficiencies}
            weaponProficiencies={character.weaponProficiencies}
            toolProficiencies={character.toolProficiencies}
            languages={character.languages}
            onChange={(field, values) => update({ [field]: values })}
          />
        </div>
      </div>

      {/* ── Responsive: collapse to 2-col / 1-col ── */}
      <style>{`
        @media (max-width: 1023px) {
          .sheet-body {
            grid-template-columns: 240px 1fr !important;
            grid-template-rows: auto !important;
          }
          .sheet-body > div:last-child {
            grid-column: 1 / -1;
          }
        }
        @media (max-width: 767px) {
          .sheet-body {
            grid-template-columns: 1fr !important;
            height: auto !important;
          }
          .sheet-body > div {
            overflow-y: visible !important;
          }
        }
      `}</style>
    </Container>
  );
}
