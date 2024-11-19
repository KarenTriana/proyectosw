/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("za6af0czo9h5ym1")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "f5tcwzgs",
    "name": "raza",
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

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "xymrftys",
    "name": "color",
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
  collection.schema.removeField("f5tcwzgs")

  // remove
  collection.schema.removeField("xymrftys")

  return dao.saveCollection(collection)
})
