const axios = require("axios").default;

const express = require("express");
const app = express();
const port = 80;

const params = new URLSearchParams();
params.append("a", 1);
const tOrmCon = require("../db/connection");
require("dotenv").config();

async function getPaymentLink(order_id) {
  const response = await axios.post(
    "https://yoomoney.ru/quickpay/confirm.xml",
    {
      receiver: "4100111177290037",
      "quickpay-form": "shop",
      sum: 500,
      targets: "Предоплата за юр услуги",
      paymentType: "AC",
      label: "123",
    }
  );

  return response.request.res.responseUrl;
}

app.use(
  express.urlencoded({
    extended: true,
  })
);

app.post("/recieve", async (req, res) => {
  const { currency, label, amount } = req.body;
  console.log(currency, label, amount);

  if (currency != "643" || amount < 500) return res.status(201).send("NO_DATA");

  const connection = await tOrmCon;

  await connection
    .query("update appointments set status = 'paid' where id = $1", [req.label])
    .catch(console.error);
  res.send("SUCCESS");
});

if (process.env.NODE_ENV === "production")
  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
  });

module.exports = getPaymentLink;
