const express = require('express');
const cors = require('cors');
const db = require("./config/database.js")
db.connect()

const app = express()
app.use(express.json())

// app.use(cors({credentials:true, 
//     origin: 'http://localhost:3000' }));
let origins = ['https://prokemia-client-web-musembi77.vercel.app',
				'https://prokemia-client-web-git-master-musembi77.vercel.app',
				'http://localhost:3000',
				'https://prokemia-client-web.vercel.app',
				'https://client-frontend-two.vercel.app',
        'https://client-frontend-git-authenticationreconfig-prokemia2022.vercel.app',
				'https://prokemia.com'];
app.use(cors({credentials:true, origin: origins}));
//imports

/*--accounts---*/
const signup = require("./routes/Accounts/signup.js");
const password_reset = require("./routes/Accounts/auth_utils/password_reset.js");
const signin = require("./routes/Accounts/signin.js");
//client
const edit_client_account = require("./routes/Accounts/client_account/edit_client_account.js");
const get_client_account = require("./routes/Accounts/client_account/get_client_account.js");
const delete_client_account = require("./routes/Accounts/client_account/delete_client_account.js");
const change_client_password = require("./routes/Accounts/client_account/change_password.js");
const verify_client_account = require("./routes/Accounts/client_account/verify_client_account");
// const get_product = require("./routes/Accounts/client_account/get_products.js");

//distributor
const edit_distributor_account = require("./routes/Accounts/distributor_account/edit_distributor_account.js");
const get_distributor_account = require("./routes/Accounts/distributor_account/get_distributor_account.js");
const get_distributors = require("./routes/Accounts/distributor_account/get_distributors.js");
const delete_distributor_account = require("./routes/Accounts/distributor_account/delete_distributor_account.js");
const change_distributor_password = require("./routes/Accounts/distributor_account/change_password.js");
const add_new_expert_distributor = require("./routes/Accounts/distributor_account/add_new_expert.js");
const add_new_manufacturer_distributor = require("./routes/Accounts/distributor_account/add_new_manufacturer");
const delete_manufacturer_distributor = require("./routes/Accounts/distributor_account/delete_manufacturer.js");
const edit_manufacturer_distributor = require("./routes/Accounts/distributor_account/edit_manufacturer.js");
const delete_expert_distributor = require("./routes/Accounts/distributor_account/delete_expert.js");
const edit_expert_distributor = require("./routes/Accounts/distributor_account/edit_expert.js");
const verify_distributor_account = require("./routes/Accounts/distributor_account/verify_distributor_account.js");


//manufacturer
const edit_manufacturer_account = require("./routes/Accounts/manufacturers_account/edit_manufacturer_account.js");
const get_manufacturer_account = require("./routes/Accounts/manufacturers_account/get_manufacturer_account.js");
const get_manufacturers = require("./routes/Accounts/manufacturers_account/get_manufacturers.js");
const delete_manufacturer_account = require("./routes/Accounts/manufacturers_account/delete_manufacturer_account");
const change_manufacturer_password = require("./routes/Accounts/manufacturers_account/change_password.js");
const add_new_expert_manufacturer = require("./routes/Accounts/manufacturers_account/add_new_expert.js");
const add_new_distributor_manufacturer = require("./routes/Accounts/manufacturers_account/add_new_distributor.js");
const create_request = require("./routes/Accounts/manufacturers_account/create_request");
const delete_distributor_manufacturer = require("./routes/Accounts/manufacturers_account/delete_distributor.js");
const edit_distributor_manufacturer = require("./routes/Accounts/manufacturers_account/edit_distributors.js");
const delete_expert_manufacturer = require("./routes/Accounts/manufacturers_account/delete_expert.js");
const edit_expert_manufacturer = require("./routes/Accounts/manufacturers_account/edit_expert.js");
const verify_manufacturer_account = require("./routes/Accounts/manufacturers_account/verify_manufacturer_account.js");


//sales
const edit_salesperson_account = require("./routes/Accounts/salesperson_account/edit_salesperson_account.js");//done
const get_salesperson_account = require("./routes/Accounts/salesperson_account/get_salesperson_account.js");//done
const delete_salesperson_account = require("./routes/Accounts/salesperson_account/delete_salesperson_account.js");//done
const change_salesperson_password = require("./routes/Accounts/salesperson_account/change_password.js");
const create_hub_account = require("./routes/Accounts/salesperson_account/create_hub_account.js");
const delete_hub_account = require("./routes/Accounts/salesperson_account/delete_hub_account.js");
const edit_hub_account = require("./routes/Accounts/salesperson_account/edit_hub_account.js");
const create_order = require("./routes/orders/create_order.js");//
const get_orders = require("./routes/orders/get_orders.js");//
const verify_salesperson_account = require("./routes/Accounts/salesperson_account/verify_salesperson_account.js");

/*---control---*/
const get_industries = require("./routes/control/get_industries.js");
const get_technologies = require("./routes/control/get_technologies.js");
const suggest_industry = require("./routes/control/suggest_industry.js");
const suggest_technology = require("./routes/control/suggest_technology.js");

/*---product---*/
const add_product = require("./routes/product/add_product.js");
const get_products = require("./routes/product/get_products.js");
const get_product = require("./routes/product/get_product.js");
const delete_product = require("./routes/product/delete_product.js");
const edit_product = require("./routes/product/edit_product.js");
const feature_product = require("./routes/product/feature_product.js");
const un_feature_product = require("./routes/product/un_feature_product.js");
const fetch_products_by_lister = require('./routes/product/get_products_by_lister.js')
const fetch_products_by_search = require('./routes/product/get_products_by_search.js')
	
/*---expert_consultaion---*/
const get_expert_accounts = require("./routes/expert_consultation/get_expert_accounts.js");
const get_expert_account = require("./routes/expert_consultation/get_expert_account.js");
const create_expert_account = require("./routes/expert_consultation/create_expert_account.js");
const delete_expert_account = require("./routes/expert_consultation/delete_expert_account.js");
const edit_expert_account = require("./routes/expert_consultation/edit_expert_account.js");

// /*---favourites---*/
// const add_distributor_to_favourite = require("./routes/favourites/add_distributor_to_favourite.js");
// const add_industry_to_favourite = require("./routes/favourites/add_industry_to_favourite.js");
// const add_manufacturer_to_favourite = require("./routes/favourites/add_manufacturer_to_favourite.js");
// const add_product_to_favourite = require("./routes/favourites/add_product_to_favourite.js");
// const add_technology_to_favourite = require("./routes/favourites/add_technology_to_favourite.js");

// /*---orders---*/
// const create_order = require("./routes/orders/create_order.js");
// const edit_order = require("./routes/orders/edit_order.js");
// const get_orders = require("./routes/orders/get_orders.js");
// const create_invoice = require("./routes/orders/create_invoice.js");

// /*---vacancies---*/
// const add_vacancy = require("./routes/vacancies/add_vacancy.js");
// const delete_vacancy = require("./routes/vacancies/delete_vacancy.js");
// const edit_vacancy = require("./routes/vacancies/edit_vacancy.js");
const get_vacancies = require("./routes/vacancies/get_vacancies.js");
const apply_to_vacancy = require("./routes/vacancies/apply_to_vacancy.js")



// /*---subcription_plan---*/
// const add_new_plan = require("./routes/subscription_plan/add_new_plan.js");
// const delete_plan = require("./routes/subscription_plan/delete_plan.js");
// const edit_plan = require("./routes/subscription_plan/edit_plan.js");
// const get_subscription_plans = require("./routes/subscription_plan/get_subscription_plans.js");


/*---support----*/
const create_career_mailing_list = require("./routes/Support/create_career_mailing_list.js");
const get_career_mailing_list = require("./routes/Support/get_carrer_mailing_list.js");
const create_feedback = require("./routes/Support/create_feedback.js");
const get_feedbacks = require("./routes/Support/get_feedbacks.js");
const create_support_question = require("./routes/Support/create_support_questions.js");
const get_support_questions = require("./routes/Support/get_support_questions.js");
const create_landing_page_mailing_list = require("./routes/Support/Landing_page_mailing_list.js");
const get_langing_page_mailing_list = require("./routes/Support/get_landing_page_mailing_list.js");
const create_request_demo_ticket = require("./routes/Support/create_request_demo_ticket.js");
// //routes

// /*--account---*/
app.use("/api/signup",signup);//done
app.use("/api/signin",signin);//done
app.use("/api/password_reset",password_reset);//done
//client
app.use("/api/edit_client_account",edit_client_account);//done
app.use("/api/get_client_account",get_client_account);//done
app.use("/api/delete_client_account",delete_client_account);//done
app.use("/api/verify_client_account",verify_client_account);
app.use("/api/change_client_password",change_client_password);
//distributor
app.use("/api/edit_distributor_account",edit_distributor_account);//done
app.use("/api/get_distributor_account",get_distributor_account);//done
app.use("/api/get_distributors",get_distributors);//done
app.use("/api/delete_distributor_account",delete_distributor_account);//done
app.use("/api/change_distributor_password",change_distributor_password);//done
app.use("/api/add_new_expert_distributor",add_new_expert_distributor);//done
app.use("/api/add_new_manufacturer_distributor",add_new_manufacturer_distributor);//done
app.use("/api/delete_manufacturer_distributor",delete_manufacturer_distributor);
app.use("/api/edit_manufacturer_distributor",edit_manufacturer_distributor);
app.use("/api/delete_expert_distributor",delete_expert_distributor);
app.use("/api/edit_expert_distributor",edit_expert_distributor);
app.use("/api/verify_distributor_account",verify_distributor_account);
/*
	
	
	
	
	app.use("/api/get_products_distributor",get_products_distributor);
	app.use("/api/sponsor_product_distributor",sponsor_product_distributor);
	app.use("/api/subscribe_to_plan_distributor",subscribe_to_plan_distributor);
*/

//manufacturer
app.use("/api/edit_manufacturer_account",edit_manufacturer_account);//done
app.use("/api/get_manufacturer_account",get_manufacturer_account);//done
app.use("/api/get_manufacturers",get_manufacturers);//done
app.use("/api/delete_manufacturer_account",delete_manufacturer_account);//done
app.use("/api/change_manufacturer_password",change_manufacturer_password);
app.use("/api/add_new_expert_manufacturer",add_new_expert_manufacturer);//done
app.use("/api/add_new_distributor_manufacturer",add_new_distributor_manufacturer);//done
app.use("/api/create_request",create_request);//done
app.use("/api/delete_distributor_manufacturer",delete_distributor_manufacturer);
app.use("/api/edit_distributor_manufacturer",edit_distributor_manufacturer);
app.use("/api/delete_expert_manufacturer",delete_expert_manufacturer);
app.use("/api/edit_expert_manufacturer",edit_expert_manufacturer);
app.use("/api/verify_manufacturer_account",verify_manufacturer_account);
/*
	
	
	
	
	app.use("/api/get_products_manufacturer",get_products_manufacturer);
	app.use("/api/sponsor_product_manufacturer",sponsor_product_manufacturer);
	app.use("/api/subscribe_to_plan_manufacturer",subscribe_to_plan_manufacturer);
*/

//salesperson
app.use("/api/edit_salesperson_account",edit_salesperson_account);//done
app.use("/api/get_salesperson_account",get_salesperson_account);//done
app.use("/api/delete_salesperson_account",delete_salesperson_account);//done
app.use("/api/change_salesperson_password",change_salesperson_password);
app.use("/api/create_hub_account",create_hub_account);
app.use("/api/delete_hub_account",delete_hub_account);
app.use("/api/edit_hub_account",edit_hub_account);
app.use("/api/create_order",create_order);//done
app.use("/api/get_orders",get_orders);//done 
app.use("/api/verify_salesperson_account",verify_salesperson_account);

/*---control---*/
app.use("/api/get_industries",get_industries);//done
app.use("/api/get_technologies",get_technologies);//done
app.use("/api/suggest_industry",suggest_industry);//done
app.use("/api/suggest_technology",suggest_technology);//done

// /*---favourites---*/
// app.use("/api/add_industry_to_favourite",add_industry_to_favourite);
// app.use("/api/add_distributor_to_favourite",add_distributor_to_favourite);
// app.use("/api/add_manufacturer_to_favourite",add_manufacturer_to_favourite);
// app.use("/api/add_product_to_favourite",add_product_to_favourite);
// app.use("/api/add_technology_to_favourite",add_technology_to_favourite);

/*---product---*/
app.use("/api/add_product",add_product);//done
app.use("/api/get_products",get_products);//done
app.use("/api/get_product",get_product);//done
app.use("/api/delete_product",delete_product);//done
app.use("/api/edit_product",edit_product);//done
app.use("/api/feature_product",feature_product);//done
app.use("/api/un_feature_product",un_feature_product);//done
app.use("/api/fetch_products_by_lister",fetch_products_by_lister);
app.use("/api/fetch_products_by_search",fetch_products_by_search);

/*---expert_consultaion---*/
app.use("/api/create_expert_account",create_expert_account);
app.use("/api/get_expert_accounts",get_expert_accounts);
app.use("/api/get_expert_account",get_expert_account);
app.use("/api/delete_expert_account",delete_expert_account);
app.use("/api/edit_expert_account",edit_expert_account);


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
