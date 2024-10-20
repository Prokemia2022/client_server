const nodemailer = require("nodemailer");
require("dotenv").config()

let Transporter = nodemailer.createTransport({
    // name: process.env.TRANSPORTER_NAME,
    // host: process.env.TRANSPORTER_HOST,
    // port: process.env.TRANSPORTER_PORT,
    // secure: false, // true for 465, false for other ports
    // auth: {
    //     user: process.env.TRANSPORTER_AUTH_USER,
    //     pass: process.env.TRANSPORTER_AUTH_PASS,
    // },
    // tls:{
    //     rejectUnauthorized:false
    // }
    name: process.env.TRANSPORTER_NAME || 'prokemia.com',
    host: process.env.TRANSPORTER_HOST || "mail.prokemia.com",
    port: process.env.TRANSPORTER_PORT || 465,
	secure:  process.env.TRANSPORTER_PORT === 465 ? true : false, // true for 465, false for other ports
    auth: {
        user: process.env.TRANSPORTER_AUTH_USER || 'prokemia@prokemia.com', // generated ethereal user
        pass: process.env.TRANSPORTER_AUTH_PASS || 'i#9Xx4+6UYvmU4', // generated ethereal password 3vk:NrV497X
    },
    tls:{
        rejectUnauthorized:false
    },
    // debug: true,
    // logger: true,
});

module.exports = Transporter;
