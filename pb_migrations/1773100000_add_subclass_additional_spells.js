/// <reference path="../pb_data/types.d.ts" />

migrate((app) => {
  const subclasses = app.findCollectionByNameOrId("subclasses");
  subclasses.fields.add(new Field({ name: "additionalSpells", type: "json" }));
  app.save(subclasses);
}, (app) => {
  const subclasses = app.findCollectionByNameOrId("subclasses");
  subclasses.fields.removeByName("additionalSpells");
  app.save(subclasses);
});
