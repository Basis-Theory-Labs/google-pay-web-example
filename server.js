const express = require("express");
const bodyParser = require("body-parser");
const path = require('path');
const app = express();

app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.post("/charge-payment", async (request, response) => {
    const { tokenIntentId } = request.body;

    // charge the payment with a proxy
    const chargeResponse = await fetch("https://api.basistheory.com/proxy", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "BT-API-KEY": "<PRIVATE_API_KEY>",
            "BT-PROXY-URL": "https://checkout-test.adyen.com/v71/payments",
            "x-API-key": "<ADYEN_X_API_KEY>"
        },
        body: JSON.stringify({
            "amount": {
                "currency": "USD",
                "value": 1000
            },
            "reference": "Test-Payment",
            "paymentMethod": {
                "type": "scheme",
                "number": `{{ token_intent: ${tokenIntentId} | json: \"$.data.number\" }}`,
                "expiryMonth": `{{ token_intent: ${tokenIntentId} | json: \"$.data\" | card_exp: \"MM\" }}`,
                "expiryYear": `{{ token_intent: ${tokenIntentId} | json: \"$.data\" | card_exp: \"YYYY\" }}`,
                "brand": "googlepay"
            },
            "additionalData": {
                "paymentdatasource.type": "googlepay",
                "paymentdatasource.tokenized": "false"
            },
            "shopperInteraction": "Ecommerce",
            "merchantAccount": "<ADYEN_MERCHANT_ACCOUNT>"
        }),
    });

    const chargeResponseJson = await chargeResponse.json();

    console.log(JSON.stringify(chargeResponseJson, null, 2));

    response.json({
        result: chargeResponse.status,
    });
});

app.listen(3000, () => {
    console.log("Server is running on port 3000");
});
