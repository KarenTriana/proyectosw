/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("lzdrc04c3psdx83")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "gfdbkz6n",
    "name": "location_id",
    "type": "relation",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "collectionId": "rt2kqcm1kl8gpyb",
      "cascadeDelete": false,
      "minSelect": null,
      "maxSelect": 1,
      "displayFields": null
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("lzdrc04c3psdx83")

  // remove
  collection.schema.removeField("gfdbkz6n")

  return dao.saveCollection(collection)
})
