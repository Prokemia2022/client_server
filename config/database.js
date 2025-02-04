const mongoose = require("mongoose")
require("dotenv").config()
const username = encodeURIComponent(process.env.MONGO_URI_DEV_USERNAME);
const password = encodeURIComponent(process.env.MONGO_URI_DEV_PASSWORD);
const connection_cluster = process.env.MONGO_URI_DEV_CLUSTER;
//const connectionString = process.env.MONGO_URI_DEVELOPMENT_CONNECTION_STRING || `mongodb+srv://${username}:${password}@${connection_cluster}.mongodb.net/?retryWrites=true&w=majority`;
//const connection_endpoint = process.env.MONGO_URI_DEV_CONNECTION_ENDPOINT;
const connectionString = process.env.MONGO_URI_DEVELOPMENT_CONNECTION_STRING || `mongodb+srv://${username}:${password}@${connection_cluster}.mongodb.net/?retryWrites=true&w=majority`;


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
};