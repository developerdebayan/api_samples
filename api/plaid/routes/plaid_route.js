const express = require("express");
const PlaidController = require("../controllers/plaid_controller");

const router = express.Router();

router.post("/register",PlaidController.register);
router.post("/login",PlaidController.login);
router.post("/create-link-token",PlaidController.createLinkToken);
router.post("/set-access-token",PlaidController.setAccessToken);
router.post("/get-account-details",PlaidController.getAccountList);

module.exports = router;