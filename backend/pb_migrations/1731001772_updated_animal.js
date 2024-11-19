/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("za6af0czo9h5ym1")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "oxsnlacj",
    "name": "patrones",
    "type": "text",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "min": null,
      "max": null,
      "pattern": ""
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("za6af0czo9h5ym1")

  // remove
  collection.schema.removeField("oxsnlacj")

  return dao.saveCollection(collection)
})
