const { connect } = require("amqplib");
const amqp = require('amqplib/callback_api');
const { LOGGER } = require("../../lib/logger.lib.js");

const PUBLISH_MESSAGE_TO_BROKER = async (PAYLOAD_BODY,QUEUE) => {
        try {
            const connection = await connect(process.env.CLOUDAMQP_URL_HOSTED);
            const channel = await connection.createChannel();
            // connect to 'test-queue', create one if does not exist already
            await channel.assertQueue(QUEUE, { durable: false });

			// send data to queue
            await channel.sendToQueue(QUEUE, Buffer.from(JSON.stringify(PAYLOAD_BODY)));
				// close the channel and connections
                await channel.close();
                await connection.close();

				LOGGER.log('info',"Message Sent");
		} catch (error) {
			LOGGER.log('error',`Error while sending message to broker. \n\n\n\nError: ${error}\n\n\n\n`);
		}
};

module.exports = { PUBLISH_MESSAGE_TO_BROKER };
