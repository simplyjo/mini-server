// Import required modules
require('dotenv').config(); // Load environment variables
const crypto = require('crypto'); // Cryptographic library
const Oauth = require('oauth-1.0a'); // OAuth 1.0a library
const express = require("express");
const User = require("../models/user");
const needle = require("needle");



const router = express.Router();
const cleanBody = require("../middlewares/cleanBody");

const params = 'user.fields=created_at,description,profile_image_url&expansions=pinned_tweet_id' // Edit optional query parameters here

const userId = "1532127337004908547";

const bearerToken = process.env.BEARER_TOKEN;

const { URLSearchParams } = require('url'); // URL handling library


// GET User Likes
async function getTweet(userId, tweetId
  ) {
  
    try {

      console.log("userIdtaskone", userId, tweetId)
      

 const endpointURL = "https://api.twitter.com/2/tweets?ids=";;
  
 // These are the parameters for the API request
  // by default, only the Tweet ID and text are returned
  const params = {
    "ids": `${tweetId}`, 
    "tweet.fields": "lang,author_id", // Edit optional query parameters here
    "user.fields": "created_at", // Edit optional query parameters here
  };

  // this is the HTTP header that adds bearer token authentication
  const res = await needle("get", endpointURL, params, {
    headers: {
      "User-Agent": "v2TweetLookupJS",
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
router.post("/", cleanBody, async (req, res) => {

  const {userId, tweetId} = req.body

    const userTweet = await getTweet(userId, tweetId);
    console.log("userTweet", userTweet)

    const taskStatus = await userTweet?.data?.findIndex(el => el.id === tweetId)
  console.log("taskStatus", taskStatus)
  if(userTweet?.data?.length >= 1) {
    let  user = await User.findOne({ twitterId: userId });
    if(!user) {
      return

    } else {
   console.log("userfound", user)
   if(user.tweet === false)

      user.tweet = true
      user.total_points = user.total_points + 1100

      await user.save();
   console.log("userfoundSaved", user)


    }
    return res.status(200).json({
      success: true,
      user:user,
      
    });
  } else {
    return
  }
   
  // console.log("userLikes", userLikes) 

})






module.exports = router;
