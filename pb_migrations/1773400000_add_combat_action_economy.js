/// <reference path="../pb_data/types.d.ts" />

// WS-011: Add action economy and combat feature pin fields to characters.

migrate((app) => {
  const characters = app.findCollectionByNameOrId("characters");

  // Action economy (per-turn tracking)
  characters.fields.add(new Field({ name: "actionUsed", type: "bool" }));
  characters.fields.add(new Field({ name: "bonusActionUsed", type: "bool" }));
  characters.fields.add(new Field({ name: "reactionUsed", type: "bool" }));
  characters.fields.add(new Field({ name: "movementUsed", type: "number" }));

  // Combat quick-reference pins
  characters.fields.add(new Field({ name: "pinnedCombatFeatures", type: "json" }));
  characters.fields.add(new Field({ name: "pinnedCombatSpells", type: "json" }));

  app.save(characters);
}, (app) => {
  const characters = app.findCollectionByNameOrId("characters");
  characters.fields.removeByName("actionUsed");
  characters.fields.removeByName("bonusActionUsed");
  characters.fields.removeByName("reactionUsed");
  characters.fields.removeByName("movementUsed");
  characters.fields.removeByName("pinnedCombatFeatures");
  characters.fields.removeByName("pinnedCombatSpells");
  app.save(characters);
});
