const express = require("express");
const router = express.Router();

/** Edited ** */

const Joi = require("joi");
const { v4: uuid } = require("uuid");
const { customAlphabet: generate } = require("nanoid");

// const { generateJwt } = require("./helpers/generateJwt");
const { sendEmail } = require("../helpers/mailer");
const User = require("../models/user");
const Merchant = require("../models/merchant");
const  cleanBody = require("../middlewares/cleanBody")

const CHARACTER_SET =
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

const REFERRAL_CODE_LENGTH = 8;

const referralCode = generate(CHARACTER_SET, REFERRAL_CODE_LENGTH);

//Validate user schema
const userSchema = Joi.object().keys({
  email: Joi.string().email({ minDomainSegments: 2 }),
  password: Joi.string().required().min(4),
  confirmPassword: Joi.string().valid(Joi.ref("password")).required(),
  referrer: Joi.string().allow("", null),
  name: Joi.string().allow("", null),
});


router.post("/", cleanBody, async (req, res) => {
  try {
    const result = userSchema.validate(req.body);
    if (result.error) {
   
      return res.json({
        error: true,
        status: 400,
        type:result.value,
        message: result.error.message,
      });
    }

    //Check if the email has been already registered.
    var user = await User.findOne({
      email: result.value.email,
    });

    if (user) {
      return res.json({
        error: true,
        message: "Email is already in use",
      });
    }

    const hash = await User.hashPassword(result.value.password);

    const id = uuid(); //Generate unique id for the user.
    result.value.userId = id;

    delete result.value.confirmPassword;
    result.value.password = hash;

    let code = Math.floor(1000000 + Math.random() * 900000);

    let expiry = Date.now() + 60 * 1000 * 15; //15 mins in ms

    const sendCode = await sendEmail(result.value.email, code);

    if (sendCode.error) {
      return res.status(500).json({
        error: true,
        message: "Couldn't send verification email.",
      });
    }
    result.value.emailToken = code;
    result.value.emailTokenExpires = new Date(expiry);

    if (hasOwnProperty.bind(result.value)("referrer")) {
      if (result.value.referrer === null || result.value.referrer === "") {
        result.value.referralCode = referralCode();
        const newUser = new User(result.value);
        newUser.save();

        return res.status(200).json({
          success: true,
          message: "Registration Success",
          referralCode: result.value.referralCode,
          email: result.value.email,
        });
      }
      let referrer = await User.findOne({
        referralCode: result.value.referrer,
      });

 

      if (!referrer) {
        return res.status(400).send({
          error: true,
          message: "Invalid referral code.",
        });
      }
      
    }

    result.value.referralCode = referralCode();
    const newUser = new User(result.value);
    await newUser.save();
    return res.status(200).json({
      success: true,
      message: "A code has being sent to your mail",
      referralCode: result.value.referralCode,
      email: result.value.email,
    });

    
  } catch (error) {
    console.error("signup-error", error);
    return res.json({
      error: true,
      message: "Cannot Register",
    });
   
  }
});
router.post("/merchant", cleanBody, async (req, res) => {
  try {
  
    const result = req.body
  res.json({result})
  
  
    const merchant = new Merchant({
      discount:req.body.discount,
      price:req.body.price,
      merchant:req.body.merchant,
      email:req.body.email,
      address:req.body.address,
      category:req.body.category,
    })


    const hash = await Merchant.hashPassword(req.body.password);
    

    const id = uuid(); //Generate unique id for the user.
    merchant.merchantId = id;
   
    delete merchant.confirmPassword;
    merchant.password = hash;

  
    await merchant.save();
    return res.status(200).json({
      success: true,
      message: "Registration Success",
      email: result.value.email,
    });

    // return res.redirect("/")
  } catch (error) {
    console.error("signup-error", error);
    return res.json({
      error: true,
      message: "Cannot Register",
    });
 
  }
});



module.exports = router;