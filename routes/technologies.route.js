const express = require('express');
const router = express.Router();

const  { 
    gettechnologies_srt, get_data
} = require('../controllers/technology.controller');

router.get('/srt', gettechnologies_srt);
router.get('/technology', get_data);

module.exports = router;