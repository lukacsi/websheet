import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { notifications } from '@mantine/notifications';
import { fetchOne, createRecord, updateRecord } from '@/api/pocketbase';
import { lookupEntity } from '@/api/wiki';
import type { Character, CharacterFeat, Skill } from '@/types';
import { abilityModifier } from '@/types';
import { proficiencyBonus as calcProfBonus } from '@/utils/derived-stats';
import { useClasses, useSubclasses } from '@/hooks/useClasses';
import { useRaces } from '@/hooks/useRaces';
import { useBackgrounds } from '@/hooks/useBackgrounds';
import { getSubclass } from '@/api/classes';
import { addRecentCharacter } from '@/utils/recent-characters';

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

export function useCharacterSheet(id: string | undefined) {
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
          const clean = Object.fromEntries(
            Object.entries(c).filter(([, v]) => v != null),
          );
          const merged = { ...DEFAULT_CHARACTER, ...clean };
          setCharacter(merged);
          setSavedId(c.id);
          if (c.id) {
            addRecentCharacter({
              id: c.id,
              name: merged.name,
              raceName: merged.raceName,
              classes: (merged.classes ?? []).map((cl: { className: string; level: number }) => ({ className: cl.className, level: cl.level })),
              level: merged.level,
            });
          }
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
      let charId = savedId;
      if (savedId) {
        await updateRecord('characters', savedId, char as unknown as Record<string, unknown>);
      } else {
        const created = await createRecord<Character>('characters', char as unknown as Record<string, unknown>);
        charId = created.id;
        setSavedId(created.id);
        navigate(`/character/${created.id}`, { replace: true });
      }
      setDirty(false);
      if (charId) {
        addRecentCharacter({
          id: charId,
          name: char.name,
          raceName: char.raceName,
          classes: char.classes.map((c) => ({ className: c.className, level: c.level })),
          level: char.level,
        });
      }
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

  // Dropdown change handlers
  function handleRaceChange(value: string | null) {
    if (!value) {
      update({ raceId: '', raceName: '', subraceId: undefined, subraceName: undefined });
      return;
    }
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
        languages: [...new Set([...(race.languages ?? [])])],
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
        languages: [...new Set([...(race.languages ?? [])])],
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

    if (sc.spellcastingAbility) {
      partial.spellcastingAbility = sc.spellcastingAbility;
    }

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
      partial.spells = [
        ...character.spells.filter((s) => s.source !== 'subclass'),
        ...subSpells,
      ];
    } else if (sc.additionalSpells && sc.additionalSpells.length > 1) {
      partial.spells = character.spells.filter((s) => s.source !== 'subclass');
    }

    update(partial);
  }

  async function handleBackgroundChange(bgId: string | null) {
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

  return {
    character,
    update,
    loading,
    dirty,
    savedId,
    save,
    raceSelectData,
    classSelectData,
    bgSelectData,
    subclassSelectData,
    currentClass,
    handleRaceChange,
    handleClassChange,
    handleSubclassChange,
    handleBackgroundChange,
    shortRest,
    longRest,
    calcInitiative,
    calcProfBonusVal,
  };
}
