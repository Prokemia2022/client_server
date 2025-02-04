const { CRON_HANDLE_ACCOUNT_DELETION } = require("../user/user.delete.controller");

// Run the worker periodically (e.g., every once a day)
cron.schedule('30 10 * * * *', async() => {
	await CRON_HANDLE_ACCOUNT_DELETION()
});