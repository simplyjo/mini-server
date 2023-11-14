// Import required modules
require('dotenv').config(); // Load environment variables
const crypto = require('crypto'); // Cryptographic library
const Oauth = require('oauth-1.0a'); // OAuth 1.0a library
const express = require("express");
const User = require("../models/user");
const needle = require("needle");
const fetch = require('node-fetch');


const router = express.Router();
const cleanBody = require("../middlewares/cleanBody");

const params = 'user.fields=created_at,description,profile_image_url&expansions=pinned_tweet_id' // Edit optional query parameters here

const endpointURL = `https://api.twitter.com/2/users/me?${params}`;
const endpointFolURL = `https://api.twitter.com/1.1/followers/ids.json`;
// const endpointFollowsURL = "https://api.twitter.com/2/users/:1687160446585884672/following&target_user_id=1532127337004908547"
// const endpointFollowsURL = "https://api.twitter.com/2/users/1687160446585884672/following&target_user_id=1532127337004908547"
// const endpointFollowsURL = "https://api.twitter.com/2/users/1687160446585884672/followers"

const userId = "1687160446585884672";
const endpointFollowsURL = `https://api.twitter.com/2/users/${userId}/following`;
const url = `https://api.twitter.com/2/users/${userId}/followers`;
const endpointLikesURL = `https://api.twitter.com/2/users/${userId}/liked_tweets`;
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

// Function to get user input from the command line
async function input(prompt) {
  return new Promise(async (resolve, reject) => {
    // readline.question(prompt, (out) => {

    //     resolve(out);
    // })
  })
}

/**
 * Request Access token from Twitter
 * @returns {Object} Access token and secret
 */

const callback_url = "https://aipepearb.xyz/"
const oauth_callback = "https%3A%2F%2Faipepearb%0x2Exyz"
const local_callback = "http%3A%2F%2Flocalhost%3A"

// GET USER
async function getRequest({
  oauth_token,
  oauth_token_secret }
) {

  try {


    const token = {
      key: oauth_token,
      secret: oauth_token_secret
    };

    const authHeader = oauth.toHeader(oauth.authorize({
      url: endpointURL,
      method: 'GET'
    }, token));

    const req = await fetch(endpointURL, {
      headers: {
        Authorization: authHeader["Authorization"],
        'user-agent': "v2UserLookupJS"
      }
    });

    console.log("req", req)

    const body = await req.text();
    return Object.fromEntries(new URLSearchParams(body));
  }
  catch (error) {
    console.error('Error:', error)
    throw error;
  }
}
// GET Follows
async function getFollows(
) {

  try {

    let users = [];


    // These are the parameters for the API request
    // by default, only the Tweet ID and text are returned
    let params = {
      "max_results": 1000,
      "user.fields": "created_at"
    }

    // this is the HTTP header that adds bearer token authentication
    const res = await needle("get", endpointFollowsURL, params, {
      headers: {
        "User-Agent": "v2FollowingJS",
        authorization: `Bearer ${bearerToken}`
      },
    });



    console.log("res", res, res.data, res.body)


  }
  catch (error) {
    console.error('Error:', error)
    throw error;
  }
}
// GET User Likes
async function getLikes(
) {

  try {




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



    console.log("res", res.body)


  }
  catch (error) {
    console.error('Error:', error)
    throw error;
  }
}

// VALIDATE the PIN => User requested action
async function accessToken(oauth_token, oauth_verifier) {
  try {
    const url = `https://api.twitter.com/oauth/access_token?oauth_verifier=${oauth_verifier}&oauth_token=${oauth_token}`
    const authHeader = oauth.toHeader(oauth.authorize({
      url,
      method: 'POST'
    }));

    const request = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: authHeader['Authorization']
      }
    });
    const body = await request.text();
    return Object.fromEntries(new URLSearchParams(body));
  } catch (error) {
    console.error('Error:', error)
    throw error;
  }
}


// VALIDATE the PIN => User requested action
router.post("/", cleanBody, async (req, res) => {

  const { oauth_token, oauth_verifier, ref } = req.body

  console.log("oauth_verifier, oauth_token", oauth_verifier, oauth_token)
  // Validate the PIN and get the access token
  const oAuthAccessToken = await accessToken(oauth_token, oauth_verifier);
  // console.log("oAuthAccessToken",oAuthAccessToken);

  // Get Authorised User
  const profile = await getRequest(oAuthAccessToken);


  // const userFollows = await getLikes(oAuthAccessToken );


  const { data } = JSON.parse(Object.keys(profile)[0])

  // console.log("messageResponseRaw","callbackpage",(profile));
  // console.log("messageResponseRaw",(JSON.parse(Object.keys(profile)[0])));
  console.log("messageResponseRawdataCallback",data);

  // data: {
  //   name: 'DeFi Beast',
  //   profile_image_url: 'https://pbs.twimg.com/profile_images/1687160500092616715/tw5cyn0E_normal.png',
  //   id: '1687160446585884672',
  //   created_at: '2023-08-03T17:56:23.000Z',
  //   description: '',
  //   username: 'beast31278'
  // }
//  const {name, id,profile_image_url,username } = await data

//  console.log("name, id,profile_image_url,username", name, id,profile_image_url,username)

  let user = await User.findOne({ twitterId: data?.id });
 
  if (!user) {
   

      const newUser = new User({
        name: data?.name,
        userName: data?.username,
        twitterId: data?.id,
        profileImageUrl: data?.profile_image_url,
        total_points: 550,
        task_one: false,
        task_two: false,
        task_three: false,
        task_four: false,
        referrals: [],
        referrer: "",
        referrer: ref,
        tweet:false

      })
      await newUser.save();
      return res.status(200).json({
        success: true,
        user: newUser,

      });
    

   
  } 

  return res.status(200).json({
    success: true,
    user: user,

  });

 
  // console.log("messageResponseRawdataCallbackUser", user);

  // return res.status(200).json({
  //   success: true,
  //   user: user,

  // });


})






module.exports = router;
