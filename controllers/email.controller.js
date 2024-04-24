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
    <!DOCTYPE html>
    <html lang="en">
    <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sign-in Confirmation</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap" rel="stylesheet">
    </head>
    <body style="font-family: 'Poppins', sans-serif; background-color: #f4f4f4; padding: 20px;">
    
    <table cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: auto; background-color: #fff; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
      <tr>
        <td style="padding: 20px;text-align:center" >
          <img src="https://firebasestorage.googleapis.com/v0/b/prokemia-file-upload-b636f.appspot.com/o/company_utils%2FPro.png?alt=media&token=208ca866-4b27-4f94-bf5a-3e3974e99a6a" alt="Banner" style="width: 100px; height:100px; border-top-left-radius: 10px; border-top-right-radius: 10px; ">
        </td>
      </tr>
      <tr>
        <td style="padding: 20px;">
          <p style="color: #666;">Hi there,</p>
          <p style="color: #666;">You have successfully signed in to your account.</p>
          <p style="color: #666;">If this sign-in was not initiated by you, please <a href="https://prokemia.com/password_reset?email=${email}" style="color: #4E2FD7;">secure your account</a> and contact us immediately.</p>
          <p style="color: #666;">Thank you for using our service.</p>
          <p style="color: #666;">Best regards,</p>
          <p style="color: #666;">Prokemia</p>
        </td>
      </tr>
      <tr>
        <td style="padding: 20px; background-color: #f0f0f0; text-align: center;">
          <p style="color: #999; font-size: 12px;">You received this email because you signed in to your account on our website.</p>
          <p style="color: #999; font-size: 12px;">&copy; 2024 Prokemia. All rights reserved.</p>
        </td>
      </tr>
    </table>
    
    </body>
    </html>    
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
    <!DOCTYPE html>
    <html lang="en">
    <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset OTP Code</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap" rel="stylesheet">
    </head>
    <body style="font-family: 'Poppins', sans-serif; background-color: #f4f4f4; padding: 20px;">
    
    <table cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: auto; background-color: #fff; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
      <tr>
        <td style="padding: 20px;text-align:center" >
            <img src="https://firebasestorage.googleapis.com/v0/b/prokemia-file-upload-b636f.appspot.com/o/company_utils%2FPro.png?alt=media&token=208ca866-4b27-4f94-bf5a-3e3974e99a6a" alt="Banner" style="width: 100px; height:100px; border-top-left-radius: 10px; border-top-right-radius: 10px; ">
        </td>
      </tr>
      <tr>
        <td style="padding: 20px;">
          <p style="color: #666;">Hi there,</p>
          <p style="color: #666;">You have requested to reset your password. Please use the OTP code below to reset your password:</p>
          <h2 style="color: #4E2FD7; text-align: center; font-size: 36px; margin-top: 20px;">[${data?.code}]</h2>
          <p style="color: #666;">If you did not request a password reset, please ignore this email. The OTP code will expire in 10 minutes for security reasons.</p>
          <p style="color: #666;">Thank you,</p>
          <p style="color: #666;">Prokemia</p>
        </td>
      </tr>
      <tr>
        <td style="padding: 20px; background-color: #f0f0f0; text-align: center;">
          <p style="color: #999; font-size: 12px;">This email was sent to you because a password reset was requested for your account.</p>
          <p style="color: #999; font-size: 12px;">&copy; 2024 prokemia. All rights reserved.</p>
        </td>
      </tr>
    </table>
    
    </body>
    </html>    
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
    <!DOCTYPE html>
    <html lang="en">
    <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset Confirmation</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap" rel="stylesheet">
    </head>
    <body style="font-family: 'Poppins', sans-serif; background-color: #f4f4f4; padding: 20px;">
    
    <table cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: auto; background-color: #fff; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
      <tr>
        <td style="padding: 20px;text-align:center" >
          <img src="https://firebasestorage.googleapis.com/v0/b/prokemia-file-upload-b636f.appspot.com/o/company_utils%2FPro.png?alt=media&token=208ca866-4b27-4f94-bf5a-3e3974e99a6a" alt="Banner" style="width: 100px; height:100px; border-top-left-radius: 10px; border-top-right-radius: 10px; ">
        </td>
      </tr>
      <tr>
        <td style="padding: 20px;">
          <p style="color: #666;">Hi there,</p>
          <p style="color: #666;">Your password has been successfully reset.</p>
          <p style="color: #666;">If you did not initiate this password reset, please contact us immediately.</p>
          <p style="color: #666;">Thank you for using our service.</p>
          <p style="color: #666;">Best regards,</p>
          <p style="color: #666;">Prokemia</p>
        </td>
      </tr>
      <tr>
        <td style="padding: 20px; background-color: #f0f0f0; text-align: center;">
          <p style="color: #999; font-size: 12px;">This email was sent to you as a confirmation of your password reset on our website.</p>
          <p style="color: #999; font-size: 12px;">&copy; 2024 Prokemia
    
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
const sample_confirmation_request = (async (data) =>{
    const email_template = `

    <!DOCTYPE html>
    <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Sample Request Confirmation - ${data?.product_name}</title>
            <link rel="preconnect" href="https://fonts.googleapis.com">
            <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
            <link href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap" rel="stylesheet">
            <style>
                .highlight {
                    background-color: #009393;
                    color: #fff;
                    padding: 5px 10px;
                    border-radius: 5px;
                    display: inline-block;
                    margin-bottom: 10px;
                }
            </style>
        </head>
        <body style="font-family: 'Poppins', sans-serif; background-color: #f4f4f4; padding: 20px;">
            <table cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: auto; background-color: #fff; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
            <tr>
                <td style="padding: 20px;text-align:center" >
                <img src="https://firebasestorage.googleapis.com/v0/b/prokemia-file-upload-b636f.appspot.com/o/company_utils%2FPro.png?alt=media&token=208ca866-4b27-4f94-bf5a-3e3974e99a6a" alt="Banner" style="width: 100px; height:100px; border-top-left-radius: 10px; border-top-right-radius: 10px; ">
                </td>
            </tr>
            <tr>
                <td style="padding: 20px;">
                    <h2>Sample Request Confirmation - ${data?.product_name}</h2>
                    <p>Dear ${data?.first_name},</p>
                    <p>We are pleased to confirm the your sample request for ${data?.product_name} has been sent to the supplier.Your order is being processed and you will be updated on the status shortly.</p>
                    <p>Details of your request:</p>
                    <ul>
                        <li><strong>Order ID:</strong> ${data?.sample_id}</li>
                        <li><strong>Requested Items:</strong> ${data?.number_of_samples} ${data?.units}</li>
                        <li><strong>Delivery Address:</strong>${data?.client_address}</li>
                        <li><strong>Product details:</strong><a href='https://prokemia.com/products/product?pid=${data?.product_id}'>${data?.product_name}<a/></li>
                    </ul>
                    <small class="highlight">Please note that this is a confirmation email and does not signify shipment or delivery.</small>
                    <p>Thank you for choosing our services. If you have any questions or need further assistance, please feel free to contact us. <a href='mailto:customer@prokemia.com'>customer@prokemia.com</a></p>
                    <p style="color: #666;">Best regards,</p>
                    <p style="color: #666;">Sales Team, Prokemia</p>
                </td>
            </tr>
            <tr>
                <td style="padding: 20px; background-color: #f0f0f0; text-align: center;">
                    <p>You are receiving this email because you placed an order with our platform.</p>
                    <p style="color: #999; font-size: 12px;">&copy; 2024 Prokemia. All rights reserved.</p>
                </td>
            </tr>
            </table>
        </body>
    </html>
`
    const payload = {
        receipient_email: data?.client_email,
        subject : `Sample Request Confirmation - ${data?.product_name}`,
        text: '',
        template: email_template
    }
    await MailSender(payload).then(()=>{
        console.log('email sent')
        //return res.status(200).send('success')
    }).catch((err)=>{
        console.log(err)
        //return res.status(500).send('err')
    });
});
const sample_supplier_request = (async (data) =>{
    const email_template = `
    <!DOCTYPE html>
    <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Sample Request Confirmation - ${data?.product_name}</title>
            <link rel="preconnect" href="https://fonts.googleapis.com">
            <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
            <link href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap" rel="stylesheet">
            <style>
                .highlight {
                    background-color: #0202;
                    color: #fff;
                    padding: 5px 10px;
                    border-radius: 5px;
                    display: inline-block;
                    margin-bottom: 10px;
                    margin-top:10px;
                }
                .button1 {
                    display: inline-block;
                    background-color: #009393;
                    color: #ffffff;
                    text-decoration: none;
                    padding: 10px 20px;
                    border-radius: 5px;
                }
                .button2 {
                    display: inline-block;
                    background-color: #000;
                    color: #ffffff;
                    text-decoration: none;
                    padding: 10px 20px;
                    border-radius: 5px;
                }
            </style>
        </head>
        <body style="font-family: 'Poppins', sans-serif; background-color: #f4f4f4; padding: 20px;">
            <table cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: auto; background-color: #fff; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
            <tr>
                <td style="padding: 20px;text-align:center" >
                <img src="https://firebasestorage.googleapis.com/v0/b/prokemia-file-upload-b636f.appspot.com/o/company_utils%2FPro.png?alt=media&token=208ca866-4b27-4f94-bf5a-3e3974e99a6a" alt="Banner" style="width: 100px; height:100px; border-top-left-radius: 10px; border-top-right-radius: 10px; ">
                </td>
            </tr>
            <tr>
                <td style="padding: 20px;">
                    <h2>Sample Request Order - ${data?.product_name}</h2>
                    <p>Dear sir/madam,</p>
                    <p>We are pleased to inform you that you have received a sample request for ${data?.product_name} from a client from <a href='https://prokemia.com'>Prokemia</a>. Visit your dashboard to approve the request made by the client.</p>
                    <p>Details of the sample request:</p>
                    <ul>
                        <li><strong>Order ID:</strong> ${data?.sample_id}</li>
                        <li><strong>Requested Items:</strong> ${data?.number_of_samples} ${data?.units}</li>
                        <li><strong>Delivery Address:</strong>${data?.client_address}</li>
                        <li><strong>Special Instructions:</strong> ${data?.additional_info}</li>
                        <li><strong>Product details:</strong><a href='https://prokemia.com/products/product?pid=${data?.product_id}'>${data?.product_name}<a/></li>
                    </ul>
                      <p>Please prepare the sample according to the provided specifications and deliver it to the mentioned address. Your prompt attention to this request would be highly appreciated.</p>
                    <div style='display:flex, justifyContent:center, width:100%,alignItems:center'>
                        <a href="https://prokemia.com/dashboard/distributor?uid=${data?.listed_by_id}" class="button1">Access Supplier Portal</a>
                        <a href="mailto:${data?.client_email}?subject=Re:%20Sample%20Order&body=We%20Have%20Received%20your%20request%20and%20we%20are%20working%20on%20it" class="button2">Email this client</a>
                    </div>
                    <small class="highlight">Please note that this is a confirmation email and does not signify shipment or delivery.</small>
                    <p>Thank you for choosing our services. If you have any questions or need further assistance, please feel free to contact us. <a href='mailto:customer@prokemia.com'>customer@prokemia.com</a></p>
                    <p style="color: #666;">Best regards,</p>
                    <p style="color: #666;">Sales Team, Prokemia</p>
                </td>
            </tr>
            <tr>
                <td style="padding: 20px; background-color: #f0f0f0; text-align: center;">
                    <p>You are receiving this email because an order was placed on our platform.</p>
                    <p style="color: #999; font-size: 12px;">&copy; 2024 Prokemia. All rights reserved.</p>
                </td>
            </tr>
            </table>
        </body>
    </html>
`
    const payload = {
        receipient_email: data?.lister_email,
        subject : `Sample Request Order - ${data?.product_name}`,
        text: '',
        template: email_template
    }
    await MailSender(payload).then(()=>{
        console.log('email sent')
        //return res.status(200).send('success')
    }).catch((err)=>{
        console.log(err)
        //return res.status(500).send('err')
    });
});
const sample_status_notification = (async (data) =>{
    const email_template =
    `
    <!DOCTYPE html>
    <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Sample Order Status Update - ${data?.product_name}</title>
            <link rel="preconnect" href="https://fonts.googleapis.com">
            <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
            <link href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap" rel="stylesheet">
            <style>
                .highlight {
                    background-color: #009393;
                    color: #fff;
                    padding: 5px 10px;
                    border-radius: 5px;
                    display: inline-block;
                    margin-bottom: 10px;
                }
            </style>
        </head>
        <body style="font-family: 'Poppins', sans-serif; background-color: #f4f4f4; padding: 20px;">
            <table cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: auto; background-color: #fff; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
            <tr>
                <td style="padding: 20px;text-align:center" >
                <img src="https://firebasestorage.googleapis.com/v0/b/prokemia-file-upload-b636f.appspot.com/o/company_utils%2FPro.png?alt=media&token=208ca866-4b27-4f94-bf5a-3e3974e99a6a" alt="Banner" style="width: 100px; height:100px; border-top-left-radius: 10px; border-top-right-radius: 10px; ">
                </td>
            </tr>
            <tr>
                <td style="padding: 20px;">
                    <h2>Sample Request Update - ${data?.product_name}</h2>
                    <p>Dear ${data?.first_name},</p>
                    <p>We would like to inform you about the current status of your sample order.</p>
                    <p>Details of your request:</p>
                    <ul>
                        <li><strong>Order ID:</strong> ${data?.sample_id}</li>
                        <li><strong>Requested Items:</strong> ${data?.number_of_samples} ${data?.units}</li>
                        <li><strong>Status:</strong>${data?.sample_status}</li>
                        <li><strong>Product details:</strong><a href='https://prokemia.com/products/product?pid=${data?.product_id}'>${data?.product_name}<a/></li>
                    </ul>
                    <p>Thank you for choosing our services. If you have any questions or need further assistance, please feel free to contact us. <a href='mailto:customer@prokemia.com'>customer@prokemia.com</a></p>
                    <p style="color: #666;">Best regards,</p>
                    <p style="color: #666;">Sales Team, Prokemia</p>
                </td>
            </tr>
            <tr>
                <td style="padding: 20px; background-color: #f0f0f0; text-align: center;">
                    <p>You are receiving this email because you placed an order with our platform.</p>
                    <p style="color: #999; font-size: 12px;">&copy; 2024 Prokemia. All rights reserved.</p>
                </td>
            </tr>
            </table>
        </body>
    </html>
    `
    const payload = {
        receipient_email: data?.client_email,
        subject : `Sample Request Update - ${data?.product_name}`,
        text: '',
        template: email_template
    }
    await MailSender(payload).then(()=>{
        console.log('email sent')
        //return res.status(200).send('success')
    }).catch((err)=>{
        console.log(err)
        //return res.status(500).send('err')
    });
});

module.exports = {
    welcome_new_user,
    signed_in_user,
    user_deleted_account,
    send_otp,
    password_changed,
    send_email_otp,
    sample_confirmation_request,
    sample_supplier_request,
    sample_status_notification
}