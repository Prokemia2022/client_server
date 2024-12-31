const express = require('express');
const cors = require('cors');
const db = require("./config/database.js")
db.connect()

const app = express()
app.use(express.json())

let origins = ['http://localhost:3000','https://prokemia.com','https://test.prokemia.com',];
app.use(cors({credentials:true, origin: origins}));

// //routes

/**
 * 
 * 
 * 
 * 
 */
const auth_routes = require("./routes/AUTH.route.js");
const user_routes = require("./routes/USER.route.js");
const product_routes_v2 = require("./routes/PRODUCT.route.js");
const market_routes = require("./routes/MARKET.route.js");
const request_routes = require("./routes/REQUEST.route.js");
const support_routes = require('./routes/SUPPORT.route.js');
const ticket_routes = require('./routes/TICKET.route.js');
const document_routes = require('./routes/DOCUMENT.route.js');
const sales_routes = require('./routes/SALE.route.js');
const notifications_routes = require('./routes/NOTIFICATION.route.js');

const MARKETING_EMAIL_ROUTES = require('./routes/email_marketing.route.js');
const { USER_BASE_MODEL } = require('./models/USER.model.js');
const messaging = require('./lib/firebaseConfig.js');

// /*--V2---*/
app.use("/api/auth", auth_routes);
app.use("/api/user", user_routes);
app.use("/api/product", product_routes_v2);
app.use("/api/market", market_routes);
app.use("/api/request", request_routes);
app.use("/api/support", support_routes);
app.use("/api/ticket", ticket_routes);
app.use("/api/document", document_routes);
app.use("/api/sales", sales_routes);
app.use("/api/notifications", notifications_routes);
/*---control---*/

app.use('/api/marketing/email', MARKETING_EMAIL_ROUTES);

// /*---vacancies---*/

/*----support----*/
/*---prokemia_hub---*/

app.get('/',(req,res)=>{
	res.send("<html> <head>server Response</head><body><h1> This page was render directly from the server <p>Hello there welcome to Prokemia</p></h1></body></html>")
});

// Route to save tokens in your database (optional)
app.post("/api/token/save", async (req, res) => {
	const payload = req.body;
	const account_id = req.query.account_id;
	// save fcm token to account
	await USER_BASE_MODEL.updateOne({_id: account_id},{ $set: { fcm_token: payload?.token}});
	res.status(200).send({
		error: false,
		message: "Token saved successfully",
    });
});

module.exports = app;
