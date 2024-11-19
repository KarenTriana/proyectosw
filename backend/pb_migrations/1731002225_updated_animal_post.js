/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("lzdrc04c3psdx83")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "pdvxx6xw",
    "name": "post_date",
    "type": "date",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "min": "",
      "max": ""
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("lzdrc04c3psdx83")

  // remove
  collection.schema.removeField("pdvxx6xw")

  return dao.saveCollection(collection)
})
