import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();

app.use(cors());
app.use(express.json());

// 🔐 Variables de entorno (Render)
const CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;

// 🌍 URL PayPal Sandbox
const PAYPAL_API = "https://api-m.sandbox.paypal.com";

// 🧠 Obtener Access Token
async function getAccessToken() {
  const auth = Buffer.from(CLIENT_ID + ":" + CLIENT_SECRET).toString("base64");

  const response = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: "grant_type=client_credentials"
  });

  const data = await response.json();

  if (!data.access_token) {
    console.error("Error token PayPal:", data);
    throw new Error("No se pudo obtener token PayPal");
  }

  return data.access_token;
}

// 💳 Crear orden
app.post("/create-order", async (req, res) => {
  try {
    const token = await getAccessToken();

    const response = await fetch(`${PAYPAL_API}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            amount: {
              currency_code: "USD",
              value: "10.00"
            }
          }
        ]
      })
    });

    const data = await response.json();

    console.log("ORDER CREATED:", data);

    res.json(data);

  } catch (error) {
    console.error("ERROR /create-order:", error);
    res.status(500).json({
      error: "Error creando orden"
    });
  }
});

// 🚀 Server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Servidor funcionando en puerto " + PORT);
});
