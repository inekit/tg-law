const axios = require("axios").default;

const express = require("express");
const app = express();
const port = 80;

const params = new URLSearchParams();
params.append("a", 1);
const tOrmCon = require("../db/connection");

(async () => {
  console.log(await getPaymentLink(1));
})();

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

app.get("/recieve", async (req, res) => {
  console.log(req, 1111, req.body, 2222, req.params);

  const connection = await tOrmCon;

  connection.query("update appointments set payed = $1", [req.label]);
  res.send();
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
