const express = require('express');
const router = express.Router();

const  { 
    getindustries_srt, get_data
} = require('../controllers/industry.controller');

router.get('/srt', getindustries_srt);
router.get('/industry', get_data);

module.exports = router;