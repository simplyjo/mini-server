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



// GET User 
async function getUser(userId
) {

  try {

    console.log("userIdtaskone", userId)


    const endpointURL = `https://api.twitter.com/2/users/${userId}`;

    // These are the parameters for the API request
    // by default, only the Tweet ID and text are returned


    // this is the HTTP header that adds bearer token authentication
    const res = await needle("get", endpointURL, {
      headers: {
        "User-Agent": "v2UserLookupJS",
        authorization: `Bearer ${bearerToken}`
      },
    });

    return res.body

    console.log("res", res.body)


  }
  catch (error) {
    console.error('Error:', error)
    throw error;
  }
}




// VALIDATE the PIN => User requested action
router.post("/one", cleanBody, async (req, res) => {


  const { userId } = req.body

  const userData = await getUser(userId);
  console.log("user", userData)

  
  let user = await User.findOne({ twitterId: userId });
if(userData?.data?.name.split('❤️')[1] !== "undefined") {
  if (userData?.data?.name.split('❤️')[1].trim().toLowerCase() === "solmeme") {
    if (user) {
  
      console.log("userfound", user)
      if (user.task_one === false)

        user.task_one = true
      user.total_points = user.total_points + 5500

      await user.save();
      console.log("userfoundSaved", user)


    }

    return res.status(200).json({
      success: true,
      user: user,

    });
  } else {
    return res.status(200).json({
      success: true,
      user: user,

    });
  }} else {
    return res.status(200).json({
      error: true,
      user: user,

    });
  }





})






module.exports = router;
