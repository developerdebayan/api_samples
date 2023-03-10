const mongoose = require("mongoose");
const connection = require('../../../server');
const Schema = mongoose.Schema;

const tokenSchema = new mongoose.Schema({
    accessToken: {
        type: String,
        required: false
    },
    itemId: {
        type: String,
        required: false
    }
});

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
    token: {
        type: tokenSchema,
        required: false,
    },
});

module.exports = connection.plaidApi.model("PlaidUser", userSchema);