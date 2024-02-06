const express = require('express');
const { 
    getdistributors_srt, 
    get_data, 
    get_distributor,
    edit_distributor,
    create_new_expert,
    edit_expert,
    delete_expert,
    create_manufacturer,
    edit_manufacturer,
    delete_distributor
} = require('../controllers/distributor.controller');
const router = express.Router();

router.get('/srt', getdistributors_srt);
router.get('/user', get_data);
router.put('/user/edit', edit_distributor);
router.get('/supplier', get_distributor)
// experts
router.post('/supplier/create_expert',create_new_expert);
router.post('/supplier/edit_expert',edit_expert);
router.post('/supplier/delete_expert',delete_expert);
//manufacturer
router.post('/supplier/create_manufacturer',create_manufacturer)
router.post('/supplier/edit_manufacturer',edit_manufacturer)
router.post('/supplier/delete_manufacturer',delete_distributor)

module.exports = router;