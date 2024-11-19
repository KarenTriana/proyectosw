/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("za6af0czo9h5ym1")

  // remove
  collection.schema.removeField("cbfhfy1o")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "5jiwp54m",
    "name": "especie",
    "type": "select",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "maxSelect": 1,
      "values": [
        "Gato",
        "Perro",
        "Loro",
        "Conejo",
        "Tortuga"
      ]
    }
  }))

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "alwpbdqv",
    "name": "edad",
    "type": "select",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "maxSelect": 1,
      "values": [
        "Cachorro (0-1 año)",
        "Joven (1-5 años)",
        "Adulto (5-10 años)",
        "Senior (más de 10 años)"
      ]
    }
  }))

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "kmzlwpgs",
    "name": "tamano",
    "type": "select",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "maxSelect": 1,
      "values": [
        "Pequeño",
        "Mediano",
        "Grande"
      ]
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("za6af0czo9h5ym1")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "cbfhfy1o",
    "name": "type",
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

  // remove
  collection.schema.removeField("5jiwp54m")

  // remove
  collection.schema.removeField("alwpbdqv")

  // remove
  collection.schema.removeField("kmzlwpgs")

  return dao.saveCollection(collection)
})
