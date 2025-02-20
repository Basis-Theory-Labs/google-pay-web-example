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
            "BT-PROXY-URL": "https://api.sandbox.checkout.com/payments",
            "Authorization": "Bearer <CHECKOUT_AUTH_TOKEN>"
        },
        body: JSON.stringify(
            {
                "source": {
                    "type": "network_token",
                    "token_type": "googlepay",
                    "token": `{{ token_intent: ${tokenIntentId} | json: \"$.data.number\" }}`,
                    "expiry_month": `{{ token_intent: ${tokenIntentId} | json: \"$.data\" | card_exp: \"MM\" }}`,
                    "expiry_year": `{{ token_intent: ${tokenIntentId} | json: \"$.data\" | card_exp: \"YYYY\" }}`,
                },
                "amount": 1000,
                "currency": "USD",
                "processing_channel_id": "<CHECKOUT_PROCESSING_CHANNEL_ID>"
            }
        ),
    });

    const chargeResponseJson = await chargeResponse.json();

    console.log(JSON.stringify(chargeResponseJson, null, 2));

    response.json({
        status: chargeResponse.status,
    });
});

app.listen(3000, () => {
    console.log("Server is running on port 3000");
});
