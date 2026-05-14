import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import paypal from "@paypal/checkout-server-sdk";

dotenv.config();

const app = express();

/*
  ✅ CORS CORRECTO (clave para Netlify → Render)
*/
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"]
}));

app.use(express.json());

/*
  PAYPAL ENV (SANDBOX)
*/
const environment = new paypal.core.SandboxEnvironment(
  process.env.PAYPAL_CLIENT_ID,
  process.env.PAYPAL_CLIENT_SECRET
);

const client = new paypal.core.PayPalHttpClient(environment);

/*
  CREATE ORDER
*/
app.post("/create-order", async (req, res) => {

  console.log("🔥 Request recibida desde frontend");

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

    console.log("✅ ORDER ID:", order.result.id);

    res.json({ id: order.result.id });

  } catch (error) {

    console.error("❌ PAYPAL ERROR:", error);

    res.status(500).json({
      error: error.message
    });

  }
});

/*
  SERVER
*/
const PORT = process.env.PORT || 10000;

app.listen(PORT, "0.0.0.0", () => {
  console.log("🚀 Servidor funcionando en puerto", PORT);
});
