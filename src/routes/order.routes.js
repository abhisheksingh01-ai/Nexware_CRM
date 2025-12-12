const express = require("express");
const router = express.Router();

const orderCtrl = require("../controllers/order.controller");
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");

// ----------------------------------------------
// CREATE ORDER (agent + teamhead + admin)
// ----------------------------------------------
router.post(
  "/create",
  auth,
  role(["admin", "subadmin", "teamhead", "agent"]),
  orderCtrl.createOrder
);

// ----------------------------------------------
// GET ALL ORDERS
// ----------------------------------------------
router.post(
  "/getAll",
  auth,
  role(["admin", "subadmin", "teamhead", "agent"]),
  orderCtrl.getAllOrders
);

// ----------------------------------------------
// GET SINGLE ORDER
// ----------------------------------------------
router.post(
  "/getOne",
  auth,
  role(["admin", "subadmin", "teamhead", "agent"]),
  orderCtrl.getOrderById
);

// ----------------------------------------------
// UPDATE ORDER (admin + subadmin only)
// ----------------------------------------------
router.put(
  "/update",
  auth,
  role(["admin", "subadmin"]),
  orderCtrl.updateOrder
);

// ----------------------------------------------
// UPDATE ORDER STATUS
// ----------------------------------------------
router.put(
  "/updateStatus",
  auth,
  role(["admin", "subadmin", "teamhead", "agent"]),
  orderCtrl.updateOrderStatus
);

// ----------------------------------------------
// UPDATE PAYMENT STATUS
// ----------------------------------------------
router.put(
  "/updatePayment",
  auth,
  role(["admin", "subadmin"]),
  orderCtrl.updatePaymentStatus
);

// ----------------------------------------------
// UPDATE COURIER DETAILS
// ----------------------------------------------
router.put(
  "/updateCourier",
  auth,
  role(["admin", "subadmin"]),
  orderCtrl.updateCourierDetails
);

// ----------------------------------------------
// DELETE ORDER (admin only)
// ----------------------------------------------
router.delete(
  "/delete",
  auth,
  role(["admin"]),
  orderCtrl.deleteOrder
);

module.exports = router;
