// Import required modules
require('dotenv').config(); // Load environment variables
const crypto = require('crypto'); // Cryptographic library
const Oauth = require('oauth-1.0a'); // OAuth 1.0a library
const express = require("express");
const User = require("../models/user");
const needle = require("needle");



const router = express.Router();
const cleanBody = require("../middlewares/cleanBody");





router.post("/", cleanBody, async (req, res) => {

    const {userId, referrer}= req.body

    console.log("userId, referrer", userId, referrer)



    let  user = await User.findOne({ twitterId:userId  });
    let  ref = await User.findOne({ userName: referrer });
    if(user) {
    
      if(!ref){
        console.log("ref", user)
      } else {
        console.log("reftrue", ref)
       
       await User.updateOne(
        {userName:referrer},
        { $push: { referrals: user.userName } }
     )
        user.referrer = referrer
        user.total_points= user.total_points + 550
        user.save()
        return res.status(200).json({
          success: true,
          user:user,
          
        });
      }
    } else {
     
return
    }
    // console.log("messageResponseRawdataCallbackUser",user);

    return res.status(200).json({
      success: true,
      user:user,
      
    });
 

})






module.exports = router;
