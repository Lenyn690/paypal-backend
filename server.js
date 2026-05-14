import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import paypal from "@paypal/checkout-server-sdk";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

/*
|--------------------------------------------------------------------------
| PAYPAL ENVIRONMENT (SANDBOX)
|--------------------------------------------------------------------------
*/
const environment = new paypal.core.SandboxEnvironment(
  process.env.PAYPAL_CLIENT_ID,
  process.env.PAYPAL_CLIENT_SECRET
);

const client = new paypal.core.PayPalHttpClient(environment);

/*
|--------------------------------------------------------------------------
| CREATE ORDER (crea el pago)
|--------------------------------------------------------------------------
*/
app.post("/create-order", async (req, res) => {
  try {
    const request = new paypal.orders.OrdersCreateRequest();

    request.prefer("return=representation");

    request.requestBody({
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: "USD",
            value: "10.00"
          }
        }
      ]
    });

    const order = await client.execute(request);

    res.json({
      id: order.result.id
    });

  } catch (error) {
    console.error("❌ ERROR PAYPAL:", error);

    res.status(500).json({
      error: error.message
    });
  }
});

/*
|--------------------------------------------------------------------------
| SERVER START (Render usa PORT automático)
|--------------------------------------------------------------------------
*/
const PORT = process.env.PORT || 10000;

app.listen(PORT, "0.0.0.0", () => {
  console.log("Servidor funcionando en puerto " + PORT);
});