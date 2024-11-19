/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("za6af0czo9h5ym1")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "ofgmid04",
    "name": "sexo",
    "type": "select",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "maxSelect": 1,
      "values": [
        "Hembra",
        "Macho"
      ]
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("za6af0czo9h5ym1")

  // remove
  collection.schema.removeField("ofgmid04")

  return dao.saveCollection(collection)
})
