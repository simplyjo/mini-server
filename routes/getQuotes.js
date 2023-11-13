// Import required modules
require('dotenv').config(); // Load environment variables
const crypto = require('crypto'); // Cryptographic library
const Oauth = require('oauth-1.0a'); // OAuth 1.0a library
const express = require("express");
const User = require("../models/user");
const needle = require("needle");



const router = express.Router();
const cleanBody = require("../middlewares/cleanBody");



const bearerToken = process.env.BEARER_TOKEN;


console.log("key", process.env.CONSUMER_KEY)


// GET Quotes
async function getQuote(userId, tweetId
  ) {
  
    try {

      console.log("userIdtasktwo", userId, tweetId)
      

const endpointRtURL = `https://api.twitter.com/2/tweets/${tweetId}/quote_tweets`;
// /2/tweets/:id/quote_tweets
  
 // These are the parameters for the API request
  // by default, only the Tweet ID and text are returned
  let params = {
    "max_results": 100,
    "tweet.fields": "created_at"
}

  

  // this is the HTTP header that adds bearer token authentication
  const res = await needle("get", endpointRtURL, params, {
    headers: {
      "User-Agent": "v2QuoteTweetsJS",
      authorization: `Bearer ${bearerToken}`
    },
  });
  
return res.body

    console.log("res",res.body)
  

  }
  catch (error) {
    console.error('Error:', error)
    throw error;
}}




// VALIDATE the PIN => User requested action
router.post("/one", cleanBody, async (req, res) => {

  const {userId, tweetId} = req.body

    const userQuote = await getQuote(userId, tweetId);
    console.log("userRt", userQuote)

    // const taskStatus = await userQuote?.data?.findIndex(el => el.id === tweetId)
  // console.log("taskStatus", taskStatus)
  if(userQuote?.data?.length > 0) {
    let  user = await User.findOne({ twitterId: userId }); 
    if(!user) {
   

    } else {
   console.log("userfound", user)
      if(user.task_four === false)
      user.task_four = true
      user.total_points = user.total_points + 300

      await user.save();
   console.log("userfoundSaved", user)


    }
    return res.status(200).json({
      success: true,
      user:user,
      
    });
  } else {
    let  user = await User.findOne({ twitterId: userId }); 
    if(!user) {
   

    } else {
   console.log("userfound", user)

      user.task_four = false
      user.total_points = user.total_points - 300

      await user.save();
   console.log("userfoundSaved", user)


    }
    return res.status(200).json({
      success: true,
      user:user,
      
    });
  }
   
  // console.log("userLikes", userLikes) 

})






module.exports = router;
