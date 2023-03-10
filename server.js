const mongoose = require("mongoose");

exports.stripeApi = mongoose.createConnection(
    "mongodb+srv://ADMIN:o5sySasuH67PEWxc@cluster0.9cbe0k0.mongodb.net/StripeDB?retryWrites=true&w=majority"
)

exports.plaidApi = mongoose.createConnection(
    "mongodb+srv://ADMIN:o5sySasuH67PEWxc@cluster0.9cbe0k0.mongodb.net/PlaidDB?retryWrites=true&w=majority"
)



