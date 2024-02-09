const express = require('express');
const router = express.Router();

const  { 
    getproducts_srt,
    products_search,
    product_data,
    product_by_lister,
    delete_product,
    feature_product,
    unfeature_product,
    add_product,
    top_products,
    edit_product
} = require('../controllers/products.controller');

router.get('/srt', getproducts_srt);
router.get('/search', products_search);
router.get('/product', product_data);
router.get('/lister', product_by_lister)
router.delete('/product/delete', delete_product);
router.post('/product/feature', feature_product)
router.post('/product/unfeature', unfeature_product);
router.post('/product/new', add_product)
router.get('/top',top_products);
router.put('/product/edit',edit_product)

module.exports = router;