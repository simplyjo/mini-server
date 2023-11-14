const express = require("express");
const cleanBody = require("../middlewares/cleanBody");
const router = express.Router();
const User = require("../models/user");

const mongoose = require("mongoose");




router.patch("/:id", async (req, res) => {
  const { id } = req.params;
  const { wallet } = req.body;

  const user = await User.findOne({twitterId:id})

  if(user && user.walletStatus){
    user.wallet=wallet
   user.save()
  } else {
    user.wallet=wallet
    user.walletStatus=true
    user.total_points=user.total_points + 550
    user.save()
  }

 


  
 

  return res.status(200).json({
    success: true,
    message: "profile updated Successful",
    user: user,
  });
});


module.exports = router;
