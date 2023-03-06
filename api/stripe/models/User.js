const mongoose = require("mongoose");
const connection = require('../../../server');
const Schema = mongoose.Schema;

const addressSchema = new mongoose.Schema({
    line1: {
        type: String,
        required: true
    },
    postalCode: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    state: {
        type: String,
        required: true
    },
    country: {
        type: String,
        required: true
    },
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
    customerId: {
        type: String,
        required: true,
    },
    address: {
        type : addressSchema,
        required : true
    },
});

module.exports = connection.stripeApi.model("User", userSchema);
