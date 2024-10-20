const mongoose = require("mongoose")
require("dotenv").config()
const username = encodeURIComponent(process.env.MONGO_URI_DEV_USERNAME);
const password = encodeURIComponent(process.env.MONGO_URI_DEV_PASSWORD);
const connection_endpoint = process.env.MONGO_URI_DEV_CONNECTION_ENDPOINT
const connectionString = 'mongodb://localhost:27017/test' || `mongodb+srv://${username}:${password}@${connection_endpoint}`;

const { LOGGER } = require('../lib/logger.lib.js');

exports.connect=()=>{
	mongoose.connect(
		connectionString
	).then(()=>{
		LOGGER.log('info',"SUCCESS[DB CONNECTION]")
	}).catch((error)=>{
		LOGGER.log('error',`ERROR[DB CONNECTION]: ${error}`);
		throw new Error('DB connection error')
	})
}
