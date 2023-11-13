const express = require("express");
const router = express.Router();
const Discount = require("../models/discount");
const User = require("../models/user");
const Merchant = require("../models/merchant");
const cleanBody = require("../middlewares/cleanBody");
const mongoose = require("mongoose");
const https = require("https");



router.post("/", (res) => {
  const params = JSON.stringify({
    email: "customer@email.com",
    amount: "20000",
  });
  const options = {
    hostname: "api.paystack.co",
    port: 443,
    path: "/transaction/initialize",
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.PAY_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
  };
  const req = https
    .request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => {
        console.log(JSON.parse(data));
        return (JSON.parse(data));
      });
    })
    .on("error", (error) => {
      console.error(error);
    });
  req.write(params, (req,res)=> {
    return params
  });
  req.end();
});

module.exports = router;

