const amqp = require('amqplib')
const config = require('config')

const host = process.env.MQ_HOST || config.get('RabbitMQ').host
const port = process.env.MQ_PORT || config.get('RabbitMQ').port
const queueName = process.env.MQ_QUEUE_NAME || config.get('RabbitMQ').queueName
// const { host, port, queueName } = config.get('RabbitMQ')

let connection, channel

const connect = async () => {
  connection = await amqp.connect(`amqp://${host}:${port}`)
  channel = await connection.createChannel()
  await channel.assertQueue(queueName, { durable: true })
  console.log('Cluster mode. Gateway connected to the MQ.')
  return { connection, channel }
}

const sendMSG = async (jsonData) => {
  return await channel.sendToQueue(queueName,Buffer.from(JSON.stringify(jsonData)))
}

const closeConnection = async () => {
  return await connection.close()
}
module.exports = { connect, sendMSG, closeConnection}
