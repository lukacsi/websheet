/// <reference path="../pb_data/types.d.ts" />

migrate((app) => {
  // Add classTableGroups to classes
  const classes = app.findCollectionByNameOrId("classes");
  classes.fields.add(new Field({ name: "classTableGroups", type: "json" }));
  app.save(classes);

  // -- Feats --
  app.save(new Collection({
    type: "base",
    name: "feats",
    listRule: "",
    viewRule: "",
    createRule: "",
    updateRule: "",
    deleteRule: "",
    fields: [
      { name: "name", type: "text", required: true },
      { name: "source", type: "text", required: true },
      { name: "edition", type: "select", values: ["classic", "one"] },
      { name: "category", type: "text" },
      { name: "prerequisite", type: "json" },
      { name: "ability", type: "json" },
      { name: "entries", type: "json" },
      { name: "repeatable", type: "bool" },
    ],
    indexes: [
      "CREATE UNIQUE INDEX idx_feats_name_source ON feats (name, source)",
    ],
  }));

  // -- Conditions --
  app.save(new Collection({
    type: "base",
    name: "conditions",
    listRule: "",
    viewRule: "",
    createRule: "",
    updateRule: "",
    deleteRule: "",
    fields: [
      { name: "name", type: "text", required: true },
      { name: "source", type: "text", required: true },
      { name: "edition", type: "select", values: ["classic", "one"] },
      { name: "entries", type: "json" },
    ],
    indexes: [
      "CREATE UNIQUE INDEX idx_conditions_name_source ON conditions (name, source)",
    ],
  }));

  // -- Skills --
  app.save(new Collection({
    type: "base",
    name: "skills",
    listRule: "",
    viewRule: "",
    createRule: "",
    updateRule: "",
    deleteRule: "",
    fields: [
      { name: "name", type: "text", required: true },
      { name: "source", type: "text", required: true },
      { name: "edition", type: "select", values: ["classic", "one"] },
      { name: "ability", type: "text" },
      { name: "entries", type: "json" },
    ],
    indexes: [
      "CREATE UNIQUE INDEX idx_skills_name_source ON skills (name, source)",
    ],
  }));

  // -- Variant Rules --
  app.save(new Collection({
    type: "base",
    name: "variantrules",
    listRule: "",
    viewRule: "",
    createRule: "",
    updateRule: "",
    deleteRule: "",
    fields: [
      { name: "name", type: "text", required: true },
      { name: "source", type: "text", required: true },
      { name: "edition", type: "select", values: ["classic", "one"] },
      { name: "ruleType", type: "text" },
      { name: "entries", type: "json" },
    ],
    indexes: [
      "CREATE UNIQUE INDEX idx_vr_name_source ON variantrules (name, source)",
    ],
  }));

  // -- Actions --
  app.save(new Collection({
    type: "base",
    name: "actions",
    listRule: "",
    viewRule: "",
    createRule: "",
    updateRule: "",
    deleteRule: "",
    fields: [
      { name: "name", type: "text", required: true },
      { name: "source", type: "text", required: true },
      { name: "edition", type: "select", values: ["classic", "one"] },
      { name: "entries", type: "json" },
      { name: "time", type: "json" },
    ],
    indexes: [
      "CREATE UNIQUE INDEX idx_actions_name_source ON actions (name, source)",
    ],
  }));
}, (app) => {
  const names = ["actions", "variantrules", "skills", "conditions", "feats"];
  for (const name of names) {
    app.delete(app.findCollectionByNameOrId(name));
  }
  // Remove classTableGroups from classes
  const classes = app.findCollectionByNameOrId("classes");
  classes.fields.removeByName("classTableGroups");
  app.save(classes);
});
