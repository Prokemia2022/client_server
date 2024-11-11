const REQUEST_CREATED_EMAIL_TEMPLATE = (data) => {
    return `
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
                        <p>Dear ${data?.name},</p>
                        <p>We are pleased to confirm that your sample request for ${data?.product_name} has been sent to the supplier.Your request is being processed and you will be updated on the status shortly.</p>
                        <p>Details of your request:</p>
                        <ul>
                            <li><strong>Request ID:</strong> ${data?._id}</li>
                            <li><strong>Requested Items:</strong> ${data?.amount} ${data?.units}</li>
                            <li><a href='${data?.action_url}'><strong>View Request details</strong><a/></li>
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
                        <p style="color: #999; font-size: 12px;">&copy; 2022-2024 Prokemia. All rights reserved.</p>
                    </td>
                </tr>
                </table>
            </body>
        </html>
    `
};
const NOTIFY_SUPPLIER_REQUEST_CREATED_EMAIL_TEMPLATE = (data) => {
    return `
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
                        <h2>${data?.type} Request - ${data?.product_name}</h2>
                        <p>Dear ${data?.name},</p>
                        <p>We are pleased to inform you that you have received a ${data?.type} request for ${data?.product_name} from a client from <a href='https://prokemia.com'>Prokemia</a>. Visit your dashboard to approve the request made by the client.</p>
                        <p>Details of your request:</p>
                        <ul>
                            <li><strong>Request ID:</strong> ${data?._id}</li>
                            <li><strong>Requested Items:</strong> ${data?.amount} ${data?.units}</li>
                            <li><a href='${data?.action_url}'><strong>View Request details</strong><a/></li>
                        </ul>
                        <div style='display:flex, justifyContent:center, width:100%,alignItems:center'>
                            <a href="https://prokemia.com/dashboard/supplier?requests/view?request_id=${data?._id}" class="button1">Access Supplier Portal</a>
                        </div>
                        <small class="highlight">Please note that this is a confirmation email and does not signify shipment or delivery.</small>
                        <p>Thank you for choosing our services. If you have any questions or need further assistance, please feel free to contact us. <a href='mailto:customer@prokemia.com'>customer@prokemia.com</a></p>
                        <p style="color: #666;">Best regards,</p>
                        <p style="color: #666;">Sales Team, Prokemia</p>
                    </td>
                </tr>
                <tr>
                    <td style="padding: 20px; background-color: #f0f0f0; text-align: center;">
                        <p>You are receiving this email because you placed an order with our platform.</p>
                        <p style="color: #999; font-size: 12px;">&copy; 2022-2024 Prokemia. All rights reserved.</p>
                    </td>
                </tr>
                </table>
            </body>
        </html>
    `
};

module.exports = {
    REQUEST_CREATED_EMAIL_TEMPLATE,
    NOTIFY_SUPPLIER_REQUEST_CREATED_EMAIL_TEMPLATE
}