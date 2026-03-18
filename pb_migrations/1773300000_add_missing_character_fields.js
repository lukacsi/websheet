/// <reference path="../pb_data/types.d.ts" />

// WS-001: Add missing character fields that exist in the TS type but were never
// added to PocketBase via migration. Most critically, `attacks` — which caused
// attack data to be silently dropped on save (G8 bug, 11/13 classes affected).

migrate((app) => {
  const characters = app.findCollectionByNameOrId("characters");

  // Combat — the primary bug fix
  characters.fields.add(new Field({ name: "attacks", type: "json" }));
  characters.fields.add(new Field({ name: "exhaustionLevel", type: "number" }));

  // Personality (Page 2)
  characters.fields.add(new Field({ name: "personalityTraits", type: "text" }));
  characters.fields.add(new Field({ name: "ideals", type: "text" }));
  characters.fields.add(new Field({ name: "bonds", type: "text" }));
  characters.fields.add(new Field({ name: "flaws", type: "text" }));

  // Appearance & backstory (Page 2)
  characters.fields.add(new Field({ name: "appearance", type: "json" }));
  characters.fields.add(new Field({ name: "backstory", type: "text" }));
  characters.fields.add(new Field({ name: "alliesAndOrganizations", type: "text" }));
  characters.fields.add(new Field({ name: "additionalFeaturesAndTraits", type: "text" }));

  app.save(characters);
}, (app) => {
  const characters = app.findCollectionByNameOrId("characters");
  characters.fields.removeByName("attacks");
  characters.fields.removeByName("exhaustionLevel");
  characters.fields.removeByName("personalityTraits");
  characters.fields.removeByName("ideals");
  characters.fields.removeByName("bonds");
  characters.fields.removeByName("flaws");
  characters.fields.removeByName("appearance");
  characters.fields.removeByName("backstory");
  characters.fields.removeByName("alliesAndOrganizations");
  characters.fields.removeByName("additionalFeaturesAndTraits");
  app.save(characters);
});
