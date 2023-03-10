const stripeIndia = require('stripe')('sk_test_51MjqOGSAHbfwIlyaa9S0zFLMl5pcQanZ6rED8eaNDWZMnlmXMOehRQffNRiIGCMrnT3KDrmYnIyIkihNj9t6udaJ00CRS14csR');
const stripeUsa = require('stripe')('sk_test_51MjqfBFAKLdqbiAVv1pILKMob6MWNfCROKMDbBE900bEuItMco4YzPgSvHS8FY5x8Elc5ZBzuGhv5xYoyfabMog400aywDtkB1');
const StripeUser = require("../models/StripeUser");
const { ObjectId } = require('mongodb');

const PUBLISHABLE_KEY_INDIA = "pk_test_51MjqOGSAHbfwIlyabaYlV0QyK2cSmLWsaprgbkol0V1turzZIlTcWbdGa2VQcbkIOtha1Jka7nyXyrniRdab5nwI00DW5ne8oi";
const PUBLISHABLE_KEY_USA = "pk_test_51MjqfBFAKLdqbiAVOswphscw7OGuce0O2a4cJjdZlJF5ZqTS7A6BoH93dbGb9cDbz2o9Q1U5z2gEZRffmJ13gOBt00mOoTpAzS";

exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        let existingUser = await StripeUser.findOne({ email: email, password: password });
        if (existingUser != null) {
            return res.status(200).json({
                statusCode: 200,
                message: "Login Successful",
                status: 1,
                user: {
                    _id: existingUser.id,
                    name: existingUser.name,
                    email: existingUser.email,
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
    const { name, email, password, address, city, state, country, postalCode } = req.body;
    try {
        let existingUser = await StripeUser.findOne({ email: email });
        if (existingUser != null) {
            return res.status(200).json({
                statusCode: 200,
                status: 0,
                message: "User already exists"
            });
        } else {
            let user = new StripeUser({
                name: name,
                email: email,
                password: password,
                address: {
                    line1: address,
                    postalCode: postalCode,
                    city: city,
                    state: state,
                    country: country,
                },
                customerId: {
                    customerId_INDIA: '',
                    customerId_USA: ''
                }
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
                    address: user.address
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
    const { userId, amount, currency, merchant_country, payment_method_types } = req.body;
    try {
        let existingUser = await StripeUser.findOne({ _id: ObjectId(userId) });
        if (existingUser != null) {
            let ephemeralKey = null;
            let paymentIntent = null;
            if (merchant_country === 'INDIA') {

                if (existingUser.customerId.customerId_INDIA == '') {
                    let customer = await stripeIndia.customers.create({
                        name: existingUser.name,
                        email: existingUser.email,
                        address: {
                            line1: existingUser.address.line1,
                            postal_code: existingUser.address.postalCode,
                            city: existingUser.address.city,
                            state: existingUser.address.state,
                            country: existingUser.address.country,
                        },
                    });
                    existingUser.customerId.customerId_INDIA = customer.id;
                    existingUser = await existingUser.save();
                }

                ephemeralKey = await stripeIndia.ephemeralKeys.create({ customer: existingUser.customerId.customerId_INDIA }, { apiVersion: '2022-11-15' });
                paymentIntent = await stripeIndia.paymentIntents.create({
                    amount: amount,
                    currency: currency,
                    description: 'Order payment test',
                    customer: existingUser.customerId.customerId_INDIA,
                    automatic_payment_methods: {
                        enabled: true,
                    },
                    //address: existingUser.address
                });
            } else if (merchant_country === 'USA') {

                if (existingUser.customerId.customerId_USA == '') {
                    let customer = await stripeUsa.customers.create({
                        name: existingUser.name,
                        email: existingUser.email,
                        address: {
                            line1: existingUser.address.line1,
                            postal_code: existingUser.address.postalCode,
                            city: existingUser.address.city,
                            state: existingUser.address.state,
                            country: existingUser.address.country,
                        },
                    });
                    existingUser.customerId.customerId_USA = customer.id;
                    existingUser = await existingUser.save();
                }

                if (payment_method_types.length <= 0) {
                    ephemeralKey = await stripeUsa.ephemeralKeys.create({ customer: existingUser.customerId.customerId_USA }, { apiVersion: '2022-11-15' });
                    paymentIntent = await stripeUsa.paymentIntents.create({
                        amount: amount,
                        currency: currency,
                        description: 'Order payment test',
                        customer: existingUser.customerId.customerId_USA,
                        automatic_payment_methods: {
                            enabled: true,
                        },
                        //address: existingUser.address
                    });
                } else {
                    ephemeralKey = await stripeUsa.ephemeralKeys.create({ customer: existingUser.customerId.customerId_USA }, { apiVersion: '2022-11-15' });
                    paymentIntent = await stripeUsa.paymentIntents.create({
                        amount: amount,
                        currency: currency,
                        description: 'Order payment test',
                        customer: existingUser.customerId.customerId_USA,
                        payment_method_types: payment_method_types
                        //address: existingUser.address
                    });
                }
            }

            if (paymentIntent == null) {
                return res.status(200).json({
                    statusCode: 200,
                    status: 0,
                    message: "Opertation failed"
                }); l̥
            } else {
                return res.status(200).json({
                    statusCode: 200,
                    status: 1,
                    message: "",
                    data: {
                        paymentIntent: paymentIntent.client_secret,
                        ephemeralKey: ephemeralKey.secret,
                        customerId: existingUser.customerId.customerId_USA,
                        publishableKey: PUBLISHABLE_KEY_USA,
                    }
                });
            }
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