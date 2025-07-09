const Transporter = require("./transporter.middleware");

const MailSender = async (payload)=>{
    const {receipient_email, subject, text, template} = {...payload};
    let sender_email = process.env.SENDER_EMAIL;

    const mailOptions = {
        from: sender_email, // sender address
        to: receipient_email, // list of receivers
        subject: subject, // Subject line
        text: text, // plain text body
        html: template, // html body
    };
    
    Transporter.sendMail(mailOptions, function (err, info){
        if(err){
            console.log(err)
            //throw new Error('error while sending email')
        }else{
            console.log(info,{'sender_email':sender_email},{'receipient_email':receipient_email})
        }
    })
}

module.exports = MailSender;