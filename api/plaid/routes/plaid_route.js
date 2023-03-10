const express = require("express");
const PlaidController = require("../controllers/plaid_controller");

const router = express.Router();

router.post("/register",PlaidController.register);
router.post("/login",PlaidController.login);
router.post("/create-link-token",PlaidController.createLinkToken);

module.exports = router;