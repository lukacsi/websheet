#!/usr/bin/env tsx
/**
 * 5e.tools Data Importer
 *
 * Clones/pulls the 5etools-mirror-3 repo and seeds PocketBase collections.
 * Safe to re-run — uses upsert logic (delete + recreate by name+source).
 *
 * Usage:
 *   pnpm run import              # full import
 *   pnpm run import -- --only spells,races   # import specific collections
 *   pnpm run import -- --update  # git pull before importing
 */

import { execSync } from "child_process";
import { existsSync, readFileSync, readdirSync } from "fs";
import { join } from "path";

const PB_URL = process.env.PB_URL || "http://127.0.0.1:8090";
const PB_EMAIL = process.env.PB_EMAIL || "admin@websheet.local";
const PB_PASSWORD = process.env.PB_PASSWORD || "Passw0rd2026x";
const DATA_DIR = join(import.meta.dirname, "..", "data", "5etools-src");
const REPO_URL = "https://github.com/5etools-mirror-3/5etools-src.git";

// --- CLI args ---
const args = process.argv.slice(2);
const onlyIdx = args.findIndex((a) => a === "--only" || a.startsWith("--only="));
const onlyFlag = onlyIdx >= 0
  ? (args[onlyIdx].includes("=") ? args[onlyIdx].split("=")[1] : args[onlyIdx + 1])
  : null;
const onlyCollections = onlyFlag ? onlyFlag.split(",") : null;
const shouldUpdate = args.includes("--update");
const shouldClone = args.includes("--clone") || !existsSync(DATA_DIR);

// --- Auth ---
let token = "";

async function authenticate(): Promise<void> {
  const resp = await fetch(
    `${PB_URL}/api/collections/_superusers/auth-with-password`,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ identity: PB_EMAIL, password: PB_PASSWORD }),
    }
  );
  if (!resp.ok) throw new Error(`Auth failed: ${resp.status} ${await resp.text()}`);
  const data = await resp.json();
  token = data.token;
  console.log("Authenticated with PocketBase.");
}

// --- PocketBase API helpers ---
async function pbGet(collection: string, filter: string): Promise<any[]> {
  const resp = await fetch(
    `${PB_URL}/api/collections/${collection}/records?filter=${encodeURIComponent(filter)}&perPage=1`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (!resp.ok) return [];
  const data = await resp.json();
  return data.items || [];
}

async function pbCreate(collection: string, body: Record<string, unknown>): Promise<string> {
  const resp = await fetch(
    `${PB_URL}/api/collections/${collection}/records`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    }
  );
  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(`Create failed in ${collection}: ${resp.status} ${err}`);
  }
  const data = await resp.json();
  return data.id;
}

async function pbUpdate(collection: string, id: string, body: Record<string, unknown>): Promise<void> {
  const resp = await fetch(
    `${PB_URL}/api/collections/${collection}/records/${id}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    }
  );
  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(`Update failed in ${collection}/${id}: ${resp.status} ${err}`);
  }
}

async function upsert(
  collection: string,
  record: Record<string, unknown>,
  keyFields: string[] = ["name", "source"]
): Promise<"created" | "updated"> {
  const filter = keyFields
    .map((k) => `${k}="${String(record[k]).replace(/"/g, '\\"')}"`)
    .join(" && ");
  const existing = await pbGet(collection, filter);
  if (existing.length > 0) {
    await pbUpdate(collection, existing[0].id, record);
    return "updated";
  }
  await pbCreate(collection, record);
  return "created";
}

// --- Git operations ---
function cloneRepo(): void {
  console.log(`Cloning 5etools-src (shallow)...`);
  execSync(
    `git clone --depth 1 --filter=blob:none --sparse "${REPO_URL}" "${DATA_DIR}"`,
    { stdio: "inherit" }
  );
  execSync("git sparse-checkout set data", { cwd: DATA_DIR, stdio: "inherit" });
  console.log("Clone complete.");
}

function updateRepo(): void {
  console.log("Pulling latest 5etools data...");
  execSync("git pull --ff-only", { cwd: DATA_DIR, stdio: "inherit" });
  console.log("Update complete.");
}

// --- JSON reading helpers ---
function readJson(path: string): any {
  return JSON.parse(readFileSync(path, "utf-8"));
}

function readJsonDir(dir: string): any[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith(".json") && !f.startsWith("foundry"))
    .map((f) => readJson(join(dir, f)));
}

// --- Edition detection ---
function edition(source: string, editionField?: string): string {
  if (editionField === "one") return "one";
  if (editionField === "classic") return "classic";
  // XPHB, XDMG, XMM = 2024 "one D&D" editions
  if (source.startsWith("X") && ["XPHB", "XDMG", "XMM"].includes(source)) return "one";
  return "classic";
}

// --- _copy resolution ---

/**
 * Build a composite lookup key for an entity.
 * classFeature/subclassFeature need className+classSource+level to be unique.
 * subclass needs className+classSource.
 */
function entityKey(entityType: string, e: Record<string, any>): string {
  const name = e.name ?? "";
  const source = e.source ?? "";
  if (entityType === "classFeature" || entityType === "subclassFeature") {
    return `${name}|${source}|${e.className ?? ""}|${e.classSource ?? ""}|${e.level ?? ""}`;
  }
  if (entityType === "subclass") {
    return `${name}|${source}|${e.className ?? ""}|${e.classSource ?? ""}`;
  }
  return `${name}|${source}`;
}

/** Deep-replace text in a value (strings, arrays, objects — recursive) */
function replaceInValue(val: any, find: RegExp, replacement: string): any {
  if (typeof val === "string") return val.replace(find, replacement);
  if (Array.isArray(val)) return val.map((v) => replaceInValue(v, find, replacement));
  if (typeof val === "object" && val !== null) {
    const out: Record<string, any> = {};
    for (const [k, v] of Object.entries(val)) {
      out[k] = replaceInValue(v, find, replacement);
    }
    return out;
  }
  return val;
}

/** Apply a single _mod operation to a resolved entity */
function applyMod(target: any, field: string, op: any): void {
  const mode: string = op.mode;

  // Top-level operations (field === "_")
  if (field === "_") {
    if (mode === "setProp") {
      if (op.value === null || op.value === undefined) delete target[op.prop];
      else target[op.prop] = op.value;
    }
    return;
  }

  // replaceTxt — recursive text replacement
  if (mode === "replaceTxt") {
    const flags = op.flags || "g";
    const regex = new RegExp(op.replace, flags);
    if (field === "*") {
      for (const k of Object.keys(target)) {
        target[k] = replaceInValue(target[k], regex, op.with ?? "");
      }
    } else if (target[field] !== undefined) {
      target[field] = replaceInValue(target[field], regex, op.with ?? "");
    }
    return;
  }

  // All remaining modes operate on arrays
  if (!Array.isArray(target[field])) target[field] = target[field] != null ? [target[field]] : [];
  const arr: any[] = target[field];

  switch (mode) {
    case "replaceArr": {
      const idx = arr.findIndex((x: any) => (typeof x === "object" && x?.name === op.replace) || x === op.replace);
      if (idx >= 0) {
        const items = Array.isArray(op.items) ? op.items : [op.items];
        arr.splice(idx, 1, ...items);
      }
      break;
    }
    case "appendArr": {
      const items = Array.isArray(op.items) ? op.items : [op.items];
      arr.push(...items);
      break;
    }
    case "prependArr": {
      const items = Array.isArray(op.items) ? op.items : [op.items];
      arr.unshift(...items);
      break;
    }
    case "removeArr": {
      const names = Array.isArray(op.names) ? op.names : [op.names];
      for (const name of names) {
        const idx = arr.findIndex((x: any) => (typeof x === "object" && x?.name === name) || x === name);
        if (idx >= 0) arr.splice(idx, 1);
      }
      break;
    }
    case "insertArr": {
      const items = Array.isArray(op.items) ? op.items : [op.items];
      arr.splice(op.index ?? 0, 0, ...items);
      break;
    }
    case "appendIfNotExistsArr": {
      const items = Array.isArray(op.items) ? op.items : [op.items];
      for (const item of items) {
        if (typeof item === "string") {
          if (!arr.includes(item)) arr.push(item);
        } else {
          if (!arr.some((x: any) => x?.name === item?.name)) arr.push(item);
        }
      }
      break;
    }
    // Monster-specific spell/skill ops — merge into existing data
    case "addSkills": {
      if (!target.skill) target.skill = {};
      Object.assign(target.skill, op.skills);
      break;
    }
    case "addSpells":
    case "replaceSpells":
    case "removeSpells":
      // These modify spellcasting entries — just merge at the top level
      // since our creature importer stores raw JSON anyway
      break;
  }
}

/** Resolve a _copy entity against its base. Returns a fully merged entity. */
function resolveCopy(entity: any, base: any): any {
  const resolved = structuredClone(base);
  const copyMeta = entity._copy;

  // Apply _mod operations
  if (copyMeta._mod) {
    for (const [field, ops] of Object.entries(copyMeta._mod)) {
      const opsList = Array.isArray(ops) ? ops : [ops];
      for (const op of opsList) {
        if (typeof op === "object" && op !== null && "mode" in op) {
          applyMod(resolved, field, op);
        }
      }
    }
  }

  // Merge top-level fields from child entity (overrides base)
  const preserveKeys = new Set(Object.keys(copyMeta._preserve ?? {}));
  for (const [key, val] of Object.entries(entity)) {
    if (key === "_copy") continue;
    resolved[key] = val;
  }
  // _preserve: if the child doesn't have these fields, remove them from result
  // (prevents base's values from leaking through for preserved fields)
  for (const pk of preserveKeys) {
    if (!(pk in entity)) {
      delete resolved[pk];
    }
  }

  // Clean internal fields
  delete resolved._copy;
  delete resolved._isCopy;
  return resolved;
}

/**
 * Resolve all _copy entities in an array. Handles chains (iterative).
 * Returns a new array with all entities resolved.
 */
function resolveAllCopies(entities: any[], entityType: string): any[] {
  const lookup = new Map<string, any>();
  const pending: any[] = [];

  // First pass: index non-_copy entities
  for (const e of entities) {
    if (!e || typeof e !== "object") continue;
    if (e._copy) {
      pending.push(e);
    } else {
      lookup.set(entityKey(entityType, e), e);
    }
  }

  if (pending.length === 0) return entities;

  // Iterative resolution (handles chains up to depth ~10)
  let unresolved = pending;
  const resolved: any[] = [];
  for (let round = 0; round < 10 && unresolved.length > 0; round++) {
    const stillUnresolved: any[] = [];
    for (const e of unresolved) {
      const baseKey = entityKey(entityType, e._copy);
      const base = lookup.get(baseKey);
      if (base) {
        const r = resolveCopy(e, base);
        lookup.set(entityKey(entityType, r), r);
        resolved.push(r);
      } else {
        stillUnresolved.push(e);
      }
    }
    if (stillUnresolved.length === unresolved.length) break; // no progress
    unresolved = stillUnresolved;
  }

  if (unresolved.length > 0) {
    console.warn(`  [warn] ${unresolved.length} ${entityType} _copy entities unresolvable`);
  }

  // Return non-_copy entities + resolved copies
  return [...entities.filter((e) => !e?._copy), ...resolved];
}

// --- Data parsing helpers ---

const ALL_SKILLS = [
  "acrobatics", "animal handling", "arcana", "athletics",
  "deception", "history", "insight", "intimidation",
  "investigation", "medicine", "nature", "perception",
  "performance", "persuasion", "religion", "sleight of hand",
  "stealth", "survival",
];

/** Parse 5e.tools skill proficiency entry into {from, count} or null */
function parseSkillChoices(skill: any): { from: string[]; count: number } | null {
  if (!skill) return null;
  // Standard format: {"choose": {"from": [...], "count": N}}
  if (skill.choose) return skill.choose;
  // "Any" format: {"any": N} — choose N from all skills
  if (skill.any) return { from: ALL_SKILLS, count: skill.any };
  return null;
}

// --- Importers ---

async function importSpells(): Promise<{ created: number; updated: number }> {
  const dataDir = join(DATA_DIR, "data", "spells");
  const files = readJsonDir(dataDir);
  let created = 0, updated = 0;

  // Aggregate all spells across files, then resolve _copy cross-file
  const allRaw: any[] = [];
  for (const file of files) allRaw.push(...(file.spell || []));
  const allSpells = resolveAllCopies(allRaw, "spell");

  for (const s of allSpells) {
      if (s.level == null || !s.school) continue;
      const classes: string[] = [];
      if (s.classes?.fromClassList) {
        for (const c of s.classes.fromClassList) {
          classes.push(c.name);
        }
      }

      const record = {
        name: s.name,
        source: s.source,
        edition: edition(s.source, s.edition),
        level: s.level,
        school: s.school,
        time: s.time || [],
        range: s.range || {},
        components: s.components || {},
        duration: s.duration || [],
        entries: s.entries || [],
        entriesHigherLevel: s.entriesHigherLevel || null,
        isRitual: !!s.meta?.ritual,
        damageInflict: s.damageInflict || null,
        conditionInflict: s.conditionInflict || null,
        savingThrow: s.savingThrow || null,
        spellAttack: s.spellAttack || null,
        classes: [...new Set(classes)],
      };

      const result = await upsert("spells", record);
      if (result === "created") created++;
      else updated++;
  }
  return { created, updated };
}

async function importClasses(): Promise<{ created: number; updated: number }> {
  const dataDir = join(DATA_DIR, "data", "class");
  const files = readJsonDir(dataDir);
  let created = 0, updated = 0;

  // Aggregate all entity types across files, then resolve _copy cross-file
  const allClasses: any[] = [];
  const allSubclasses: any[] = [];
  const allClassFeatures: any[] = [];
  const allSubclassFeatures: any[] = [];
  for (const file of files) {
    allClasses.push(...(file.class || []));
    allSubclasses.push(...(file.subclass || []));
    allClassFeatures.push(...(file.classFeature || []));
    allSubclassFeatures.push(...(file.subclassFeature || []));
  }

  // Import classes
  for (const c of resolveAllCopies(allClasses, "class")) {
    const record = {
      name: c.name,
      source: c.source,
      edition: edition(c.source, c.edition),
      hitDie: c.hd?.faces || 8,
      primaryAbility: c.primaryAbility || [],
      savingThrows: c.proficiency || [],
      spellcastingAbility: c.spellcastingAbility || null,
      casterProgression: c.casterProgression || null,
      armorProficiencies: c.startingProficiencies?.armor || [],
      weaponProficiencies: c.startingProficiencies?.weapons || [],
      toolProficiencies: c.startingProficiencies?.tools || [],
      skillChoices: parseSkillChoices(c.startingProficiencies?.skills?.[0]),
      startingEquipment: c.startingEquipment?.entries || c.startingEquipment?.defaultData || [],
      classFeatures: c.classFeatures || [],
      subclassTitle: c.subclassTitle || "Subclass",
      multiclassing: c.multiclassing || null,
      cantripProgression: c.cantripProgression || null,
      preparedSpellsProgression: c.preparedSpellsProgression || null,
      spellSlotProgression: c.classTableGroups
        ?.find((g: any) => g.rowsSpellProgression)
        ?.rowsSpellProgression || null,
      classTableGroups: c.classTableGroups || null,
    };

    const result = await upsert("classes", record);
    if (result === "created") created++;
    else updated++;
  }

  // Import subclasses
  for (const sc of resolveAllCopies(allSubclasses, "subclass")) {
    const record = {
      name: sc.name,
      shortName: sc.shortName || sc.name,
      source: sc.source,
      className: sc.className,
      classSource: sc.classSource,
      edition: edition(sc.source, sc.edition),
      features: sc.subclassFeatures || [],
      spellcastingAbility: sc.spellcastingAbility || null,
    };

    const result = await upsert("subclasses", record, [
      "name",
      "source",
      "className",
      "classSource",
    ]);
    if (result === "created") created++;
    else updated++;
  }

  // Import class features
  for (const cf of resolveAllCopies(allClassFeatures, "classFeature")) {
    const record = {
      name: cf.name,
      source: cf.source,
      className: cf.className,
      classSource: cf.classSource,
      level: cf.level,
      entries: cf.entries || [],
      isSubclassFeature: false,
      subclassName: null,
    };

    const result = await upsert("class_features", record, [
      "name",
      "source",
      "className",
      "classSource",
      "level",
    ]);
    if (result === "created") created++;
    else updated++;
  }

  // Import subclass features
  for (const scf of resolveAllCopies(allSubclassFeatures, "subclassFeature")) {
    const record = {
      name: scf.name,
      source: scf.source,
      className: scf.className,
      classSource: scf.classSource,
      level: scf.level,
      entries: scf.entries || [],
      isSubclassFeature: true,
      subclassName: scf.subclassShortName || scf.subclassName || null,
    };

    const result = await upsert("class_features", record, [
      "name",
      "source",
      "className",
      "classSource",
      "level",
      "subclassName",
    ]);
    if (result === "created") created++;
    else updated++;
  }
  return { created, updated };
}

async function importRaces(): Promise<{ created: number; updated: number }> {
  const filePath = join(DATA_DIR, "data", "races.json");
  if (!existsSync(filePath)) return { created: 0, updated: 0 };
  const data = readJson(filePath);
  let created = 0, updated = 0;

  for (const r of resolveAllCopies(data.race || [], "race")) {
    const speed =
      typeof r.speed === "number"
        ? { walk: r.speed }
        : { walk: r.speed?.walk || 30, ...r.speed };

    const abilityBonuses = (r.ability || []).map((a: any) => {
      if (a.choose) {
        return { choose: a.choose };
      }
      const fixed: Record<string, number> = {};
      for (const [k, v] of Object.entries(a)) {
        if (typeof v === "number") fixed[k] = v as number;
      }
      return { fixed };
    });

    const languages: string[] = [];
    for (const lp of r.languageProficiencies || []) {
      for (const [k, v] of Object.entries(lp)) {
        if (v === true && k !== "anyStandard" && k !== "any") languages.push(k);
      }
    }

    const record = {
      name: r.name,
      source: r.source,
      edition: edition(r.source, r.edition),
      size: r.size || ["M"],
      speed,
      darkvision: r.darkvision || 0,
      abilityBonuses,
      resistances: r.resist?.filter((x: any) => typeof x === "string") || null,
      immunities: r.immune?.filter((x: any) => typeof x === "string") || null,
      conditionImmunities: r.conditionImmune || null,
      skillProficiencies: extractProfNames(r.skillProficiencies),
      weaponProficiencies: extractProfNames(r.weaponProficiencies),
      toolProficiencies: extractProfNames(r.toolProficiencies),
      languages,
      traits: r.entries || [],
    };

    const result = await upsert("races", record);
    if (result === "created") created++;
    else updated++;
  }
  return { created, updated };
}

function extractProfNames(profArr?: any[]): string[] | null {
  if (!profArr) return null;
  const names: string[] = [];
  for (const p of profArr) {
    for (const [k, v] of Object.entries(p)) {
      if (v === true) names.push(k);
    }
  }
  return names.length > 0 ? names : null;
}

async function importItems(): Promise<{ created: number; updated: number }> {
  let created = 0, updated = 0;

  // Base items (weapons, armor, gear)
  const basePath = join(DATA_DIR, "data", "items-base.json");
  if (existsSync(basePath)) {
    const data = readJson(basePath);
    for (const i of resolveAllCopies(data.baseitem || data.item || [], "item").filter((x: any) => x.name)) {
      const result = await upsert("items", mapItem(i));
      if (result === "created") created++;
      else updated++;
    }
  }

  // Magic items
  const magicPath = join(DATA_DIR, "data", "items.json");
  if (existsSync(magicPath)) {
    const data = readJson(magicPath);
    for (const i of resolveAllCopies(data.item || [], "item").filter((x: any) => x.name)) {
      const result = await upsert("items", mapItem(i));
      if (result === "created") created++;
      else updated++;
    }
  }

  return { created, updated };
}

function mapItem(i: any): Record<string, unknown> {
  // Resolve type — can be "M|XPHB" format
  const rawType = i.type || "";
  const type = rawType.split("|")[0] || null;

  return {
    name: i.name,
    source: i.source,
    edition: edition(i.source, i.edition),
    type,
    rarity: i.rarity || "none",
    weight: i.weight || 0,
    value: i.value || 0,
    weaponCategory: i.weaponCategory || null,
    damage: i.dmg1 || null,
    damageType: i.dmgType || null,
    versatileDamage: i.dmg2 || null,
    range: i.range || null,
    properties: (i.property || []).map((p: any) =>
      typeof p === "string" ? p.split("|")[0] : String(p)
    ),
    ac: i.ac || 0,
    strengthRequirement: i.strength ? parseInt(i.strength, 10) : 0,
    stealthDisadvantage: !!i.stealth,
    requiresAttunement: i.reqAttune ?? false,
    bonusWeapon: i.bonusWeapon || null,
    bonusAc: i.bonusAc || null,
    bonusSpellAttack: i.bonusSpellAttack || null,
    bonusSpellSaveDc: i.bonusSpellSaveDc || null,
    entries: i.entries || [],
    isHomebrew: false,
    homebrewCreatedBy: null,
  };
}

async function importBackgrounds(): Promise<{ created: number; updated: number }> {
  const filePath = join(DATA_DIR, "data", "backgrounds.json");
  if (!existsSync(filePath)) return { created: 0, updated: 0 };
  const data = readJson(filePath);
  let created = 0, updated = 0;

  for (const b of resolveAllCopies(data.background || [], "background")) {
    const skillProfs = extractProfNames(b.skillProficiencies) || [];
    const toolProfs = extractProfNames(b.toolProficiencies);

    const languages: string[] = [];
    for (const lp of b.languageProficiencies || []) {
      for (const [k, v] of Object.entries(lp)) {
        if (v === true && k !== "anyStandard" && k !== "any") languages.push(k);
      }
    }

    const featureEntry = (b.entries || []).find(
      (e: any) => typeof e === "object" && e.name?.startsWith("Feature:")
    );

    const record = {
      name: b.name,
      source: b.source,
      edition: edition(b.source, b.edition),
      skillProficiencies: skillProfs,
      toolProficiencies: toolProfs,
      languages: languages.length > 0 ? languages : null,
      startingEquipment: b.startingEquipment || [],
      feats: b.feats ? Object.keys(b.feats[0] || {}) : null,
      feature: featureEntry || null,
      entries: b.entries || [],
    };

    const result = await upsert("backgrounds", record);
    if (result === "created") created++;
    else updated++;
  }
  return { created, updated };
}

// --- Main ---

async function importFeats(): Promise<{ created: number; updated: number }> {
  const filePath = join(DATA_DIR, "data", "feats.json");
  if (!existsSync(filePath)) return { created: 0, updated: 0 };
  const data = readJson(filePath);
  let created = 0, updated = 0;

  for (const f of resolveAllCopies(data.feat || [], "feat")) {
    const record = {
      name: f.name,
      source: f.source,
      edition: edition(f.source, f.edition),
      category: f.category || null,
      prerequisite: f.prerequisite || null,
      ability: f.ability || null,
      entries: f.entries || [],
      repeatable: !!f.repeatable,
    };
    const result = await upsert("feats", record);
    if (result === "created") created++;
    else updated++;
  }
  return { created, updated };
}

async function importConditions(): Promise<{ created: number; updated: number }> {
  const filePath = join(DATA_DIR, "data", "conditionsdiseases.json");
  if (!existsSync(filePath)) return { created: 0, updated: 0 };
  const data = readJson(filePath);
  let created = 0, updated = 0;

  for (const c of resolveAllCopies(data.condition || [], "condition")) {
    const record = {
      name: c.name,
      source: c.source,
      edition: edition(c.source, c.edition),
      kind: "condition",
      entries: c.entries || [],
    };
    const result = await upsert("conditions", record);
    if (result === "created") created++;
    else updated++;
  }
  // Import diseases
  for (const d of resolveAllCopies(data.disease || [], "disease")) {
    const record = {
      name: d.name,
      source: d.source,
      edition: edition(d.source, d.edition),
      kind: "disease",
      entries: d.entries || [],
    };
    const result = await upsert("conditions", record);
    if (result === "created") created++;
    else updated++;
  }
  // Import statuses
  for (const s of resolveAllCopies(data.status || [], "status")) {
    const record = {
      name: s.name,
      source: s.source,
      edition: edition(s.source, s.edition),
      kind: "status",
      entries: s.entries || [],
    };
    const result = await upsert("conditions", record);
    if (result === "created") created++;
    else updated++;
  }
  return { created, updated };
}

async function importSkills(): Promise<{ created: number; updated: number }> {
  const filePath = join(DATA_DIR, "data", "skills.json");
  if (!existsSync(filePath)) return { created: 0, updated: 0 };
  const data = readJson(filePath);
  let created = 0, updated = 0;

  for (const s of resolveAllCopies(data.skill || [], "skill")) {
    const record = {
      name: s.name,
      source: s.source,
      edition: edition(s.source, s.edition),
      ability: typeof s.ability === "string" ? s.ability : Object.keys(s.ability || {})[0] || null,
      entries: s.entries || [],
    };
    const result = await upsert("skills", record);
    if (result === "created") created++;
    else updated++;
  }
  return { created, updated };
}

async function importVariantRules(): Promise<{ created: number; updated: number }> {
  const filePath = join(DATA_DIR, "data", "variantrules.json");
  if (!existsSync(filePath)) return { created: 0, updated: 0 };
  const data = readJson(filePath);
  let created = 0, updated = 0;

  for (const v of resolveAllCopies(data.variantrule || [], "variantrule")) {
    const record = {
      name: v.name,
      source: v.source,
      edition: edition(v.source, v.edition),
      ruleType: v.ruleType || null,
      entries: v.entries || [],
    };
    const result = await upsert("variantrules", record);
    if (result === "created") created++;
    else updated++;
  }
  return { created, updated };
}

async function importActions(): Promise<{ created: number; updated: number }> {
  const filePath = join(DATA_DIR, "data", "actions.json");
  if (!existsSync(filePath)) return { created: 0, updated: 0 };
  const data = readJson(filePath);
  let created = 0, updated = 0;

  for (const a of resolveAllCopies(data.action || [], "action")) {
    const record = {
      name: a.name,
      source: a.source,
      edition: edition(a.source, a.edition),
      entries: a.entries || [],
      time: a.time || null,
    };
    const result = await upsert("actions", record);
    if (result === "created") created++;
    else updated++;
  }
  return { created, updated };
}

async function importOptionalFeatures(): Promise<{ created: number; updated: number }> {
  const filePath = join(DATA_DIR, "data", "optionalfeatures.json");
  if (!existsSync(filePath)) return { created: 0, updated: 0 };
  const data = readJson(filePath);
  let created = 0, updated = 0;

  for (const f of resolveAllCopies(data.optionalfeature || [], "optionalfeature")) {
    const record = {
      name: f.name,
      source: f.source,
      edition: edition(f.source, f.edition),
      featureType: f.featureType || null,
      prerequisite: f.prerequisite || null,
      entries: f.entries || [],
    };
    const result = await upsert("optionalfeatures", record);
    if (result === "created") created++;
    else updated++;
  }
  return { created, updated };
}

async function importSenses(): Promise<{ created: number; updated: number }> {
  const filePath = join(DATA_DIR, "data", "senses.json");
  if (!existsSync(filePath)) return { created: 0, updated: 0 };
  const data = readJson(filePath);
  let created = 0, updated = 0;

  for (const s of resolveAllCopies(data.sense || [], "sense")) {
    const record = {
      name: s.name,
      source: s.source,
      edition: edition(s.source, s.edition),
      entries: s.entries || [],
    };
    const result = await upsert("senses", record);
    if (result === "created") created++;
    else updated++;
  }
  return { created, updated };
}

async function importLanguages(): Promise<{ created: number; updated: number }> {
  const filePath = join(DATA_DIR, "data", "languages.json");
  if (!existsSync(filePath)) return { created: 0, updated: 0 };
  const data = readJson(filePath);
  let created = 0, updated = 0;

  for (const l of resolveAllCopies(data.language || [], "language")) {
    const record = {
      name: l.name,
      source: l.source,
      edition: edition(l.source, l.edition),
      typicalSpeakers: l.typicalSpeakers || null,
      script: l.script || null,
      languageType: l.type || null,
      entries: l.entries || [],
    };
    const result = await upsert("languages", record);
    if (result === "created") created++;
    else updated++;
  }

  // Language scripts
  for (const ls of resolveAllCopies(data.languageScript || [], "languageScript")) {
    const record = {
      name: ls.name,
      source: ls.source,
      edition: edition(ls.source, ls.edition),
      entries: ls.entries || [],
    };
    const result = await upsert("language_scripts", record);
    if (result === "created") created++;
    else updated++;
  }
  return { created, updated };
}

async function importDeities(): Promise<{ created: number; updated: number }> {
  const filePath = join(DATA_DIR, "data", "deities.json");
  if (!existsSync(filePath)) return { created: 0, updated: 0 };
  const data = readJson(filePath);
  let created = 0, updated = 0;

  for (const d of resolveAllCopies(data.deity || [], "deity")) {
    const record = {
      name: d.name,
      source: d.source,
      edition: edition(d.source, d.edition),
      alignment: d.alignment || null,
      domains: d.domains || null,
      pantheon: d.pantheon || null,
      symbol: d.symbol || null,
      entries: d.entries || [],
    };
    const result = await upsert("deities", record);
    if (result === "created") created++;
    else updated++;
  }
  return { created, updated };
}

async function importTablesData(): Promise<{ created: number; updated: number }> {
  const filePath = join(DATA_DIR, "data", "tables.json");
  if (!existsSync(filePath)) return { created: 0, updated: 0 };
  const data = readJson(filePath);
  let created = 0, updated = 0;

  for (const t of resolveAllCopies(data.table || [], "table").filter((x: any) => x.name)) {
    const record = {
      name: t.name,
      source: t.source,
      edition: edition(t.source, t.edition),
      colLabels: t.colLabels || null,
      rows: t.rows || null,
      entries: t.entries || [],
    };
    const result = await upsert("tables_data", record);
    if (result === "created") created++;
    else updated++;
  }
  return { created, updated };
}

async function importRewards(): Promise<{ created: number; updated: number }> {
  const filePath = join(DATA_DIR, "data", "rewards.json");
  if (!existsSync(filePath)) return { created: 0, updated: 0 };
  const data = readJson(filePath);
  let created = 0, updated = 0;

  for (const r of resolveAllCopies(data.reward || [], "reward")) {
    const record = {
      name: r.name,
      source: r.source,
      edition: edition(r.source, r.edition),
      rewardType: r.type || null,
      entries: r.entries || [],
    };
    const result = await upsert("rewards", record);
    if (result === "created") created++;
    else updated++;
  }
  return { created, updated };
}

async function importTrapsHazards(): Promise<{ created: number; updated: number }> {
  const filePath = join(DATA_DIR, "data", "trapshazards.json");
  if (!existsSync(filePath)) return { created: 0, updated: 0 };
  const data = readJson(filePath);
  let created = 0, updated = 0;

  for (const t of resolveAllCopies(data.trap || [], "trap")) {
    const record = {
      name: t.name,
      source: t.source,
      edition: edition(t.source, t.edition),
      kind: "trap",
      trapHazType: t.trapHazType || null,
      entries: t.entries || [],
    };
    const result = await upsert("trapshazards", record);
    if (result === "created") created++;
    else updated++;
  }
  for (const h of resolveAllCopies(data.hazard || [], "hazard")) {
    const record = {
      name: h.name,
      source: h.source,
      edition: edition(h.source, h.edition),
      kind: "hazard",
      trapHazType: h.trapHazType || null,
      entries: h.entries || [],
    };
    const result = await upsert("trapshazards", record);
    if (result === "created") created++;
    else updated++;
  }
  return { created, updated };
}

async function importObjects(): Promise<{ created: number; updated: number }> {
  const filePath = join(DATA_DIR, "data", "objects.json");
  if (!existsSync(filePath)) return { created: 0, updated: 0 };
  const data = readJson(filePath);
  let created = 0, updated = 0;

  for (const o of resolveAllCopies(data.object || [], "object")) {
    const record = {
      name: o.name,
      source: o.source,
      edition: edition(o.source, o.edition),
      size: o.size || null,
      objectType: o.objectType || null,
      ac: o.ac || null,
      hp: o.hp || null,
      entries: o.entries || [],
    };
    const result = await upsert("objects", record);
    if (result === "created") created++;
    else updated++;
  }
  return { created, updated };
}

async function importBastions(): Promise<{ created: number; updated: number }> {
  const filePath = join(DATA_DIR, "data", "bastions.json");
  if (!existsSync(filePath)) return { created: 0, updated: 0 };
  const data = readJson(filePath);
  let created = 0, updated = 0;

  for (const f of resolveAllCopies(data.facility || [], "facility")) {
    const record = {
      name: f.name,
      source: f.source,
      edition: edition(f.source, f.edition),
      facilityType: f.facilityType || null,
      level: f.level || null,
      entries: f.entries || [],
    };
    const result = await upsert("bastions", record);
    if (result === "created") created++;
    else updated++;
  }
  return { created, updated };
}

async function importCharCreationOptions(): Promise<{ created: number; updated: number }> {
  const filePath = join(DATA_DIR, "data", "charcreationoptions.json");
  if (!existsSync(filePath)) return { created: 0, updated: 0 };
  const data = readJson(filePath);
  let created = 0, updated = 0;

  for (const c of resolveAllCopies(data.charoption || [], "charoption")) {
    const record = {
      name: c.name,
      source: c.source,
      edition: edition(c.source, c.edition),
      optionType: c.optionType || null,
      entries: c.entries || [],
    };
    const result = await upsert("charcreationoptions", record);
    if (result === "created") created++;
    else updated++;
  }
  return { created, updated };
}

async function importPsionics(): Promise<{ created: number; updated: number }> {
  const filePath = join(DATA_DIR, "data", "psionics.json");
  if (!existsSync(filePath)) return { created: 0, updated: 0 };
  const data = readJson(filePath);
  let created = 0, updated = 0;

  for (const p of resolveAllCopies(data.psionic || [], "psionic")) {
    const record = {
      name: p.name,
      source: p.source,
      edition: edition(p.source, p.edition),
      psiType: p.type?.name || p.type || null,
      entries: p.entries || [],
    };
    const result = await upsert("psionics", record);
    if (result === "created") created++;
    else updated++;
  }
  return { created, updated };
}

async function importCreatures(): Promise<{ created: number; updated: number }> {
  const dataDir = join(DATA_DIR, "data", "bestiary");
  const files = readJsonDir(dataDir);
  let created = 0, updated = 0;

  // Aggregate all monsters across files, then resolve _copy cross-file
  const allRaw: any[] = [];
  for (const file of files) allRaw.push(...(file.monster || []));
  const allMonsters = resolveAllCopies(allRaw, "monster");

  for (const m of allMonsters) {
    // Extract CR — can be string, number, or {cr: "1/2", ...}
    let cr: string | null = null;
    if (typeof m.cr === "string") cr = m.cr;
    else if (typeof m.cr === "number") cr = String(m.cr);
    else if (m.cr?.cr) cr = String(m.cr.cr);

    const record = {
      name: m.name,
      source: m.source,
      edition: edition(m.source, m.edition),
      cr,
      creatureType: m.type || null,
      size: m.size || null,
      ac: m.ac || null,
      hp: m.hp || null,
      speed: m.speed || null,
      str: m.str ?? null,
      dex: m.dex ?? null,
      con: m.con ?? null,
      int: m.int ?? null,
      wis: m.wis ?? null,
      cha: m.cha ?? null,
      entries: m.entries || [],
      trait: m.trait || null,
      actionEntries: m.action || null,
    };

    const result = await upsert("creatures", record);
    if (result === "created") created++;
    else updated++;
  }
  return { created, updated };
}

async function importVehicles(): Promise<{ created: number; updated: number }> {
  const filePath = join(DATA_DIR, "data", "vehicles.json");
  if (!existsSync(filePath)) return { created: 0, updated: 0 };
  const data = readJson(filePath);
  let created = 0, updated = 0;

  for (const v of resolveAllCopies(data.vehicle || [], "vehicle")) {
    const record = {
      name: v.name,
      source: v.source,
      edition: edition(v.source, v.edition),
      vehicleType: v.vehicleType || null,
      entries: v.entries || [],
    };
    const result = await upsert("vehicles", record);
    if (result === "created") created++;
    else updated++;
  }
  for (const vu of resolveAllCopies(data.vehicleUpgrade || [], "vehicleUpgrade")) {
    const record = {
      name: vu.name,
      source: vu.source,
      edition: edition(vu.source, vu.edition),
      entries: vu.entries || [],
    };
    const result = await upsert("vehicle_upgrades", record);
    if (result === "created") created++;
    else updated++;
  }
  return { created, updated };
}

async function importDecks(): Promise<{ created: number; updated: number }> {
  const filePath = join(DATA_DIR, "data", "decks.json");
  if (!existsSync(filePath)) return { created: 0, updated: 0 };
  const data = readJson(filePath);
  let created = 0, updated = 0;

  for (const d of resolveAllCopies(data.deck || [], "deck")) {
    const record = {
      name: d.name,
      source: d.source,
      edition: edition(d.source, d.edition),
      entries: d.entries || [],
    };
    const result = await upsert("decks", record);
    if (result === "created") created++;
    else updated++;
  }
  for (const c of resolveAllCopies(data.card || [], "card")) {
    const record = {
      name: c.name,
      source: c.source,
      set: c.set || null,
      edition: edition(c.source, c.edition),
      entries: c.entries || [],
    };
    const result = await upsert("cards", record, ["name", "source", "set"]);
    if (result === "created") created++;
    else updated++;
  }
  return { created, updated };
}

async function importCultsBoons(): Promise<{ created: number; updated: number }> {
  const filePath = join(DATA_DIR, "data", "cultsboons.json");
  if (!existsSync(filePath)) return { created: 0, updated: 0 };
  const data = readJson(filePath);
  let created = 0, updated = 0;

  for (const c of resolveAllCopies(data.cult || [], "cult")) {
    const record = {
      name: c.name,
      source: c.source,
      edition: edition(c.source, c.edition),
      kind: "cult",
      entries: c.entries || [],
    };
    const result = await upsert("cultsboons", record);
    if (result === "created") created++;
    else updated++;
  }
  for (const b of resolveAllCopies(data.boon || [], "boon")) {
    const record = {
      name: b.name,
      source: b.source,
      edition: edition(b.source, b.edition),
      kind: "boon",
      entries: b.entries || [],
    };
    const result = await upsert("cultsboons", record);
    if (result === "created") created++;
    else updated++;
  }
  return { created, updated };
}

async function importRecipes(): Promise<{ created: number; updated: number }> {
  const filePath = join(DATA_DIR, "data", "recipes.json");
  if (!existsSync(filePath)) return { created: 0, updated: 0 };
  const data = readJson(filePath);
  let created = 0, updated = 0;

  for (const r of resolveAllCopies(data.recipe || [], "recipe")) {
    const record = {
      name: r.name,
      source: r.source,
      edition: edition(r.source, r.edition),
      entries: r.entries || r.instructions || [],
    };
    const result = await upsert("recipes", record);
    if (result === "created") created++;
    else updated++;
  }
  return { created, updated };
}

async function importMagicVariants(): Promise<{ created: number; updated: number }> {
  const filePath = join(DATA_DIR, "data", "magicvariants.json");
  if (!existsSync(filePath)) return { created: 0, updated: 0 };
  const data = readJson(filePath);
  let created = 0, updated = 0;

  for (const v of resolveAllCopies(data.magicvariant || [], "magicvariant").filter((x: any) => x.name)) {
    const src = v.source || v.inherits?.source || "DMG";
    const record = {
      name: v.name,
      source: src,
      edition: edition(src, v.edition),
      requires: v.requires || null,
      entries: v.entries || v.inherits?.entries || [],
    };
    const result = await upsert("magicvariants", record);
    if (result === "created") created++;
    else updated++;
  }
  return { created, updated };
}

async function importItemProperties(): Promise<{ created: number; updated: number }> {
  const filePath = join(DATA_DIR, "data", "items-base.json");
  if (!existsSync(filePath)) return { created: 0, updated: 0 };
  const data = readJson(filePath);
  let created = 0, updated = 0;

  for (const p of resolveAllCopies(data.itemProperty || [], "itemProperty").filter((x: any) => x.source)) {
    // Name comes from entries[0].name or abbreviation
    const name = p.name || (p.entries?.[0]?.name) || p.abbreviation || null;
    if (!name) continue;
    const record = {
      name,
      abbreviation: p.abbreviation || null,
      source: p.source,
      edition: edition(p.source, p.edition),
      entries: p.entries || [],
    };
    const result = await upsert("item_properties", record);
    if (result === "created") created++;
    else updated++;
  }
  for (const m of resolveAllCopies(data.itemMastery || [], "itemMastery").filter((x: any) => x.name)) {
    const record = {
      name: m.name,
      source: m.source,
      edition: edition(m.source, m.edition),
      entries: m.entries || [],
    };
    const result = await upsert("item_masteries", record);
    if (result === "created") created++;
    else updated++;
  }
  for (const t of resolveAllCopies(data.itemType || [], "itemType").filter((x: any) => x.name)) {
    const record = {
      name: t.name,
      abbreviation: t.abbreviation || null,
      source: t.source,
      edition: edition(t.source, t.edition),
      entries: t.entries || [],
    };
    const result = await upsert("item_types", record);
    if (result === "created") created++;
    else updated++;
  }
  return { created, updated };
}

async function importItemGroups(): Promise<{ created: number; updated: number }> {
  const filePath = join(DATA_DIR, "data", "items.json");
  if (!existsSync(filePath)) return { created: 0, updated: 0 };
  const data = readJson(filePath);
  let created = 0, updated = 0;

  for (const g of resolveAllCopies(data.itemGroup || [], "itemGroup").filter((x: any) => x.name)) {
    const record = {
      name: g.name,
      source: g.source,
      edition: edition(g.source, g.edition),
      type: g.type ? g.type.split("|")[0] : null,
      rarity: g.rarity || "none",
      items: g.items || [],
      entries: g.entries || [],
    };
    const result = await upsert("item_groups", record);
    if (result === "created") created++;
    else updated++;
  }
  return { created, updated };
}

async function importSubraces(): Promise<{ created: number; updated: number }> {
  const filePath = join(DATA_DIR, "data", "races.json");
  if (!existsSync(filePath)) return { created: 0, updated: 0 };
  const data = readJson(filePath);
  let created = 0, updated = 0;

  for (const sr of resolveAllCopies(data.subrace || [], "subrace").filter((x: any) => x.name)) {
    const speed =
      typeof sr.speed === "number"
        ? { walk: sr.speed }
        : sr.speed ? { walk: sr.speed?.walk || 30, ...sr.speed } : { walk: 30 };

    const record = {
      name: sr.name,
      source: sr.source,
      edition: edition(sr.source, sr.edition),
      isSubrace: true,
      raceName: sr.raceName || null,
      raceSource: sr.raceSource || null,
      size: sr.size || null,
      speed,
      darkvision: sr.darkvision || 0,
      abilityBonuses: null,
      resistances: sr.resist?.filter((x: any) => typeof x === "string") || null,
      immunities: sr.immune?.filter((x: any) => typeof x === "string") || null,
      conditionImmunities: sr.conditionImmune || null,
      skillProficiencies: null,
      weaponProficiencies: null,
      toolProficiencies: null,
      languages: null,
      traits: sr.entries || [],
    };

    const result = await upsert("races", record);
    if (result === "created") created++;
    else updated++;
  }
  return { created, updated };
}

const importers: Record<string, () => Promise<{ created: number; updated: number }>> = {
  spells: importSpells,
  classes: importClasses,
  races: importRaces,
  items: importItems,
  backgrounds: importBackgrounds,
  feats: importFeats,
  conditions: importConditions,
  skills: importSkills,
  variantrules: importVariantRules,
  actions: importActions,
  optionalfeatures: importOptionalFeatures,
  senses: importSenses,
  languages: importLanguages,
  deities: importDeities,
  tables_data: importTablesData,
  rewards: importRewards,
  trapshazards: importTrapsHazards,
  objects: importObjects,
  bastions: importBastions,
  charcreationoptions: importCharCreationOptions,
  psionics: importPsionics,
  creatures: importCreatures,
  vehicles: importVehicles,
  decks: importDecks,
  cultsboons: importCultsBoons,
  recipes: importRecipes,
  magicvariants: importMagicVariants,
  item_properties: importItemProperties,
  item_groups: importItemGroups,
  subraces: importSubraces,
};

async function main() {
  console.log("=== 5e.tools Data Importer ===\n");

  // Clone or update repo
  if (shouldClone && !existsSync(DATA_DIR)) {
    cloneRepo();
  } else if (shouldUpdate) {
    updateRepo();
  } else if (!existsSync(DATA_DIR)) {
    console.log("5e.tools data not found. Cloning...");
    cloneRepo();
  } else {
    console.log(`Using existing data at ${DATA_DIR}`);
    console.log("(use --update to pull latest)\n");
  }

  await authenticate();

  const toImport = onlyCollections
    ? Object.entries(importers).filter(([k]) => onlyCollections.includes(k))
    : Object.entries(importers);

  console.log(`\nImporting: ${toImport.map(([k]) => k).join(", ")}\n`);

  const totals = { created: 0, updated: 0 };

  for (const [name, importFn] of toImport) {
    const start = Date.now();
    process.stdout.write(`Importing ${name}...`);
    try {
      const result = await importFn();
      const elapsed = ((Date.now() - start) / 1000).toFixed(1);
      console.log(` ${result.created} created, ${result.updated} updated (${elapsed}s)`);
      totals.created += result.created;
      totals.updated += result.updated;
    } catch (err) {
      console.error(` FAILED: ${err}`);
    }
  }

  console.log(`\nDone! Total: ${totals.created} created, ${totals.updated} updated.`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
