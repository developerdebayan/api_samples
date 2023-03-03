const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require('body-parser');
const StripeRouter = require("./api/stripe/routes/stripe_route");

const app = express();

const PORT = process.env.PORT || 5000

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin','*');
  res.header('Access-Control-Allow-Headers','Origin,X-Requested-With, Content-Type,Accept, Authorization');
  if(req.method === 'OPTIONS'){
    res.header('Access-Control-Allow-Methods','PUT, POST, PATCH, DELETE');
    return res.status(200).json({});
  }
  next();
});

app.use('/check',  (req, res) => {
  res.status(200).json({
    status: 1,
  });
});


app.use('/stripe',StripeRouter);



app.use((req, res, next) => {
    const error = Error('Not Found');
    error.status = 404;
    next(error);
  });
  
  app.use((error, req, res) => {
    res.status(error.status || 500);
    res.json({
      error: {
        message: error.message
      }
    });
  });

mongoose.connect("mongodb+srv://admin:4GX9s1mCP04FoG39@apisamplecluster.04sxvrc.mongodb.net/?retryWrites=true&w=majority").then(()=>{
    app.listen(PORT,()=> {
        console.log("Listening to port " + PORT);
    });
}).catch((err) => {
    console.log(err);
});

//admin
//4GX9s1mCP04FoG39

