/// <reference path="../pb_data/types.d.ts" />

migrate((app) => {
  const characters = app.findCollectionByNameOrId("characters");
  characters.fields.add(new Field({ name: "feats", type: "json" }));
  app.save(characters);
}, (app) => {
  const characters = app.findCollectionByNameOrId("characters");
  characters.fields.removeByName("feats");
  app.save(characters);
});
