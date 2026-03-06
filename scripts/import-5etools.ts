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

// --- Importers ---

async function importSpells(): Promise<{ created: number; updated: number }> {
  const dataDir = join(DATA_DIR, "data", "spells");
  const files = readJsonDir(dataDir);
  let created = 0, updated = 0;

  for (const file of files) {
    const spells = file.spell || [];
    for (const s of spells) {
      // Skip _copy references and entries without required fields
      if (s._copy || s.level == null || !s.school) continue;
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
  }
  return { created, updated };
}

async function importClasses(): Promise<{ created: number; updated: number }> {
  const dataDir = join(DATA_DIR, "data", "class");
  const files = readJsonDir(dataDir);
  let created = 0, updated = 0;

  for (const file of files) {
    // Import classes
    for (const c of (file.class || []).filter((x: any) => !x._copy)) {
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
        skillChoices: c.startingProficiencies?.skills?.[0]?.choose || null,
        startingEquipment: c.startingEquipment?.entries || c.startingEquipment?.defaultData || [],
        classFeatures: c.classFeatures || [],
        subclassTitle: c.subclassTitle || "Subclass",
        multiclassing: c.multiclassing || null,
        cantripProgression: c.cantripProgression || null,
        preparedSpellsProgression: c.preparedSpellsProgression || null,
        spellSlotProgression: c.classTableGroups
          ?.find((g: any) => g.rowsSpellProgression)
          ?.rowsSpellProgression || null,
      };

      const result = await upsert("classes", record);
      if (result === "created") created++;
      else updated++;
    }

    // Import subclasses
    for (const sc of (file.subclass || []).filter((x: any) => !x._copy)) {
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

      const result = await upsert("subclasses", record);
      if (result === "created") created++;
      else updated++;
    }

    // Import class features
    for (const cf of (file.classFeature || []).filter((x: any) => !x._copy)) {
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
    for (const scf of (file.subclassFeature || []).filter((x: any) => !x._copy)) {
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
  }
  return { created, updated };
}

async function importRaces(): Promise<{ created: number; updated: number }> {
  const filePath = join(DATA_DIR, "data", "races.json");
  if (!existsSync(filePath)) return { created: 0, updated: 0 };
  const data = readJson(filePath);
  let created = 0, updated = 0;

  for (const r of (data.race || []).filter((x: any) => !x._copy)) {
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
    for (const i of (data.baseitem || data.item || []).filter((x: any) => !x._copy && x.name)) {
      const result = await upsert("items", mapItem(i));
      if (result === "created") created++;
      else updated++;
    }
  }

  // Magic items
  const magicPath = join(DATA_DIR, "data", "items.json");
  if (existsSync(magicPath)) {
    const data = readJson(magicPath);
    for (const i of (data.item || []).filter((x: any) => !x._copy && x.name)) {
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

  for (const b of (data.background || []).filter((x: any) => !x._copy)) {
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

const importers: Record<string, () => Promise<{ created: number; updated: number }>> = {
  spells: importSpells,
  classes: importClasses,
  races: importRaces,
  items: importItems,
  backgrounds: importBackgrounds,
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
