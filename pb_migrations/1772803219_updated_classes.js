/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2478702895")

  // update field
  collection.fields.addAt(4, new Field({
    "hidden": false,
    "id": "number3681447494",
    "max": null,
    "min": null,
    "name": "hitDie",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2478702895")

  // update field
  collection.fields.addAt(4, new Field({
    "hidden": false,
    "id": "number3681447494",
    "max": null,
    "min": null,
    "name": "hitDie",
    "onlyInt": false,
    "presentable": false,
    "required": true,
    "system": false,
    "type": "number"
  }))

  return app.save(collection)
})
