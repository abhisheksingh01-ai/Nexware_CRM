const express = require("express");
const router = express.Router();

const productCtrl = require("../controllers/product.controller");
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");

// ----------------------------------------------
// CREATE PRODUCT (admin only)
// ----------------------------------------------
router.post(
  "/adminCreate",
  auth,
  role(["admin"]),
  productCtrl.createProduct
);

// ----------------------------------------------
// GET ALL PRODUCTS (admin, subadmin, teamhead, agent)
// ----------------------------------------------
router.get(
  "/getAll",
  auth,
  role(["admin", "subadmin", "teamhead", "agent"]),
  productCtrl.getAllProducts
);

// ----------------------------------------------
// GET SINGLE PRODUCT (all roles)
// Send ID in body: { id: "productId" }
// ----------------------------------------------
router.post(
  "/getOne",
  auth,
  role(["admin", "subadmin", "teamhead", "agent"]),
  productCtrl.getProductById
);

// ----------------------------------------------
// UPDATE PRODUCT (admin, subadmin)
// Send ID in body
// ----------------------------------------------
router.put(
  "/adminUpdate",
  auth,
  role(["admin", "subadmin"]),
  productCtrl.updateProduct
);

// ----------------------------------------------
// DELETE PRODUCT (admin only)
// Send ID in body
// ----------------------------------------------
router.delete(
  "/adminDelete",
  auth,
  role(["admin"]),
  productCtrl.deleteProduct
);

module.exports = router;
