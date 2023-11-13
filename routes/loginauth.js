// Import required modules
require('dotenv').config(); // Load environment variables
const crypto = require('crypto'); // Cryptographic library
const Oauth = require('oauth-1.0a'); // OAuth 1.0a library
const express = require("express");


const router = express.Router();
const cleanBody = require("../middlewares/cleanBody");



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
const oauth_callback="https%3A%2F%2Faipepearb%0x2Exyz"
const local_callback = "http%3A%2F%2Flocalhost%3A"


 async function requestToken (req, res){

    try {
        const requestTokenURL = `https://api.twitter.com/oauth/request_token?oauth_callback=http%3A%2F%2Flocalhost%3A3000%2Fcallback&x_auth_access_type=write`;
        const authHeader = oauth.toHeader(oauth.authorize({
            url: requestTokenURL,
            method: 'POST'
        }));

        const request = await fetch(requestTokenURL, {
            'method': 'POST',
            headers: {
                Authorization: authHeader['Authorization']
            }
        })
        const body = await request.text();

        return Object.fromEntries(new URLSearchParams(body));
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}

// VALIDATE the PIN => User requested action
router.post("/", cleanBody, async (req, res) => {

    try {
        const url = `https://api.twitter.com/oauth/access_token?oauth_verifier=${verifier}&oauth_token=${oauth_token}`
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
})

async function accessToken({ oauth_token, oauth_secret }, verifier) {
    try {
        const url = `https://api.twitter.com/oauth/access_token?oauth_verifier=${verifier}&oauth_token=${oauth_token}`
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

// SEND THE TWEET
async function writeTweet({ oauth_token, oauth_token_secret }, tweet) {
    const token = {
        key: oauth_token,
        secret: oauth_token_secret
    }

    const url = 'https://api.twitter.com/2/tweets';

    const headers = oauth.toHeader(oauth.authorize({
        url,
        method: 'POST'
    }, token));

    try {
        const request = await fetch(url, {
            method: 'POST',
            body: JSON.stringify(tweet),
            responseType: 'json',
            headers: {
                Authorization: headers['Authorization'],
                'user-agent': 'V2CreateTweetJS',
                'content-type': 'application/json',
                'accept': 'application/json'
            }
        })
        const body = await request.json();
        return body;
    } catch (error) {
        console.error('Error:', error)
    }
}
// GET USER
async function getUser({ oauth_token, oauth_token_secret }, tweet) {
    const token = {
        key: oauth_token,
        secret: oauth_token_secret
    }

    const url = 'https://api.twitter.com/2/users/me';

    const headers = oauth.toHeader(oauth.authorize({
        url,
        method: 'GET'
    }, token));

    try {
        const request = await fetch(url, {
            method: 'GET',
            body: JSON.stringify(tweet),
            responseType: 'json',
            headers: {
                Authorization: headers['Authorization'],
                'user-agent': 'V2CreateTweetJS',
                'content-type': 'application/json',
                'accept': 'application/json'
            }
        })
        const body = await request.json();
        return body;
    } catch (error) {
        console.error('Error:', error)
    }
}

router.post("/", cleanBody, async (req, res) => {
    try {
        // Get the request token from Twitter
        const oAuthRequestToken = await requestToken();

        // Request the user for a PIN
        const authorizeURL = `https://api.twitter.com/oauth/authorize?oauth_token=${oAuthRequestToken.oauth_token}`;
      
         res.send({
            success: true,
            message: "User logged in successfully",
            path: authorizeURL,
          });


   
       
        
        console.log('Please go here and authorize', authorizeURL);
        const pin = await input('Paste the PIN here:');

        // Validate the PIN and get the access token
        const oAuthAccessToken = await accessToken(oAuthRequestToken);

        // Send a tweet
        const messageResponse = await getUser(oAuthAccessToken);
        console.log(messageResponse);
    } catch (error) {
        console.log('Error: ', error);
    }
})

// (async () => {
//     try {
//         // Get the request token from Twitter
//         const oAuthRequestToken = await requestToken();

//         // Request the user for a PIN
//         const authorizeURL = `https://api.twitter.com/oauth/authorize?oauth_token=${oAuthRequestToken.oauth_token}`;
//         console.log('Please go here and authorize', authorizeURL);
//         const pin = await input('Paste the PIN here:');

//         // Validate the PIN and get the access token
//         const oAuthAccessToken = await accessToken(oAuthRequestToken, pin.trim());

//         // Send a tweet
//         const messageResponse = await writeTweet(oAuthAccessToken, { 'text': 'Hello Viewers!' });
//         console.log(messageResponse);
//     } catch (error) {
//         console.log('Error: ', error);
//     }
// })();

module.exports = router;
