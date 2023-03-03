const mongoose = require("mongoose");
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
        minLength: 6
    },
    customerId: {
        type: String,
        required: true,
    }
});

module.exports = mongoose.model("User",userSchema);
