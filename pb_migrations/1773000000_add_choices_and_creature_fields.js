/// <reference path="../pb_data/types.d.ts" />

migrate((app) => {
  // -- Classes: add toolChoices --
  const classes = app.findCollectionByNameOrId("classes");
  classes.fields.add(new Field({ name: "toolChoices", type: "json" }));
  app.save(classes);

  // -- Backgrounds: add toolChoices, languageChoices --
  const backgrounds = app.findCollectionByNameOrId("backgrounds");
  backgrounds.fields.add(new Field({ name: "toolChoices", type: "json" }));
  backgrounds.fields.add(new Field({ name: "languageChoices", type: "json" }));
  app.save(backgrounds);

  // -- Races: add toolChoices, languageChoices, resistanceChoices --
  const races = app.findCollectionByNameOrId("races");
  races.fields.add(new Field({ name: "toolChoices", type: "json" }));
  races.fields.add(new Field({ name: "languageChoices", type: "json" }));
  races.fields.add(new Field({ name: "resistanceChoices", type: "json" }));
  app.save(races);

  // -- Characters: add featureChoices (already in TS type, missing from PB) --
  const characters = app.findCollectionByNameOrId("characters");
  characters.fields.add(new Field({ name: "featureChoices", type: "json" }));
  app.save(characters);

  // -- Creatures: add stat block fields --
  const creatures = app.findCollectionByNameOrId("creatures");
  creatures.fields.add(new Field({ name: "save", type: "json" }));
  creatures.fields.add(new Field({ name: "skill", type: "json" }));
  creatures.fields.add(new Field({ name: "passive", type: "number" }));
  creatures.fields.add(new Field({ name: "senses", type: "json" }));
  creatures.fields.add(new Field({ name: "languages", type: "json" }));
  creatures.fields.add(new Field({ name: "resist", type: "json" }));
  creatures.fields.add(new Field({ name: "immune", type: "json" }));
  creatures.fields.add(new Field({ name: "vulnerable", type: "json" }));
  creatures.fields.add(new Field({ name: "conditionImmune", type: "json" }));
  creatures.fields.add(new Field({ name: "reaction", type: "json" }));
  creatures.fields.add(new Field({ name: "legendary", type: "json" }));
  creatures.fields.add(new Field({ name: "bonus", type: "json" }));
  app.save(creatures);
}, (app) => {
  // Revert: remove added fields
  const classes = app.findCollectionByNameOrId("classes");
  classes.fields.removeByName("toolChoices");
  app.save(classes);

  const backgrounds = app.findCollectionByNameOrId("backgrounds");
  backgrounds.fields.removeByName("toolChoices");
  backgrounds.fields.removeByName("languageChoices");
  app.save(backgrounds);

  const races = app.findCollectionByNameOrId("races");
  races.fields.removeByName("toolChoices");
  races.fields.removeByName("languageChoices");
  races.fields.removeByName("resistanceChoices");
  app.save(races);

  const characters = app.findCollectionByNameOrId("characters");
  characters.fields.removeByName("featureChoices");
  app.save(characters);

  const creatures = app.findCollectionByNameOrId("creatures");
  creatures.fields.removeByName("save");
  creatures.fields.removeByName("skill");
  creatures.fields.removeByName("passive");
  creatures.fields.removeByName("senses");
  creatures.fields.removeByName("languages");
  creatures.fields.removeByName("resist");
  creatures.fields.removeByName("immune");
  creatures.fields.removeByName("vulnerable");
  creatures.fields.removeByName("conditionImmune");
  creatures.fields.removeByName("reaction");
  creatures.fields.removeByName("legendary");
  creatures.fields.removeByName("bonus");
  app.save(creatures);
});
