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
const document_routes = require('./routes/DOCUMENT.route.js');

const MARKETING_EMAIL_ROUTES = require('./routes/email_marketing.route.js');

// /*--V2---*/
app.use("/api/auth", auth_routes);
app.use("/api/user", user_routes);
app.use("/api/product", product_routes_v2);
app.use("/api/market", market_routes);
app.use("/api/request", request_routes);
app.use("/api/support", support_routes);
app.use("/api/document", document_routes);
/*---control---*/

app.use('/api/marketing/email', MARKETING_EMAIL_ROUTES);

// /*---vacancies---*/

/*----support----*/
/*---prokemia_hub---*/

app.get('/',(req,res)=>{
	res.send("<html> <head>server Response</head><body><h1> This page was render directly from the server <p>Hello there welcome to Prokemia</p></h1></body></html>")
})

module.exports = app;
