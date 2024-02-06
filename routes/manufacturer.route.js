const express = require('express');
const { getmanufacturers_srt, get_data, get_manufacturer, create_new_expert, edit_expert, delete_expert, create_distributor, edit_distributor, delete_distributor, edit_manufacturer } = require('../controllers/manufacturer.controller');
const router = express.Router();



router.get('/srt', getmanufacturers_srt);
router.get('/user', get_data);
router.put('/user/edit', edit_manufacturer);
router.get('/supplier', get_manufacturer);

// experts
router.post('/supplier/create_expert',create_new_expert);
router.post('/supplier/edit_expert',edit_expert);
router.post('/supplier/delete_expert',delete_expert)
// distributor
router.post('/supplier/create_distributor',create_distributor)
router.post('/supplier/edit_distributor',edit_distributor)
router.post('/supplier/delete_distributor',delete_distributor)

module.exports = router;