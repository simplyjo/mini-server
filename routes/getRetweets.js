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

const endpointURL = `https://api.twitter.com/2/users/me?${params}`;
const endpointFolURL = `https://api.twitter.com/1.1/followers/ids.json`;
// const endpointFollowsURL = "https://api.twitter.com/2/users/:1687160446585884672/following&target_user_id=1532127337004908547"
// const endpointFollowsURL = "https://api.twitter.com/2/users/1687160446585884672/following&target_user_id=1532127337004908547"
// const endpointFollowsURL = "https://api.twitter.com/2/users/1687160446585884672/followers"

const userId = "1532127337004908547";
const endpointFollowsURL = `https://api.twitter.com/2/users/${userId}/following`;
const url = `https://api.twitter.com/2/users/${userId}/followers`;
const bearerToken = process.env.BEARER_TOKEN;

const { URLSearchParams } = require('url'); // URL handling library

// const readline = require('readline').createInterface({
//     input: process.stdin,
//     output: process.stdout
// })
console.log("key", process.env.CONSUMER_KEY)
// Create an OAuth 1.0a instance with consumer key and secret
const oauth = Oauth({
    consumer: {
        key: process.env.CONSUMER_KEY,
        secret: process.env.CONSUMER_SECRET
    },
    signature_method: 'HMAC-SHA1',
    hash_function: (baseString, key) => crypto.createHmac('sha1', key).update(baseString).digest('base64')
});



// GET User Likes
async function getRt(userId, tweetId
  ) {
  
    try {

      console.log("userIdtasktwo", userId, tweetId)
      

const endpointRtURL = `https://api.twitter.com/2/tweets/${tweetId}/retweeted_by`;
// /2/tweets/:id/quote_tweets
  
 // These are the parameters for the API request
  // by default, only the Tweet ID and text are returned
  const params = {
    "tweet.fields": "lang,author_id", // Edit optional query parameters here
    "user.fields": "created_at", // Edit optional query parameters here
  };

  

  // this is the HTTP header that adds bearer token authentication
  const res = await needle("get", endpointRtURL, params, {
    headers: {
      "User-Agent": "v2RetweetedByUsersJS",
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

    const userRt = await getRt(userId, tweetId);
    console.log("userRt", userRt)

    const taskStatus = await userRt?.data?.findIndex(el => el.id === userId)
  console.log("taskStatus", taskStatus)
  if(taskStatus >= 0) {
    let  user = await User.findOne({ twitterId: userId }); 
    if(!user) {
   
return
    } else {
   console.log("userfound", user)
   if(user.task_three === false)

      user.task_three = true
      user.total_points = user.total_points + 550

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

      user.task_three = false
      user.total_points = user.total_points - 550

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
