const admin = require('firebase-admin');
//const serviceAccount = require('./prokemia-file-upload-b636f-firebase-adminsdk-rmwu1-56fe0c356a.json');
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);

admin.initializeApp({
 credential: admin.credential.cert(serviceAccount),
});

const messaging = admin.messaging();

module.exports = messaging;