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
async function getLikes(userId, tweetId
  ) {
  
    try {

      console.log("userIdtaskone", userId, tweetId)
      

const endpointLikesURL = `https://api.twitter.com/2/users/${userId}/liked_tweets`;
  
 // These are the parameters for the API request
  // by default, only the Tweet ID and text are returned
  const params = {
    "tweet.fields": "lang,author_id", // Edit optional query parameters here
    "user.fields": "created_at", // Edit optional query parameters here
  };

  // this is the HTTP header that adds bearer token authentication
  const res = await needle("get", endpointLikesURL, params, {
    headers: {
      "User-Agent": "v2LikedTweetsJS",
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

    const userLikes = await getLikes(userId, tweetId);
    console.log("userLikes", userLikes)

    const taskStatus = await userLikes?.data?.findIndex(el => el.id === tweetId)
  console.log("taskStatus", taskStatus)
  let  user = await User.findOne({ twitterId: userId });

  if(taskStatus >= 0) {
    if(user) {
      if(user.task_two === false)

      user.task_two = true
      user.total_points = user.total_points + 1100

      await user.save();

    }
    return res.status(200).json({
      success: true,
      user:user,
      
    });
  } else {
    

    return res.status(200).json({
      success: true,
      user:user,
      
    });
  }
  

})






module.exports = router;
