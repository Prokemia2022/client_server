const http = require("http");
const app = require("./app.js");
require("dotenv").config();
const { LOGGER } = require('./lib/logger.lib.js');

const server = http.createServer(app);
const port = process.env.PORT || 5000;

server.listen(port, (req,res)=>{
	LOGGER.log('info',`server listening on http://localhost:${port}`)
});

// Start the notification worker
require('./controllers/notifications/worker.js'); 
// Ensure the worker starts processing notifications
