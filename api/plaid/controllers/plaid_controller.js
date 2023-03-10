const { Configuration, PlaidApi, Products, PlaidEnvironments } = require('plaid');
const PlaidUser = require("../models/PlaidUser");
const { ObjectId } = require('mongodb');
const lib = require('mongoose/lib');

const PLAID_CLIENT_ID = "6409f9d69b1bf400137e862f";
const PLAID_SECRET = "7be6a0fc52d75dc10fb174f917d4a1";
const PLAID_PRODUCTS = ["auth", "transactions", "identity"]
const PLAID_COUNTRY_CODES = ["US", "CA"]
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
                token: {
                    accessToken: "",
                    itemId: ""
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
    const { user_id } = req.body;

    try {
        const configs = {
            user: {
                client_user_id: user_id,
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
            message: "Internal Server Error",
            err: err
        });
    }
}

exports.setAccessToken = async (req, res) => {
    const { user_id, public_token } = req.body;

    try {
        let existingUser = await PlaidUser.findOne({ _id: ObjectId(user_id) });
        const tokenResponse = await client.itemPublicTokenExchange({
            public_token: public_token,
        });
        existingUser.token.accessToken = tokenResponse.data.access_token;
        existingUser.token.itemId = tokenResponse.data.item_id;
        existingUser = await existingUser.save();
        return res.status(200).json({
            statusCode: 200,
            status: 1,
            message: "Access token updated",
        });
    } catch (err) {
        return res.status(500).json({
            statusCode: 500,
            status: 0,
            message: "Internal Server Error",
            err: err
        });
    }
}

exports.getAccountList = async (req, res) => {
    const { user_id } = req.body;
    try {
        let existingUser = await PlaidUser.findOne({ _id: ObjectId(user_id) });
        const authResponse = await client.authGet({
            access_token: existingUser.token.accessToken,
        });

        var accountList = [];
        authResponse.data.accounts.forEach(item => {

            let account = "";
            let routing = "";
            let wire_routing = "";

            let ach = authResponse.data.numbers.ach.find(object => object.account_id === item.account_id);
            let bacs = authResponse.data.numbers.bacs.find(object => object.account_id === item.account_id);
            let eft = authResponse.data.numbers.eft.find(object => object.account_id === item.account_id);
            let international = authResponse.data.numbers.international.find(object => object.account_id === item.account_id);

            if (ach !== undefined) {
                account = ach.account;
                routing = ach.routing;
                wire_routing = ach.wire_routing;
            }
            if (bacs !== undefined) {
                account = bacs.account;
                routing = bacs.routing;
                wire_routing = bacs.wire_routing;
            }
            if (eft !== undefined) {
                account = eft.account;
                routing = eft.routing;
                wire_routing = eft.wire_routing;
            }
            if (international !== undefined) {
                account = international.account;
                routing = international.routing;
                wire_routing = international.wire_routing;
            }

            let object = {
                account_id: item.account_id,
                account: account,
                routing: routing,
                wire_routing: wire_routing,
                balances: {
                    available: item.balances.available,
                    current: item.balances.current,
                    iso_currency_code: item.balances.iso_currency_code,
                    limit: item.balances.limit,
                    unofficial_currency_code: item.balances.unofficial_currency_code
                },
                mask: item.mask,
                name: item.name,
                official_name: item.official_name,
                subtype: item.subtype,
                type: item.type
            }
            accountList.push(object);
        });


        return res.status(200).json({
            statusCode: 200,
            status: 1,
            message: "",
            data: accountList
        });
    } catch (err) {
        return res.status(500).json({
            statusCode: 500,
            status: 0,
            message: "Internal Server Error",
            err: err
        });
    }
}