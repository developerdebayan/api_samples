const mongoose = require("mongoose");
const connection = require('../../../server');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        uique: true
    },
    password: {
        type: String,
        required: true,
    },
});

module.exports = connection.plaidApi.model("PlaidUser", userSchema);