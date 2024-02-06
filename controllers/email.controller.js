const MailSender = require("../middleware/mailsender.middleware.js");

const welcome_new_user = (async (email) =>{
    const email_template = `
        <body style='font-family: Poppins; padding: 10px;'>
            <h2 style="color:#009898;font-size: 36px;text-align: center;">Welcome!</h2>
            <main style='margin-top: 10px;'>
            <p style='font-weight: bold;'> Hi,</p>
            <p style='font-weight: ;'> Welcome to <span style='color:#009393'></span>prokemia</span>. The Marketplace for
                ingredients,Polymers and Chemistry.Search, Learn, Engage ,sample , quote and purchase from thousands of
                suppliers - all in one platform.Access all easily.</p>
            <p>If you have any questions send us your issues at <a style='color:font-weight: bold;'
                href='mailto: help@prokemia.com' target="_blank">help@prokemia.com</a>.</br>We would love to hear from you.</p>
            </main>
        </body>
    `
    const payload = {
        receipient_email: email,
        subject : "Welcome to Prokemia",
        text: '',
        template: email_template
    }
    await MailSender(payload).then(()=>{
        console.log('email sent')
    }).catch((err)=>{
        console.log(err)
    });
});

const signed_in_user = (async (email) =>{
    const email_template = `
        <body style='font-family: Poppins; padding: 10px;'>
            <main style='margin-top: 10px;'>
                <p style='font-weight: bold;'> Hi,there</p>
                <br/>
                <p>We are verifying a recent signin for ${email}</p>
                <br/>
                <p> You are receiving this message because of a successful signin in our platform.</p>
                <p> If you believe that this signin is suspicious,</p>
                <a href='https://prokemia.com/password_reset?email=${email}'>please reset your password immediately.</a>
                <br/>
                <p>If you are aware of this sign-in, please disregard this notice. This can happen when you use your browser's incognito <br/> or private browsing mode or clear your cookies.</p>
                <br/>
                <p>Thanks</p>
                <br/>
                <p>Prokemia Team</p>
                <br/>
                <small style='textAlign: center;'>This email was sent from Prokemia.</small>
            </main>
        </body>
    `
    const payload = {
        receipient_email: email,
        subject : `Successful sign-in for ${email} from device`,
        text: '',
        template: email_template
    }
    await MailSender(payload).then(()=>{
        console.log(`sign-in email sent to ${email}`)
    }).catch((err)=>{
        console.log(err)
    });
});

const user_deleted_account = (async (email) =>{
    const email_template = `
        <body style='font-family: Poppins; padding: 10px;'>
            <h2 style="color:red;font-size: 36px;text-align: center;">Account has been deleted successfully.</h2>
            <main style='text-align:center'>
            <p style='text-align:center'> We are sad to see you leave. Your account has been deleted, and you can no longer access your profile.</p>
            <p style='text-align:center'>All user activity and products listed under this account has been deleted.</p>
            <p style='text-align:center'>If you have any questions send us your issues at <a style='color:text-align:center'
                href='mailto: help@prokemia.com' target="_blank">help@prokemia.com</a>.</br>We would love to hear from you.</p>
            </main>
        </body>
    `
    const payload = {
        receipient_email: email,
        subject : "Account deleted",
        text: '',
        template: email_template
    }
    await MailSender(payload).then(()=>{
        console.log('email sent')
    }).catch((err)=>{
        console.log(err)
    });
});

const send_otp = (async (req, res) =>{
    const data = req.body;
    console.log(data)
    const email_template = `
    <body style='font-family: Poppins; padding: 10px;'>
        <h2 style="color:#000;font-size: 36px;text-align: center;">Your OTP code to change your password.</h2>
        <main style='text-align:center'>
        <p onclick="copyText()" style="text-align:center;background-color: #009393;padding: 10px;color:#fff;border:none;font-size: 20px;font-weight:bold;">${data.code}</p>
        <p style='text-align:center'>If you have any questions send us your issues at <a style='color:text-align:center'
            href='mailto: help@prokemia.com' target="_blank">help@prokemia.com</a>.</br>We would love to hear from you.</p>
        </main>
        <script>
        function copyText() {
            /* Copy text into clipboard */
            navigator.clipboard.writeText
                (${data?.code});
        }
        </script>
    </body>
`
    const payload = {
        receipient_email: data?.email,
        subject : "OTP Code",
        text: '',
        template: email_template
    }
    await MailSender(payload).then(()=>{
        console.log('email sent')
        return res.status(200).send('success')
    }).catch((err)=>{
        console.log(err)
        return res.status(500).send('err')
    });
});

const password_changed = (async (email) =>{
    const email_template = `
        <body style='font-family: Poppins; padding: 10px;'>
        <h2 style="color:#000;font-size: 36px;text-align: center;">Your password has been changed successfuly.</h2>
        <main style='text-align:center'>
            <p style='text-align:center'> You recently changed your account password</p>
            <p style='text-align:center'>Dont Worry it happens!.</p>
            <p style='text-align:center'>If you have any questions send us your issues at <a style='color:text-align:center'
                href='mailto: help@prokemia.com' target="_blank">help@prokemia.com</a>.</br>We would love to hear from you.</p>
        </main>
        </body>
    `
    const payload = {
        receipient_email: email,
        subject : "Password changed successfully",
        text: '',
        template: email_template
    }
    await MailSender(payload).then(()=>{
        console.log('email sent')
        return 'success'
    }).catch((err)=>{
        console.log(err)
        return 'err'
    });
});

const send_email_otp = (async (req, res) =>{
    const data = req.body;
    console.log(data)
    const email_template = `
    <body style='font-family: Poppins; padding: 10px;'>
        <h2 style="color:#000;font-size: 36px;text-align: center;">Your OTP code to verify your account email.</h2>
        <main style='text-align:center'>
        <p onclick="copyText()" style="text-align:center;background-color: #009393;padding: 10px;color:#fff;border:none;font-size: 20px;font-weight:bold;">${data.code}</p>
        <p style='text-align:center'>If you have any questions send us your issues at <a style='color:text-align:center'
            href='mailto: help@prokemia.com' target="_blank">help@prokemia.com</a>.</br>We would love to hear from you.</p>
        </main>
        <script>
        function copyText() {
            /* Copy text into clipboard */
            navigator.clipboard.writeText
                (${data?.code});
        }
        </script>
    </body>
`
    const payload = {
        receipient_email: data?.email,
        subject : "Email OTP Code",
        text: '',
        template: email_template
    }
    await MailSender(payload).then(()=>{
        console.log('email sent')
        return res.status(200).send('success')
    }).catch((err)=>{
        console.log(err)
        return res.status(500).send('err')
    });
});

module.exports = {
    welcome_new_user,
    signed_in_user,
    user_deleted_account,
    send_otp,
    password_changed,
    send_email_otp
}