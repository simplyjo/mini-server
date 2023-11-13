const express = require("express")
const router = express.Router()
const User = require("../models/user")
const  {validateToken} = require("../middlewares/validateToken")

router.get("/", validateToken, async (req, res) => {
    try {
      const { id, referralCode } = req.decoded;

      const referredAccounts = await User.find(
        { referrer: referralCode },
        { email: 1, referralCode: 1, active:1, _id: 0 }
      );
      return res.send({
        success: true,
        accounts: referredAccounts,
        total: referredAccounts.length,
      });
    } catch (error) {
      console.error("fetch-referred-error.", error);
      return res.stat(500).json({
        error: true,
        message: error.message,
      });
    }
  });

  module.exports= router