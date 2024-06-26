const express = require("express");
const router = express.Router();

const { allProducts, findProduct, orders, getTaxes } = require("../controllers/woocommerce");
const authMiddleware = require('../middleware/auth');
const { processOrder, updateOrder } = require("../controllers/processWoocomerceCreatedOrder");
const processProduct = require("../controllers/processWoocomerceCreatedProduct");
const { verifyProduct } = require("../services/woocommerceService");

router.route("/get-products").get(authMiddleware, allProducts);
router.route("/find-product").get(findProduct);
router.route("/get-orders").get(authMiddleware, orders);
router.route("/get-taxes").get(getTaxes);

//webhooks
router.route("/create-order-wh").post((req, res) => {
  processOrder(req.body);
  res.send("Webhook received");
});

router.route("/item-add-cart-wh").post((req, res) => {
  verifyProduct(req.body);
  res.send("Webhook item add to cart received");
});

// router.route("/finish-by-wh").post((req, res) => {
//   console.log('Webhook finish buy received');
//   verifyProduct(req.body);
//   res.send("Webhook finish buy received");
// });

router.route("/update-order-wh").post((req, res) => {
  updateOrder(req.body);
  res.send("Webhook order updated");
});


module.exports = router;
