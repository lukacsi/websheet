/// <reference path="../pb_data/types.d.ts" />

migrate((app) => {
  // Add 'kind' field to conditions for disease/status distinction
  const conditions = app.findCollectionByNameOrId("conditions");
  conditions.fields.add(new Field({ name: "kind", type: "text" }));
  app.save(conditions);

  // Add subrace fields to races
  const races = app.findCollectionByNameOrId("races");
  races.fields.add(new Field({ name: "isSubrace", type: "bool" }));
  races.fields.add(new Field({ name: "raceName", type: "text" }));
  races.fields.add(new Field({ name: "raceSource", type: "text" }));
  app.save(races);

  const baseRules = { listRule: "", viewRule: "", createRule: "", updateRule: "", deleteRule: "" };

  // -- Optional Features (Fighting Styles, Invocations, Maneuvers, etc.) --
  app.save(new Collection({
    type: "base", name: "optionalfeatures", ...baseRules,
    fields: [
      { name: "name", type: "text", required: true },
      { name: "source", type: "text", required: true },
      { name: "edition", type: "select", values: ["classic", "one"] },
      { name: "featureType", type: "json" },
      { name: "prerequisite", type: "json" },
      { name: "entries", type: "json" },
    ],
    indexes: ["CREATE UNIQUE INDEX idx_optfeat_name_source ON optionalfeatures (name, source)"],
  }));

  // -- Senses --
  app.save(new Collection({
    type: "base", name: "senses", ...baseRules,
    fields: [
      { name: "name", type: "text", required: true },
      { name: "source", type: "text", required: true },
      { name: "edition", type: "select", values: ["classic", "one"] },
      { name: "entries", type: "json" },
    ],
    indexes: ["CREATE UNIQUE INDEX idx_senses_name_source ON senses (name, source)"],
  }));

  // -- Languages --
  app.save(new Collection({
    type: "base", name: "languages", ...baseRules,
    fields: [
      { name: "name", type: "text", required: true },
      { name: "source", type: "text", required: true },
      { name: "edition", type: "select", values: ["classic", "one"] },
      { name: "typicalSpeakers", type: "json" },
      { name: "script", type: "text" },
      { name: "entries", type: "json" },
      { name: "languageType", type: "text" },
    ],
    indexes: ["CREATE UNIQUE INDEX idx_languages_name_source ON languages (name, source)"],
  }));

  // -- Deities --
  app.save(new Collection({
    type: "base", name: "deities", ...baseRules,
    fields: [
      { name: "name", type: "text", required: true },
      { name: "source", type: "text", required: true },
      { name: "edition", type: "select", values: ["classic", "one"] },
      { name: "alignment", type: "json" },
      { name: "domains", type: "json" },
      { name: "pantheon", type: "text" },
      { name: "symbol", type: "text" },
      { name: "entries", type: "json" },
    ],
    indexes: ["CREATE UNIQUE INDEX idx_deities_name_source ON deities (name, source)"],
  }));

  // -- Tables Data --
  app.save(new Collection({
    type: "base", name: "tables_data", ...baseRules,
    fields: [
      { name: "name", type: "text", required: true },
      { name: "source", type: "text", required: true },
      { name: "edition", type: "select", values: ["classic", "one"] },
      { name: "colLabels", type: "json" },
      { name: "rows", type: "json" },
      { name: "entries", type: "json" },
    ],
    indexes: ["CREATE UNIQUE INDEX idx_tables_data_name_source ON tables_data (name, source)"],
  }));

  // -- Rewards --
  app.save(new Collection({
    type: "base", name: "rewards", ...baseRules,
    fields: [
      { name: "name", type: "text", required: true },
      { name: "source", type: "text", required: true },
      { name: "edition", type: "select", values: ["classic", "one"] },
      { name: "rewardType", type: "text" },
      { name: "entries", type: "json" },
    ],
    indexes: ["CREATE UNIQUE INDEX idx_rewards_name_source ON rewards (name, source)"],
  }));

  // -- Traps & Hazards --
  app.save(new Collection({
    type: "base", name: "trapshazards", ...baseRules,
    fields: [
      { name: "name", type: "text", required: true },
      { name: "source", type: "text", required: true },
      { name: "edition", type: "select", values: ["classic", "one"] },
      { name: "kind", type: "text" },
      { name: "trapHazType", type: "text" },
      { name: "entries", type: "json" },
    ],
    indexes: ["CREATE UNIQUE INDEX idx_trapshaz_name_source ON trapshazards (name, source)"],
  }));

  // -- Objects --
  app.save(new Collection({
    type: "base", name: "objects", ...baseRules,
    fields: [
      { name: "name", type: "text", required: true },
      { name: "source", type: "text", required: true },
      { name: "edition", type: "select", values: ["classic", "one"] },
      { name: "size", type: "text" },
      { name: "objectType", type: "text" },
      { name: "ac", type: "json" },
      { name: "hp", type: "json" },
      { name: "entries", type: "json" },
    ],
    indexes: ["CREATE UNIQUE INDEX idx_objects_name_source ON objects (name, source)"],
  }));

  // -- Bastions / Facilities --
  app.save(new Collection({
    type: "base", name: "bastions", ...baseRules,
    fields: [
      { name: "name", type: "text", required: true },
      { name: "source", type: "text", required: true },
      { name: "edition", type: "select", values: ["classic", "one"] },
      { name: "facilityType", type: "text" },
      { name: "level", type: "number" },
      { name: "entries", type: "json" },
    ],
    indexes: ["CREATE UNIQUE INDEX idx_bastions_name_source ON bastions (name, source)"],
  }));

  // -- Character Creation Options --
  app.save(new Collection({
    type: "base", name: "charcreationoptions", ...baseRules,
    fields: [
      { name: "name", type: "text", required: true },
      { name: "source", type: "text", required: true },
      { name: "edition", type: "select", values: ["classic", "one"] },
      { name: "optionType", type: "text" },
      { name: "entries", type: "json" },
    ],
    indexes: ["CREATE UNIQUE INDEX idx_charopts_name_source ON charcreationoptions (name, source)"],
  }));

  // -- Psionics --
  app.save(new Collection({
    type: "base", name: "psionics", ...baseRules,
    fields: [
      { name: "name", type: "text", required: true },
      { name: "source", type: "text", required: true },
      { name: "edition", type: "select", values: ["classic", "one"] },
      { name: "psiType", type: "text" },
      { name: "entries", type: "json" },
    ],
    indexes: ["CREATE UNIQUE INDEX idx_psionics_name_source ON psionics (name, source)"],
  }));

  // -- Creatures / Bestiary --
  app.save(new Collection({
    type: "base", name: "creatures", ...baseRules,
    fields: [
      { name: "name", type: "text", required: true },
      { name: "source", type: "text", required: true },
      { name: "edition", type: "select", values: ["classic", "one"] },
      { name: "cr", type: "text" },
      { name: "creatureType", type: "json" },
      { name: "size", type: "json" },
      { name: "ac", type: "json" },
      { name: "hp", type: "json" },
      { name: "speed", type: "json" },
      { name: "str", type: "number" },
      { name: "dex", type: "number" },
      { name: "con", type: "number" },
      { name: "int", type: "number" },
      { name: "wis", type: "number" },
      { name: "cha", type: "number" },
      { name: "entries", type: "json" },
      { name: "trait", type: "json" },
      { name: "actionEntries", type: "json" },
    ],
    indexes: ["CREATE UNIQUE INDEX idx_creatures_name_source ON creatures (name, source)"],
  }));

  // -- Vehicles --
  app.save(new Collection({
    type: "base", name: "vehicles", ...baseRules,
    fields: [
      { name: "name", type: "text", required: true },
      { name: "source", type: "text", required: true },
      { name: "edition", type: "select", values: ["classic", "one"] },
      { name: "vehicleType", type: "text" },
      { name: "entries", type: "json" },
    ],
    indexes: ["CREATE UNIQUE INDEX idx_vehicles_name_source ON vehicles (name, source)"],
  }));

  // -- Vehicle Upgrades --
  app.save(new Collection({
    type: "base", name: "vehicle_upgrades", ...baseRules,
    fields: [
      { name: "name", type: "text", required: true },
      { name: "source", type: "text", required: true },
      { name: "edition", type: "select", values: ["classic", "one"] },
      { name: "entries", type: "json" },
    ],
    indexes: ["CREATE UNIQUE INDEX idx_vehupg_name_source ON vehicle_upgrades (name, source)"],
  }));

  // -- Decks --
  app.save(new Collection({
    type: "base", name: "decks", ...baseRules,
    fields: [
      { name: "name", type: "text", required: true },
      { name: "source", type: "text", required: true },
      { name: "edition", type: "select", values: ["classic", "one"] },
      { name: "entries", type: "json" },
    ],
    indexes: ["CREATE UNIQUE INDEX idx_decks_name_source ON decks (name, source)"],
  }));

  // -- Cards --
  app.save(new Collection({
    type: "base", name: "cards", ...baseRules,
    fields: [
      { name: "name", type: "text", required: true },
      { name: "source", type: "text", required: true },
      { name: "set", type: "text" },
      { name: "edition", type: "select", values: ["classic", "one"] },
      { name: "entries", type: "json" },
    ],
    indexes: ["CREATE UNIQUE INDEX idx_cards_name_source_set ON cards (name, source, \"set\")"],
  }));

  // -- Cults & Boons --
  app.save(new Collection({
    type: "base", name: "cultsboons", ...baseRules,
    fields: [
      { name: "name", type: "text", required: true },
      { name: "source", type: "text", required: true },
      { name: "edition", type: "select", values: ["classic", "one"] },
      { name: "kind", type: "text" },
      { name: "entries", type: "json" },
    ],
    indexes: ["CREATE UNIQUE INDEX idx_cultsboons_name_source ON cultsboons (name, source)"],
  }));

  // -- Recipes --
  app.save(new Collection({
    type: "base", name: "recipes", ...baseRules,
    fields: [
      { name: "name", type: "text", required: true },
      { name: "source", type: "text", required: true },
      { name: "edition", type: "select", values: ["classic", "one"] },
      { name: "entries", type: "json" },
    ],
    indexes: ["CREATE UNIQUE INDEX idx_recipes_name_source ON recipes (name, source)"],
  }));

  // -- Magic Variants --
  app.save(new Collection({
    type: "base", name: "magicvariants", ...baseRules,
    fields: [
      { name: "name", type: "text", required: true },
      { name: "source", type: "text", required: true },
      { name: "edition", type: "select", values: ["classic", "one"] },
      { name: "requires", type: "json" },
      { name: "entries", type: "json" },
    ],
    indexes: ["CREATE UNIQUE INDEX idx_magicvar_name_source ON magicvariants (name, source)"],
  }));

  // -- Item Properties --
  app.save(new Collection({
    type: "base", name: "item_properties", ...baseRules,
    fields: [
      { name: "name", type: "text", required: true },
      { name: "abbreviation", type: "text" },
      { name: "source", type: "text", required: true },
      { name: "edition", type: "select", values: ["classic", "one"] },
      { name: "entries", type: "json" },
    ],
    indexes: ["CREATE UNIQUE INDEX idx_itemprops_name_source ON item_properties (name, source)"],
  }));

  // -- Item Masteries --
  app.save(new Collection({
    type: "base", name: "item_masteries", ...baseRules,
    fields: [
      { name: "name", type: "text", required: true },
      { name: "source", type: "text", required: true },
      { name: "edition", type: "select", values: ["classic", "one"] },
      { name: "entries", type: "json" },
    ],
    indexes: ["CREATE UNIQUE INDEX idx_itemmast_name_source ON item_masteries (name, source)"],
  }));

  // -- Item Types --
  app.save(new Collection({
    type: "base", name: "item_types", ...baseRules,
    fields: [
      { name: "name", type: "text", required: true },
      { name: "abbreviation", type: "text" },
      { name: "source", type: "text", required: true },
      { name: "edition", type: "select", values: ["classic", "one"] },
      { name: "entries", type: "json" },
    ],
    indexes: ["CREATE UNIQUE INDEX idx_itemtypes_name_source ON item_types (name, source)"],
  }));

  // -- Item Groups --
  app.save(new Collection({
    type: "base", name: "item_groups", ...baseRules,
    fields: [
      { name: "name", type: "text", required: true },
      { name: "source", type: "text", required: true },
      { name: "edition", type: "select", values: ["classic", "one"] },
      { name: "entries", type: "json" },
    ],
    indexes: ["CREATE UNIQUE INDEX idx_itemgroups_name_source ON item_groups (name, source)"],
  }));

  // -- Language Scripts --
  app.save(new Collection({
    type: "base", name: "language_scripts", ...baseRules,
    fields: [
      { name: "name", type: "text", required: true },
      { name: "source", type: "text", required: true },
      { name: "edition", type: "select", values: ["classic", "one"] },
      { name: "entries", type: "json" },
    ],
    indexes: ["CREATE UNIQUE INDEX idx_langscripts_name_source ON language_scripts (name, source)"],
  }));

}, (app) => {
  // Remove all new collections in reverse order
  const collections = [
    "language_scripts", "item_groups", "item_types", "item_masteries", "item_properties",
    "magicvariants", "recipes", "cultsboons", "cards", "decks", "vehicle_upgrades",
    "vehicles", "creatures", "psionics", "charcreationoptions", "bastions", "objects",
    "trapshazards", "rewards", "tables_data", "deities", "languages", "senses",
    "optionalfeatures",
  ];
  for (const name of collections) {
    try { app.delete(app.findCollectionByNameOrId(name)); } catch {}
  }

  // Remove added fields from conditions
  const conditions = app.findCollectionByNameOrId("conditions");
  conditions.fields.removeByName("kind");
  app.save(conditions);

  // Remove subrace fields from races
  const races = app.findCollectionByNameOrId("races");
  races.fields.removeByName("isSubrace");
  races.fields.removeByName("raceName");
  races.fields.removeByName("raceSource");
  app.save(races);
});
