const express = require('express');
const cors = require('cors');
const db = require("./config/database.js")
db.connect()

const app = express()
app.use(express.json())

let origins = ['http://localhost:3000','https://prokemia.com','https://client-frontend-gpzrux78e-prokemia2022.vercel.app/'];
app.use(cors({credentials:true, origin: origins}));

/*---control---*/
const suggest_industry = require("./routes/control/suggest_industry.js");
const suggest_technology = require("./routes/control/suggest_technology.js");

const get_vacancies = require("./routes/vacancies/get_vacancies.js");
const apply_to_vacancy = require("./routes/vacancies/apply_to_vacancy.js")

/*---support----*/
const create_career_mailing_list = require("./routes/Support/create_career_mailing_list.js");
const create_feedback = require("./routes/Support/create_feedback.js");
const get_feedbacks = require("./routes/Support/get_feedbacks.js");
const create_support_question = require("./routes/Support/create_support_questions.js");
const create_landing_page_mailing_list = require("./routes/Support/Landing_page_mailing_list.js");
const create_request_demo_ticket = require("./routes/Support/create_request_demo_ticket.js");
// //routes

/**
 * 
 * 
 * 
 * 
 */

const signup_routes = require('./routes/signup.route.js');
const signin_routes = require('./routes/signin.route.js')
const delete_account_routes = require('./routes/delete_acc.route.js');
const industry_routes = require('./routes/industries.route.js');
const technology_routes = require('./routes/technologies.route.js');
const product_routes = require('./routes/products.route.js');
const distibutor_routes = require('./routes/distributor.route.js');
const manufacturer_routes = require('./routes/manufacturer.route.js');
const salesperson_routes = require('./routes/salesperson.route.js')
const client_routes = require('./routes/client.route.js');
const password_reset_routes = require('./routes/password_reset.route.js');
const sales_routes = require('./routes/sale.route.js');
const otp_routes = require('./routes/otp.route.js');
const quote_routes = require('./routes/quote.route.js');
const sample_routes = require('./routes/sample.route.js');
const consultation_routes = require('./routes/consultations.route.js')
const Verifying_email_routes = require('./routes/verify_email.route.js')

const update_script_route = require('./middleware/scripts/update_user_account.js');
app.use('/api/script',update_script_route)
const fetch_det_script_route = require('./middleware/scripts/fetch_user_details.middleware.js');
app.use('/api/script',fetch_det_script_route);


// /*--account---*/

/*---control---*/
app.use("/api/suggest_industry",suggest_industry);//done
app.use("/api/suggest_technology",suggest_technology);//done

app.use('/api/signup',signup_routes);
app.use('/api/signin', signin_routes);
app.use('/api/industries', industry_routes);
app.use('/api/technologies', technology_routes);
app.use('/api/products', product_routes);
app.use('/api/distributor', distibutor_routes);
app.use('/api/manufacturer', manufacturer_routes);
app.use('/api/salesperson', salesperson_routes);
app.use('/api/client', client_routes);
app.use('/api/delete', delete_account_routes);
app.use('/api/password_reset', password_reset_routes);
app.use('/api/sales', sales_routes);
app.use('/api/otp', otp_routes)
app.use('/api/quote', quote_routes);
app.use('/api/sample', sample_routes);
app.use('/api/consultation', consultation_routes);
app.use('/api/verify_email', Verifying_email_routes);

// /*---vacancies---*/
app.use("/api/get_vacancies",get_vacancies);//done
app.use("/api/apply_to_vacancy",apply_to_vacancy);

/*----support----*/
app.use("/api/create_career_mailing_list",create_career_mailing_list);//done
app.use("/api/create_feedback",create_feedback);//done
app.use("/api/get_feedbacks",get_feedbacks);
app.use("/api/create_support_question",create_support_question);//done
app.use("/api/add_email_to_mailing_list",create_landing_page_mailing_list);//done
app.use("/api/create_request_demo_ticket",create_request_demo_ticket);
/*---prokemia_hub---*/

app.get('/',(req,res)=>{
	res.send("<html> <head>server Response</head><body><h1> This page was render directly from the server <p>Hello there welcome to Prokemia</p></h1></body></html>")
})

module.exports = app;
