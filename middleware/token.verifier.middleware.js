const jwt = require('jsonwebtoken');


const AUTHENTICATE_TOKEN = (req, res, next) =>{
    // Extract the token from the Authorization header
    const AUTH_HEADER = req.headers['authorization'];
    const AUTH_TOKEN = AUTH_HEADER && AUTH_HEADER.split(' ')[1];
    const SECRET_KEY = process.env.ACCESS_TOKEN_KEY;

    if (!AUTH_TOKEN) {
        return res.status(401).json({
            error:true,
            message: 'No token provided, Try signing in'}
        );
    }
    // Verify and decode the token
    jwt.verify(AUTH_TOKEN, SECRET_KEY, (err, decoded) => {
        if (err) {
            return res.status(403).json({
                error:true,
                message: 'Expired or Invalid token. Try signing in!'
            });
        }
        // Add the decoded user information to the request object
        req.user = decoded;
        next();
    });
}

const VERIFY_TOKEN = (req, res, next) =>{
    // Extract the token from the Authorization header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    const secretKey = process.env.CODE_TOKEN_KEY;

    if (!token) {
        return res.status(401).json({error:true,message: 'No token provided, Try signing in' });
    }

    // Verify and decode the token
    jwt.verify(token, secretKey, (err, decoded) => {
        if (err) {
            return res.status(403).json({error:true,message: 'Expired or Invalid token. Try signing in!' });
        }
        // Add the decoded user information to the request object
        req.user = decoded;
        next();
    });
}

module.exports = {
    AUTHENTICATE_TOKEN,
    VERIFY_TOKEN
};
