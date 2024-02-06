const express = require('express');
const { new_sale, sales_by_creator, delete_sale, edit_sale } = require('../controllers/sales.controller');
const router = express.Router();

router.post('/new', new_sale);
router.get('/creator', sales_by_creator);
router.delete('/sale/delete', delete_sale);
router.put('/sale/edit', edit_sale);

module.exports = router;