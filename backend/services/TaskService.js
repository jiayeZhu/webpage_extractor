const { RecordModel, TaskModel } = require("../models")


const createTask = async (taskInfo) => {
  const task = new TaskModel(taskInfo)
  try {
    let { _id } = await task.save()
    return _id
  } catch (error) {
    console.error(error.message)
    return Promise.reject()
  }
}

module.exports = { createTask }