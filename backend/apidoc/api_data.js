define({ "api": [
  {
    "type": "delete",
    "url": "/record/:recordId",
    "title": "delete a record",
    "name": "DeleteRecord",
    "group": "Record",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "recordId",
            "description": "<p>The MongoDB ObjectID of the record you want to delete</p>"
          }
        ]
      }
    },
    "success": {
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/RecordRouter.js",
    "groupTitle": "Record"
  },
  {
    "type": "get",
    "url": "/record/:recordId",
    "title": "Get detail infomation about a record",
    "name": "GetRecordDetail",
    "group": "Record",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "recordId",
            "description": "<p>The MongoDB ObjectID of the record you want to fetch detail info</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Object[]",
            "optional": false,
            "field": "-",
            "description": ""
          },
          {
            "group": "Success 200",
            "type": "Object[]",
            "optional": false,
            "field": "-.result",
            "description": "<p>The result object array of one record</p>"
          },
          {
            "group": "Success 200",
            "type": "Object[]",
            "optional": false,
            "field": "-.rules",
            "description": "<p>The rule object array of one record</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/RecordRouter.js",
    "groupTitle": "Record"
  },
  {
    "type": "post",
    "url": "/task",
    "title": "Create new task",
    "name": "CreateTask",
    "group": "Task",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "name",
            "description": "<p>Task name.</p>"
          },
          {
            "group": "Parameter",
            "type": "Object[]",
            "optional": false,
            "field": "rules",
            "description": "<p>rule objects for the Task</p>"
          },
          {
            "group": "Parameter",
            "type": "String[]",
            "optional": false,
            "field": "urls",
            "description": "<p>URLs for the task</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "201": [
          {
            "group": "201",
            "type": "String",
            "optional": false,
            "field": "_id",
            "description": "<p>the MongoDB ObjectID of the new created task</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/TaskRouter.js",
    "groupTitle": "Task"
  },
  {
    "type": "delete",
    "url": "/task/:taskId",
    "title": "delete a task",
    "name": "DeleteTask",
    "group": "Task",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "taskId",
            "description": "<p>The MongoDB ObjectID of the task you want to delete</p>"
          }
        ]
      }
    },
    "success": {
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/TaskRouter.js",
    "groupTitle": "Task"
  },
  {
    "type": "get",
    "url": "/task/:taskId/record",
    "title": "get the records of a specific task",
    "name": "GetRecordList",
    "group": "Task",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "taskId",
            "description": "<p>The MongoDB ObjectID of the task you want to fetch records of</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "200": [
          {
            "group": "200",
            "type": "Object[]",
            "optional": false,
            "field": "records",
            "description": "<p>List of records related to the specific task</p>"
          },
          {
            "group": "200",
            "type": "Number",
            "optional": false,
            "field": "records.status",
            "description": "<p>Crawler status of the record</p>"
          },
          {
            "group": "200",
            "type": "String",
            "optional": false,
            "field": "records.url",
            "description": "<p>The url of the record</p>"
          },
          {
            "group": "200",
            "type": "String",
            "optional": false,
            "field": "records._id",
            "description": "<p>MongoDB ObjectID of the record</p>"
          },
          {
            "group": "200",
            "type": "String",
            "optional": false,
            "field": "records.title",
            "description": "<p>The title of the url</p>"
          },
          {
            "group": "200",
            "type": "Number",
            "optional": false,
            "field": "totalCount",
            "description": "<p>total count of all records related to the task</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/TaskRouter.js",
    "groupTitle": "Task"
  },
  {
    "type": "get",
    "url": "/task?page=:page",
    "title": "get a list of tasks",
    "name": "GetTaskList",
    "group": "Task",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "page",
            "description": "<p>which page to show, default = 1</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "200": [
          {
            "group": "200",
            "type": "Object[]",
            "optional": false,
            "field": "tasks",
            "description": "<p>list of tasks</p>"
          },
          {
            "group": "200",
            "type": "String[]",
            "optional": false,
            "field": "tasks.rules",
            "description": "<p>rules of the task</p>"
          },
          {
            "group": "200",
            "type": "String",
            "optional": false,
            "field": "task._id",
            "description": "<p>MongoDB ObjectID of the Task</p>"
          },
          {
            "group": "200",
            "type": "String",
            "optional": false,
            "field": "task.name",
            "description": "<p>Task name</p>"
          },
          {
            "group": "200",
            "type": "Date",
            "optional": false,
            "field": "task.createdAt",
            "description": "<p>the timestamp when the Task was created</p>"
          },
          {
            "group": "200",
            "type": "Object[]",
            "optional": false,
            "field": "task.records",
            "description": "<p>records related to this task</p>"
          },
          {
            "group": "200",
            "type": "Number",
            "optional": false,
            "field": "task.records.status",
            "description": "<p>status of the record</p>"
          },
          {
            "group": "200",
            "type": "String",
            "optional": false,
            "field": "task.records.url",
            "description": "<p>url of the record</p>"
          },
          {
            "group": "200",
            "type": "String",
            "optional": false,
            "field": "task.records._id",
            "description": "<p>MongoDB ObjectID of the record</p>"
          },
          {
            "group": "200",
            "type": "Number",
            "optional": false,
            "field": "totalCount",
            "description": "<p>total count of all tasks</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/TaskRouter.js",
    "groupTitle": "Task"
  }
] });
