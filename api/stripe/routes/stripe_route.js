const express = require("express");
const StripeController = require("../controllers/stripe_controller");

const router = express.Router();

router.post("/register",StripeController.register);
router.post("/login",StripeController.login);
router.post("/payment-sheet",StripeController.paymentRequest);

module.exports = router;