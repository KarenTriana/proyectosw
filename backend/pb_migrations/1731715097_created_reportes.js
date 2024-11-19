/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const collection = new Collection({
    "id": "wmkcl1mbxweus7h",
    "created": "2024-11-15 23:58:17.504Z",
    "updated": "2024-11-15 23:58:17.504Z",
    "name": "reportes",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "qex1tn5j",
        "name": "user_reportado",
        "type": "relation",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "collectionId": "_pb_users_auth_",
          "cascadeDelete": false,
          "minSelect": null,
          "maxSelect": 1,
          "displayFields": null
        }
      },
      {
        "system": false,
        "id": "8dmjpqps",
        "name": "user_reporta",
        "type": "relation",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "collectionId": "_pb_users_auth_",
          "cascadeDelete": false,
          "minSelect": null,
          "maxSelect": 1,
          "displayFields": null
        }
      },
      {
        "system": false,
        "id": "l1nl5lnv",
        "name": "motivo",
        "type": "select",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "maxSelect": 1,
          "values": [
            "inapropiado",
            "spam",
            "otro"
          ]
        }
      },
      {
        "system": false,
        "id": "hllz2tob",
        "name": "mensaje",
        "type": "text",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "min": null,
          "max": null,
          "pattern": ""
        }
      }
    ],
    "indexes": [],
    "listRule": null,
    "viewRule": null,
    "createRule": null,
    "updateRule": null,
    "deleteRule": null,
    "options": {}
  });

  return Dao(db).saveCollection(collection);
}, (db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("wmkcl1mbxweus7h");

  return dao.deleteCollection(collection);
})
