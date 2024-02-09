const nodemailer = require("nodemailer");
require("dotenv").config()

let Transporter = nodemailer.createTransport({
    // name: process.env.TRANSPORTER_NAME,
    // host: process.env.TRANSPORTER_HOST,
    // port: process.env.TRANSPORTER_PORT,
    // secure: true, // true for 465, false for other ports
    // auth: {
    //     user: process.env.TRANSPORTER_AUTH_USER,
    //     pass: process.env.TRANSPORTER_AUTH_PASS,
    // },
    // tls:{
    //     rejectUnauthorized:false
    // }
    name: 'prokemia.com',
    host: "mail.prokemia.com",
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
        user: 'prokemia@prokemia.com', // generated ethereal user
        pass: 'i#9Xx4+6UYvmU4', // generated ethereal password 3vk:NrV497X
    },
    tls:{
        rejectUnauthorized:false
    }
});

module.exports = Transporter;