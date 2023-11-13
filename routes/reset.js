const express = require("express")
const router = express.Router()
const User = require("../models/user")
const  cleanBody = require("../middlewares/cleanBody")
const jwt = require("jsonwebtoken");



router.patch("/", cleanBody, async (req, res) => {
    try {
      const { token, newPassword, confirmPassword, email } = req.body;
      if (!token || !newPassword || !confirmPassword || !email) {
        return res.status(403).json({
          error: true,
          message:
            "Couldn't process request. Please provide all mandatory fields",
        });
      }
      const user = await User.findOne({
        resetPasswordToken: req.body.token,
        resetPasswordExpires: { $gt: Date.now() },
      });
      if (!user) {
        return res.send({
          error: true,
          message: "Password reset token is invalid or has expired.",
        });
      }
      if (newPassword !== confirmPassword) {
        return res.status(400).json({
          error: true,
          message: "Passwords didn't match",
        });
      }
      const hash = await User.hashPassword(req.body.newPassword);
      user.password = hash;
      user.resetPasswordToken = null;
      user.resetPasswordExpires = "";
  
      await user.save();
      const newtoken = jwt.sign({email:user.email, id:user._id}, process.env.JWT_SECRET, {expiresIn:"1h"})

  
      return res.send({
        success: true,
        message: "Password has been changed",
        user:user,
        token:newtoken
      });
    } catch (error) {
      console.error("reset-password-error", error);
      return res.status(500).json({
        error: true,
        message: error.message,
      });
    }
  });
  

  module.exports = router