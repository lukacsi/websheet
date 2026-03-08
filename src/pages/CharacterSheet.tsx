import { useParams } from 'react-router-dom';
import {
  Container, Text, TextInput, Group, Stack, Grid, Paper,
  LoadingOverlay, Button, Checkbox, Select, NumberInput, Tabs,
} from '@mantine/core';
import { IconMoon, IconCampfire } from '@tabler/icons-react';
import { numOrDefault } from '@/utils/form-helpers';
import { surfaceStyle } from '@/theme/styles';
import { WikiLink } from '@/components/wiki/WikiLink';
import { useCharacterSheet } from '@/hooks/useCharacterSheet';
import styles from './CharacterSheet.module.css';
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
import { SectionTitle } from '@/components/sheet/SectionTitle';

export function CharacterSheet() {
  const { id } = useParams<{ id: string }>();
  const sheet = useCharacterSheet(id);
  const { character, update, loading, dirty, savedId, save } = sheet;

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
      <Paper p="xs" mb="xs" style={surfaceStyle}>
        <Grid gutter="xs">
          <Grid.Col span={{ base: 12, sm: 2.5 }}>
            <TextInput
              value={character.name}
              onChange={(e) => update({ name: e.currentTarget.value })}
              size="sm"
              placeholder="Character Name"
              styles={{ input: { fontFamily: 'Cinzel, serif', fontWeight: 700, fontSize: 22, color: 'var(--mantine-color-gold-3)' } }}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 6, sm: 2 }}>
            <Stack gap={0}>
              <Select
                data={sheet.raceSelectData}
                value={character.subraceId ? `${character.raceId}::${character.subraceId}` : (character.raceId || null)}
                onChange={sheet.handleRaceChange}
                searchable
                clearable
                size="xs"
                placeholder="Race"
              />
              {character.raceName && (
                <Group gap={4}>
                  <WikiLink tagType="race" name={character.raceName} />
                  {character.subraceName && (
                    <Text size="xs" c="parchment.6">({character.subraceName})</Text>
                  )}
                </Group>
              )}
            </Stack>
          </Grid.Col>
          <Grid.Col span={{ base: 6, sm: 1.5 }}>
            <Stack gap={0}>
              <Select
                data={sheet.classSelectData}
                value={character.classes[0]?.classId || null}
                onChange={sheet.handleClassChange}
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
          {sheet.currentClass && sheet.subclassSelectData.length > 0 && (
            <Grid.Col span={{ base: 6, sm: 1.5 }}>
              <Stack gap={0}>
                <Select
                  data={sheet.subclassSelectData}
                  value={character.classes[0]?.subclassId || null}
                  onChange={sheet.handleSubclassChange}
                  searchable
                  clearable
                  size="xs"
                  placeholder={sheet.currentClass.subclassTitle || 'Subclass'}
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
                data={sheet.bgSelectData}
                value={character.backgroundId || null}
                onChange={sheet.handleBackgroundChange}
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

        <Group gap="sm" mt={4} pt={6} style={{ borderTop: '1px solid rgba(191, 157, 100, 0.1)' }}>
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
            onChange={(v) => update({ xp: numOrDefault(v, 0) })}
            min={0}
            size="xs"
            w={90}
            placeholder="XP"
          />
          <Button size="compact-xs" variant="light" color="parchment" onClick={sheet.shortRest} leftSection={<IconMoon size={14} />}>
            Short Rest
          </Button>
          <Button size="compact-xs" variant="light" color="gold" onClick={sheet.longRest} leftSection={<IconCampfire size={14} />}>
            Long Rest
          </Button>
          <div style={{ flex: 1 }} />
          <Text size="xs" c={dirty ? 'gold.4' : 'parchment.6'}>
            {dirty ? 'Unsaved...' : (savedId ? 'Saved' : 'New')}
          </Text>
          <Button size="compact-xs" variant={dirty ? 'filled' : 'light'} color={dirty ? 'gold' : undefined} onClick={() => save(character)}>
            {savedId ? 'Save' : 'Create'}
          </Button>
        </Group>
      </Paper>

      {/* ── 3-Column Body ── */}
      <div className={styles.body}>
        {/* ── Left Sidebar: Abilities + Skills ── */}
        <div className={styles.sidebar}>
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
        <div className={styles.center}>
          <CombatSidebar
            character={character}
            calculatedInitiative={sheet.calcInitiative}
            calculatedProfBonus={sheet.calcProfBonusVal}
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
                  onChange={(field, value) => update({ [field]: value })}
                />
              </div>
            </Stack>
          </Tabs.Panel>
        </Tabs>
        </div>

        {/* ── Right Sidebar ── */}
        <div className={styles.sidebarRight}>
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

    </Container>
  );
}
