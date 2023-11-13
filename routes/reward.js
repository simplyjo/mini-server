const express = require("express");
const router = express.Router();
const Card = require("../models/card");
const User = require("../models/user");
const Merchant = require("../models/merchant");
const Reward = require("../models/reward");
const cleanBody = require("../middlewares/cleanBody");

const mongoose = require("mongoose");
const CardAgent = require("../models/agentcard");
var axios = require("axios");

const { sendEmail } = require("../helpers/voucherMailer");




router.get("/:id", cleanBody, async (req, res) => {
  try {
    const { id } = req.params;
    const card = await Card.find({ userId: id }).sort({ _id: -1 });

    if (!card) {
      return res.status(400).json({
        error: true,
        message: "No card Found",
      });
    } else {
      return res.status(200).json({
        success: true,
        message: "card.",
        card: card,
      });
    }
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: error.message,
    });
  }
});

module.exports = router;
