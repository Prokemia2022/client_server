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
		new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
        new winston.transports.File({ filename: 'logs/info.log', level: 'info' }),
	]
});

module.exports = {
	LOGGER
};
