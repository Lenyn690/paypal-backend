import express from "express";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());

// 🔐 ENV VARIABLES
const CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;

const PAYPAL_API = "https://api-m.sandbox.paypal.com";

// 🧠 TOKEN (SIN node-fetch IMPORT)
async function getAccessToken() {

  if (!CLIENT_ID || !CLIENT_SECRET) {
    throw new Error("Faltan variables PAYPAL_CLIENT_ID o PAYPAL_CLIENT_SECRET");
  }

  const auth = Buffer.from(
    CLIENT_ID + ":" + CLIENT_SECRET
  ).toString("base64");

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
    console.error(data);
    throw new Error("No se pudo obtener access token");
  }

  return data.access_token;
}

// 💳 CREATE ORDER
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

    return res.json(data);

  } catch (err) {
    console.error("ERROR CREATE ORDER:", err);
    res.status(500).json({ error: "Error creando orden" });
  }
});

// 🚀 START SERVER
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Servidor OK en puerto", PORT);
});
