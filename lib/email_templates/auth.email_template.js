let BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000/api/auth/verify';
let FRONT_END_URL = process.env.FRONT_END_URL;

const WELCOME_EMAIL_TEMPLATE = (DATA) => {
    return `
        <!DOCTYPE html>
        <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Signup Confirmation</title>
                <link rel="preconnect" href="https://fonts.googleapis.com">
                <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
                <link href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap" rel="stylesheet">
            </head>
            <body style="font-family: 'Poppins', sans-serif; background-color: #f4f4f4; padding: 20px;">
                <table cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: auto; background-color: #fff; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
                    <tr>
                        <td style="padding: 20px; background-image: url('https://img.freepik.com/free-vector/colorful-confetti-background-with-text-space_1017-32374.jpg?t=st=1709576554~exp=1709580154~hmac=af18be7f82d0f35c43bf27c8b7682313354fd2ff94be7d3bc41da76babb9a6db&w=1060'); background-size: cover; background-position: center; border-top-left-radius: 10px; border-top-right-radius: 10px;">
                            <h2 style="color: #1F1F26; text-align: center; font-size: 32px;">Welcome to Prokemia</h2>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 20px;">
                            <p style="color: #666;">Dear ${DATA?.name},</p>
                            <p style="color: #666;">Welcome to Prokemia – The Marketplace for ingredients,Polymers and Chemistry.Search, Learn, Engage ,sample , quote and purchase from thousands of distributors - all in one platform.Access all easily.!
                            </p>
                            <p style="color: #666;">We are here to streamline your company operations and effortlessly market your products and improve your sales and customer outreach.
                            </p>
                            <p style="color: #666;">We're excited to embark on this journey with you!</p>
                            <p style="color: #666;">To complete your registration, please verify your email address by clicking the button below:</p>                            
                            <p style="text-align: center; margin-top: 30px;">
                                <a href=${BACKEND_URL+'/'+DATA?.email} style="background-color: #009393; color: #ffffff; text-decoration: none; padding: 12px 30px; border-radius: 30px; display: inline-block;">Verify your email</a>
                            </p>
                            <p style="color: #666;">
                                Best regards,
                                <br>Sammy,
                                <br>Operations.
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 20px; background-color: #f0f0f0; text-align: center;">
                            <p style="color: #999; font-size: 12px;">You are receiving this email because you opted in via our website.</p>
                            <p style="color: #999; font-size: 12px;">&copy; 2022 Prokemia. All rights reserved.</p>
                        </td>
                    </tr>
                </table>
            </body>
        </html>
    `
};

const SIGN_IN_EMAIL_TEMPLATE = (DATA)=>{
    return `
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
              <p style="color: #999; font-size: 12px;">&copy; 2022 Prokemia. All rights reserved.</p>
            </td>
          </tr>
          </table>
        </body>
      </html>
    `
}

const FLAG_ACCOUNT_DELETION_EMAIL_TEMPLATE = (DATA)=>{
    return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Account Deletion Notification</title>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900&display=swap" rel="stylesheet">
      </head>
      <body style="font-family: 'Poppins', sans-serif; background-color: #f4f4f4; padding: 20px;">
        <table cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: auto; background-color: #fff; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
          <tr>
            <td style="padding: 20px;text-align:center">
            <img src="https://firebasestorage.googleapis.com/v0/b/prokemia-file-upload-b636f.appspot.com/o/company_utils%2FPro.png?alt=media&token=208ca866-4b27-4f94-bf5a-3e3974e99a6a" alt="Banner" style="width: 100px; height:100px; border-top-left-radius: 10px; border-top-right-radius: 10px;">
          </td>
        </tr>
        <tr>
          <td style="padding: 20px;">
            <p style="color: #666;">Dear ${DATA?.name},</p>
            <p style="color: #666;">This is a confirmation that your account with <strong>Prokemia</strong> has been flagged for deletion. If no further action is taken, your account will be permanently deleted in the next <strong>30 days</strong>.</p>

            <h3 style="color: #333;">What this means:</h3>
            <ul style="color: #666; line-height: 1.6;">
              <li>All data associated with your account will be permanently deleted.</li>
              <li>You will no longer have access to products, requests, orders.</li>
              <li>This action is irreversible after 30 days.</li>
            </ul>

            <p style="color: #666;">If you did not request this, please <a href="https://yourwebsite.com/account-cancellation?email=${email}" style="color: #4E2FD7;">cancel the deletion request</a> or contact our support team.</p>

            <p style="color: #666;">Thank you for using Prokemia.</p>
            <p style="color: #666;">Best regards,</p>
            <p style="color: #666;">Sammy,<br/>Operations</p>
          </td>
        </tr>
        <tr>
          <td style="padding: 20px; background-color: #f0f0f0; text-align: center;">
            <p style="color: #999; font-size: 12px;">You are receiving this email because your account was flagged for deletion.</p>
            <p style="color: #999; font-size: 12px;">&copy; 2022, Prokemia . All rights reserved.</p>
          </td>
        </tr>
        </table>
      </body>
    </html>

    `
}

const ACCOUNT_DELETION_EMAIL_TEMPLATE = (DATA)=>{
    return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Account Deletion Confirmation</title>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900&display=swap" rel="stylesheet">
      </head>
      <body style="font-family: 'Poppins', sans-serif; background-color: #f4f4f4; padding: 20px;">
        <table cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: auto; background-color: #fff; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
          <tr>
            <td style="padding: 20px;text-align:center">
              <img src="https://firebasestorage.googleapis.com/v0/b/prokemia-file-upload-b636f.appspot.com/o/company_utils%2FPro.png?alt=media&token=208ca866-4b27-4f94-bf5a-3e3974e99a6a" alt="Banner" style="width: 100px; height:100px; border-top-left-radius: 10px; border-top-right-radius: 10px;">
            </td>
          </tr>
          <tr>
            <td style="padding: 20px;">
              <p style="color: #666;">Dear ${DATA?.name},</p>
              <p style="color: #666;">We regret to inform you that your account with <strong>Prokemia</strong> has been permanently deleted as per your request.</p>

              <h3 style="color: #333;">What this means:</h3>
              <ul style="color: #666; line-height: 1.6;">
                <li>All personal data, preferences, and transaction history associated with your account have been removed.</li>
                <li>You no longer have access to Prokemia or any associated services.</li>
                <li>This action is permanent and cannot be reversed.</li>
              </ul>

              <p style="color: #666;">If you wish to continue using our services in the future, you are welcome to create a new account at any time by visiting <a href="https://prokemia.com/auth/signup" style="color: #4E2FD7;">our registration page</a>.</p>

              <p style="color: #666;">Thank you for the time you spent with us, and we hope to see you again.</p>
              <p style="color: #666;">Best regards,</p>
              <p style="color: #666;">Sammy,<br/>Operations</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 20px; background-color: #f0f0f0; text-align: center;">
              <p style="color: #999; font-size: 12px;">This email confirms the permanent deletion of your account.</p>
              <p style="color: #999; font-size: 12px;">&copy; 2022 Prokemia. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </body>
    </html>
    `
};

const PASSWORD_RESET_CODE_EMAIL_TEMPLATE = (DATA)=>{
    return `
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
              <h2 style="color: #4E2FD7; text-align: center; font-size: 36px; margin-top: 20px;">[${DATA?.code}]</h2>
              <p style="color: #666;">If you did not request a password reset, please ignore this email. The OTP code will expire in 10 minutes for security reasons.</p>
              <p style="color: #666;">Thank you,</p>
              <p style="color: #666;">Prokemia</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 20px; background-color: #f0f0f0; text-align: center;">
              <p style="color: #999; font-size: 12px;">This email was sent to you because a password reset was requested for your account.</p>
              <p style="color: #999; font-size: 12px;">&copy; 2022 prokemia. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </body>
    </html>  
    `
};

const PASSWORD_CHANGED_EMAIL_TEMPLATE = (DATA)=>{
    return `
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
                  <p style="color: #999; font-size: 12px;">&copy; 2022 Prokemia All rights reserved.</p>
                </td>
              </tr>
            </table>
        </body>
    </html>  
    `
}

module.exports = {
	WELCOME_EMAIL_TEMPLATE,
	SIGN_IN_EMAIL_TEMPLATE,
	FLAG_ACCOUNT_DELETION_EMAIL_TEMPLATE,
	ACCOUNT_DELETION_EMAIL_TEMPLATE,
  PASSWORD_RESET_CODE_EMAIL_TEMPLATE,
  PASSWORD_CHANGED_EMAIL_TEMPLATE,
}
