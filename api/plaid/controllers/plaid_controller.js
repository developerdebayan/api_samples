const { Configuration, PlaidApi, Products, PlaidEnvironments } = require('plaid');
const PlaidUser = require("../models/PlaidUser");
const { ObjectId } = require('mongodb');

const PLAID_CLIENT_ID = "6409f9d69b1bf400137e862f";
const PLAID_SECRET = "7be6a0fc52d75dc10fb174f917d4a1";
const PLAID_PRODUCTS = ["auth"]
const PLAID_COUNTRY_CODES = ["US"]
const PLAID_REDIRECT_URI = '';
const PLAID_ANDROID_PACKAGE_NAME = 'com.dc.plaidandroidsample';

const configuration = new Configuration({
    basePath: PlaidEnvironments.sandbox,
    baseOptions: {
        headers: {
            'PLAID-CLIENT-ID': PLAID_CLIENT_ID,
            'PLAID-SECRET': PLAID_SECRET,
            'Plaid-Version': '2020-09-14',
        },
    },
});

const client = new PlaidApi(configuration);

exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        let existingUser = await PlaidUser.findOne({ email: email, password: password });
        if (existingUser != null) {
            return res.status(200).json({
                statusCode: 200,
                message: "Login Successful",
                status: 1,
                user: {
                    _id: existingUser.id,
                    name: existingUser.name,
                    email: existingUser.email
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
        let existingUser = await PlaidUser.findOne({ email: email });
        if (existingUser != null) {
            return res.status(200).json({
                statusCode: 200,
                status: 0,
                message: "User already exists"
            });
        } else {
            let user = new PlaidUser({
                name: name,
                email: email,
                password: password,
            });
            user = await user.save();
            return res.status(201).json({
                statusCode: 201,
                status: 1,
                message: "Registration Successful",
                user: {
                    _id: user.id,
                    name: user.name,
                    email: user.email
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

exports.createLinkToken = async (req, res) => {
    const { userId } = req.body;

    try {
        const configs = {
            user: {
                client_user_id: userId,
            },
            client_name: 'DC Plaid',
            products: PLAID_PRODUCTS,
            country_codes: PLAID_COUNTRY_CODES,
            language: 'en',
            android_package_name: PLAID_ANDROID_PACKAGE_NAME
        };
        if (PLAID_REDIRECT_URI !== '') {
            configs.redirect_uri = PLAID_REDIRECT_URI;
        }

        const createTokenResponse = await client.linkTokenCreate(configs);
        return res.status(200).json({
            statusCode: 200,
            status: 1,
            message: "",
            data: createTokenResponse.data
        });
    } catch (err) {
        return res.status(500).json({
            statusCode: 500,
            status: 0,
            message: "Internal Server Error"
        });
    }
}