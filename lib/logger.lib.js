const winston = require('winston');
const { combine, label, timestamp, prettyPrint, colorize } = winston.format;

const LOGGER = winston.createLogger({
	format: combine(
		label({ label: process.env.LOGGER_ENV_LABEL}),
		timestamp(),
		prettyPrint(),
		colorize()
	),
	defaultMeta: { service: 'user-service' },
	transports: [
		new winston.transports.Console(),
	]
});

module.exports = {
	LOGGER
};
