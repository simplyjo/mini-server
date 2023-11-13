const express = require("express");
const router = express.Router();
const Merchant = require("../models/merchant");
const cleanBody = require("../middlewares/cleanBody");
const Discount = require("../models/discount");
const Coupon = require("../models/coupon");
const MerchantReceipt = require("../models/merchantReceipt");
const { v4: uuid } = require("uuid");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const Order = require("../models/order");
const { sendEmail } = require("../helpers/getCode");
const { generateJwt } = require("../helpers/generateJwt");

router.post("/", cleanBody, async (req, res) => {
  try {
    const merchant = new Merchant({
      email: req.body.email,
      password: req.body.password,
      phone: req.body.phone,
      merchantName: req.body.merchantName,
      address: req.body.address,
      category: req.body.category,
    });
    console.log("merchant", merchant, "req", req.body);

    const existingMerchant = await Merchant.findOne({ email: merchant.email });

    if (existingMerchant) {
      return res.status(200).json({
        error: true,
        message: "This Email is already in use ",
      });
    }

    // check if password is entered correctly
    const check = merchant.password === req.body.confirmPassword;

    if (!check) {
      return res.status(400).json({
        error: true,
        message: "Password does not match",
      });
    }

    const hashedpassword = await Merchant.hashPassword(merchant.password);

    merchant.password = hashedpassword;

    const id = uuid(); //Generate unique id for the merchant.

    merchant.merchantId = id;

    // let code = Math.floor(1000000 + Math.random() * 900000); // Generate code for sending email

    // let expiry = Date.now() + 60 * 1000 * 15; //15 mins in ms

    // const sendCode = await sendEmail(merchant.email, code);
    let code = Math.floor(1000000 + Math.random() * 900000); // Generate code for sending email

    let expiry = Date.now() + 60 * 1000 * 15; //15 mins in ms

    const sendCode = await sendEmail(merchant.email, code);

    if (sendCode.error) {
      return res.status(500).json({
        error: true,
        message: "Couldn't send verification email.",
      });
    }
    merchant.emailToken = code;

    const newMerchant = new Merchant(merchant);
    await newMerchant.save();
    const token = jwt.sign(
      { email: merchant.email, id: newMerchant._id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    return res.status(200).json({
      success: true,
      message: "Check Your Mail For Further Instruction",
      merchant: newMerchant,
      token: token,
    });
  } catch (error) {
    console.log("error", error.response);
  }
});
router.patch("/send-verification-code", cleanBody, async (req, res) => {
  try {
    const { email } = req.body;

    console.log("email", req.body);
    const merchant = await Merchant.findOne({ email: email });

    if (!merchant) {
      return res.status(200).json({
        error: true,
        message: "Merchant Does not exist ",
      });
    }
    // let code = Math.floor(1000000 + Math.random() * 900000); // Generate code for sending email

    // let expiry = Date.now() + 60 * 1000 * 15; //15 mins in ms

    // const sendCode = await sendEmail(merchant.email, code);
    let code = Math.floor(1000000 + Math.random() * 900000); // Generate code for sending email

    let expiry = Date.now() + 60 * 1000 * 15; //15 mins in ms

    const sendCode = await sendEmail(email, code);

    if (sendCode.error) {
      return res.status(500).json({
        error: true,
        message: "Couldn't send verification email.",
      });
    }
    merchant.emailToken = code;
    merchant.emailTokenExpires = new Date(expiry);

    await merchant.save();
    return res.status(200).json({
      success: true,
      message: "Code Sent to Your Email",
      emailTokenExpires:expiry

    });
  } catch (error) {
    console.log("error", error.response);
  }
});

router.patch("/verify-email", cleanBody, async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) {
      return res.json({
        error: true,
        status: 400,
        message: "Please make a valid request",
      });
    }
    const merchant = await Merchant.findOne({
      email: email,
      emailToken: code,
      emailTokenExpires: { $gt: Date.now() },
    });

    console.log("======activateuser======");
    console.log(merchant);
    console.log(merchant.active);
    if (!merchant) {
      return res.status(400).json({
        error: true,
        message: "Invalid details",
      });
    } else {
      if (merchant.active)
        return res.send({
          error: true,
          message: "Account already activated",
          status: 400,
        });

      const { error, token } = await generateJwt(
        merchant.email,
        merchant.merchantId
      );
      if (error) {
        return res.status(500).json({
          error: true,
          message: "Couldn't create access token. Please try again later",
        });
      }

      merchant.emailToken = "";
      merchant.emailTokenExpires = null;
      merchant.active = true;
      merchant.accessToken = token;
      merchant.points = 25000;

      await merchant.save();

      return res.status(200).json({
        success: true,
        message: "Email Verified Successfully!.",
        token: merchant.accessToken,
        merchant: merchant,
      });
    }
  } catch (error) {
    console.error("activation-error", error);
    return res.status(500).json({
      error: true,
      message: error.message,
    });
  }
});

router.patch("/activate", cleanBody, async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) {
      return res.json({
        error: true,
        status: 400,
        message: "Please make a valid request",
      });
    }
    const merchant = await Merchant.findOne({
      email: email,
      emailToken: code,
      emailTokenExpires: { $gt: Date.now() },
    });

    console.log("======activateuser======");
    console.log(merchant);
    console.log(merchant.active);
    if (!merchant) {
      return res.status(400).json({
        error: true,
        message: "Invalid details",
      });
    } else {
      if (merchant.active)
        return res.send({
          error: true,
          message: "Account already activated",
          status: 400,
        });

      const { error, token } = await generateJwt(
        merchant.email,
        merchant.merchantId
      );
      if (error) {
        return res.status(500).json({
          error: true,
          message: "Couldn't create access token. Please try again later",
        });
      }

      merchant.emailToken = "";
      merchant.emailTokenExpires = null;
      merchant.active = true;
      merchant.accessToken = token;
      merchant.points = 25000;

      //   let referrer= await Merchant.findOne({
      //     referralCode: merchant.referrer,
      //   });

      //   if(referrer) {
      //     if (referrer.active === true) {
      //       let referedUser = await Merchant.updateOne(
      //         { referralCode: merchant.referrer },
      //         {
      //           $push: {
      //             referrals: {
      //               email: merchant.email,
      //               id: merchant._id,
      //               signupDate: Date.now(),
      //               point: 12.5,
      //             },
      //           },
      //         }
      //       );

      //     } else {
      //         console.log("ot active")
      //     }
      //   }

      await merchant.save();

      return res.status(200).json({
        success: true,
        message: "Account activated.",
        token: merchant.accessToken,
        merchant: merchant,
      });
    }
  } catch (error) {
    console.error("activation-error", error);
    return res.status(500).json({
      error: true,
      message: error.message,
    });
  }
});

module.exports = router;
