const { LOGGER } = require('../../lib/logger.lib.js');
const cloudAMQPUrl = 'amqps://myhjzazj:dC03I5hguN_SGqxmUK3iNioUJynHQ9Hf@shark.rmq.cloudamqp.com/myhjzazj';

async function MESSAGE_BROKER_CONFIG() {
	try {
    const connection = await amqp.connect(cloudAMQPUrl);
	
	LOGGER.log('info',`SUCCESS[CONNECTED TO CLOUDAMQP]`)
    return connection;
  } catch (error) {
	LOGGER.log('error',`ERROR[MESSAGE_BROKER_CONFIG]: ${error}`)
    throw new Error('Could not connect to cloudamqp');
  }
}

const queueName = 'my_queue';

async function MESSAGE_BROKER_PUBLISHER(queueName,message) {
  let connection;
  try {
    connection = await MESSAGE_BROKER_CONFIG();
    const channel = await connection.createChannel('notifications');
    
    await channel.assertQueue(queueName, { durable: false });
    channel.sendToQueue(queueName, Buffer.from(message));
    
    LOGGER.log('info',`SUCCESS[MESSAGE_BROKER_PUBLISHER]`)
    
    await channel.close();
  } catch (error) {
	  LOGGER.log('error',`ERROR[MESSAGE_BROKER_PUBLISHER]: ${error}`);
	  throw new Error('message could not be published to broker')
  } finally {
    if (connection) await connection.close();
  }
};

// Example usage
MESSAGE_BROKER_PUBLISHER('Hello, CloudAMQP!');

async function MESSAGE_BROKER_CONSUMER(queueName) {
  let connection;
  try {
    connection = await MESSAGE_BROKER_CONFIG();
    const channel = await connection.createChannel();
    
    await channel.assertQueue(queueName, { durable: false });
    console.log(`Waiting for messages from queue: ${queueName}`);
    
    channel.consume(queueName, (msg) => {
      if (msg !== null) {
        console.log(`Received message: ${msg.content.toString()}`);
        // Process the message here
        channel.ack(msg);
      }
    });
  } catch (error) {
    console.error('Error in consumeMessages:', error);
  }
  // Note: We don't close the connection here to keep listening for messages
}

module.exports = { MESSAGE_BROKER_CONFIG, MESSAGE_BROKER_PUBLISHER, MESSAGE_BROKER_CONSUMER };
