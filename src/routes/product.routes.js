const express = require('express');
const router = express.Router();
const productCtrl = require('../controllers/product.controller');
const auth = require('../middleware/authMiddleware');
const role = require('../middleware/roleMiddleware');
const upload = require('../middleware/upload');

router.post('/', auth, role(['admin','subadmin']), upload.single('image'), productCtrl.createProduct);
router.get('/', auth, role(['admin','subadmin','teamhead','agent']), productCtrl.getProducts);
router.put('/:id', auth, role(['admin','subadmin']), upload.single('image'), productCtrl.updateProduct);

module.exports = router;