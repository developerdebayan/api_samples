const stripe = require('stripe')('sk_test_51JdVaeSDOQyPPB1oMacRQUhlYDVpWyklBJJjFibrncku0TX01qalL2mMYyqs8qpgjcPw2Ngrz7SCwls1wlg7LBjt00e2t72XEm');
const User = require("../models/User");
const { ObjectId } = require('mongodb');

exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        let existingUser = await User.findOne({ email: email, password: password });
        if (existingUser != null) {
            return res.status(200).json({
                statusCode: 200,
                message: "Login Successful",
                status: 1,
                user: {
                    _id: existingUser.id,
                    name: existingUser.name,
                    email: existingUser.email,
                    customerId: existingUser.customerId
                }
            });
        } else {
            return res.status(200).json({
                statusCode: 200,
                status: 0,
                message: "Invalid email or password"
            });
        }

    } catch (err) {
        return res.status(500).json({
            statusCode: 500,
            status: 0,
            message: "Internal Server Error"
        });
    }
}

exports.register = async (req, res) => {
    const { name, email, password } = req.body;
    try {
        let existingUser = await User.findOne({ email: email });
        if (existingUser != null) {
            return res.status(200).json({
                statusCode: 200,
                status: 0,
                message: "User already exists"
            });
        } else {
            const customer = await stripe.customers.create({
                name: name,
                email: email,
            });
            let user = new User({
                name: name,
                email: email,
                password: password,
                customerId: customer.id
            });
            user = await user.save();
            return res.status(201).json({
                statusCode: 201,
                status: 1,
                message: "Registration Successful",
                user: {
                    _id: user.id,
                    name: user.name,
                    email: user.email,
                    customerId: user.customerId
                }
            });
        }

    } catch (err) {
        return res.status(500).json({
            statusCode: 500,
            status: 0,
            message: err
        });
    }
}

exports.paymentRequest = async (req, res) => {
    const { userId, amount, currency } = req.body;
    try {
        let existingUser = await User.findOne({ _id: ObjectId(userId) });
        if (existingUser != null) {
            const ephemeralKey = await stripe.ephemeralKeys.create({ customer: existingUser.customerId }, { apiVersion: '2022-11-15' });
            const paymentIntent = await stripe.paymentIntents.create({
                amount: amount,
                currency: currency,
                customer: existingUser.customerId,
                automatic_payment_methods: {
                    enabled: true,
                },
            });
            return res.status(200).json({
                statusCode: 200,
                status: 1,
                message: "",
                data: {
                    paymentIntent: paymentIntent.client_secret,
                    ephemeralKey: ephemeralKey.secret,
                    customerId: existingUser.customerId
                }
            });

        } else {
            return res.status(200).json({
                statusCode: 200,
                status: 0,
                message: "Opertation failed"
            });
        }

    } catch (err) {
        return res.status(500).json({
            statusCode: 500,
            status: 0,
            message: "Internal Server Error",
            err: err.message
        });
    }
}