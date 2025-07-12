const {onRequest} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const express = require("express");
const cors = require("cors");
const stripe = require("stripe")(
    // eslint-disable-next-line max-len
    "sk_test_51PqxNZP8xMyOS5jZjkNTPSEg2zye1ka4uuSInoftqdahK8MQiyqJXvESebaR676MR8W9jMfrsNszut0N94Y9FJMb0083olq2F6",
);

// API

// - App config
const app = express();

// - Middlewares
app.use(cors({origin: true}));
app.use(express.json());

// - API routes
app.get("/", (request, response) => response.status(200).send("hello world"));

app.post("/payments/create", async (request, response) => {
  const total = parseInt(request.query.total, 10);


  logger.info("Payment Request Received for this amount >>> ", {total});

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: total, // subunits of the currency
      currency: "usd",
    });

    // OK - Created
    response.status(201).send({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    logger.error("Error creating payment intent", {error});
    response.status(500).send({
      error: "Internal Server Error",
    });
  }
});

// - Listen command
exports.api = onRequest(app);

// Example endpoint
// http function initialized (http://127.0.0.1:5001/fir-c4282/us-central1/api)
