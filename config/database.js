const mongoose = require("mongoose")
require("dotenv").config()
const username = encodeURIComponent(process.env.MONGO_URI_DEV_USERNAME);
const password = encodeURIComponent(process.env.MONGO_URI_DEV_PASSWORD);
const connection_endpoint = process.env.MONGO_URI_DEV_CONNECTION_ENDPOINT
const connectionString = 'mongodb://localhost:27017/prokemia_v2' || `mongodb+srv://${username}:${password}@${connection_endpoint}`;

const { LOGGER } = require('../lib/logger.lib.js');

exports.connect=()=>{
	mongoose.connect(
		connectionString
	).then(()=>{
		LOGGER.log('info',"db connected successfully")
	}).catch((err)=>{
		LOGGER.log('error',err);
		return err
	})
}
