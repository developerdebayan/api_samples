
# API SAMPLES



## STRIPE API

### Register API

Method : POST

https://lazy-lime-coypu-boot.cyclic.app/stripe/register


Request (FORM DATA) : 


    "name" : "Debayan Chowdhury",
    "email" : "debayan@gmail.com",
    "password" : "123456",
    "address" : "Chinsurah",
    "city" : "Kolakata",
    "state" : "West Bengal",
    "country" : "India",
    "postalCode" : "712101",

Response 

    {
        "statusCode": 200,
        "message": "Login Successful",
        "status": 1,
        "user": {
            "_id": "64060c67d57cf91ce56f8cec",
            "name": "Debayan Chowdhury",
            "email": "debayan@gmail.com",
            "customerId": "cus_NTdcHzqWM6czRk"
        }
    }


### Login API

Method : POST

https://lazy-lime-coypu-boot.cyclic.app/stripe/login


Request (FORM DATA) : 

    "email" : "debayan@gmail.com",
    "password" : "123456"

Response 


    {
        "statusCode": 200,
        "message": "Login Successful",
        "status": 1,
        "user": {
            "_id": "64060c67d57cf91ce56f8cec",
            "name": "Debayan Chowdhury",
            "email": "debayan@gmail.com",
            "customerId": "cus_NTdcHzqWM6czRk"
        }
    }

### Login API

Method : POST

https://lazy-lime-coypu-boot.cyclic.app/stripe/payment-sheet


Request (FORM DATA) : 

    "userId" : "64060c67d57cf91ce56f8cec",
    "amount" : "45000",
    "currency" : "INR",

Response 


    {
        "statusCode": 200,
        "status": 1,
        "message": "",
        "data": {
            "paymentIntent": "pi_3Mj3nASI2gwOiSTR0fiRlW1e_secret_5G3BBUOOxAtjLzClNypl6Tyyq",
            "ephemeralKey": "ek_test_YWNjdF8xTWlaQzdTSTJnd09pU1RSLEFPdklOSTVocVNaNXRlZDJ6ZzVGSHY4U1lTeGhsM2w_001jtWsYy1",
            "customerId": "cus_NTdcHzqWM6czRk"
        }
    }



