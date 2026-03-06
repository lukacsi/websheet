/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3074418330")

  // update collection data
  unmarshal({
    "indexes": [
      "CREATE UNIQUE INDEX idx_subclasses_name_source ON subclasses (name, source, className, classSource)",
      "CREATE INDEX idx_subclasses_class ON subclasses (className, classSource)"
    ]
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3074418330")

  // update collection data
  unmarshal({
    "indexes": [
      "CREATE UNIQUE INDEX idx_subclasses_name_source ON subclasses (name, source)",
      "CREATE INDEX idx_subclasses_class ON subclasses (className, classSource)"
    ]
  }, collection)

  return app.save(collection)
})
