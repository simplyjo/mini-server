const router = require("express").Router();
const fetch = require('node-fetch');
const CLIENT_HOME_PAGE_URL = "http://localhost:3000";
// const CLIENT_HOME_PAGE_URL = "https://mini-app-sol-3b4dbf04ff49.herokuapp.com";
const crypto = require('crypto'); // Cryptographic library
const Oauth = require('oauth-1.0a'); // OAuth 1.0a library
const accessTokenURL = 'https://api.twitter.com/oauth/access_token';
const params = 'user.fields=created_at,description&expansions=pinned_tweet_id' // Edit optional query parameters here


const endpointURL = `https://api.twitter.com/2/users/me?${params}`;

const oauth = Oauth({
  consumer: {
      key: process.env.CONSUMER_KEY,
      secret: process.env.CONSUMER_SECRET
  },
  signature_method: 'HMAC-SHA1',
  hash_function: (baseString, key) => crypto.createHmac('sha1', key).update(baseString).digest('base64')
});

// https://mini-app-sol-3b4dbf04ff49.herokuapp.com
//https%3A%2F%2Fmini%2Dapp%2Dsol%2D3b4dbf04ff49%2Eherokuapp%2Ecom
//https%3A%2F%2Fmini-app-sol-3b4dbf04ff49.herokuapp.com
// const requestTokenURL = `https://api.twitter.com/oauth/request_token?oauth_callback=http%3A%2F%2Flocalhost%3A3000%2Fcallback&x_auth_access_type=write`;

async function requestToken (req, res){

  try {
const requestTokenURL = `https://api.twitter.com/oauth/request_token?oauth_callback=https%3A%2F%2Fmini-app-sol-3b4dbf04ff49.herokuapp.com%2Fcallback&x_auth_access_type=write`;

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

// when login is successful, retrieve user info
router.get("/login/success", (req, res) => {
  if (req.user) {
    res.json({
      success: true,
      message: "user has successfully authenticated",
      user: req.user,
      cookies: req.cookies
    });
  }
});

// when login failed, send failed msg
router.get("/login/failed", (req, res) => {
  res.status(401).json({
    success: false,
    message: "user failed to authenticate."
  });
});

// GET USER
async function getRequest({
  oauth_token,
  oauth_token_secret
}) {

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

  if (req.body) {
    return JSON.parse(req.body);
  } else {
    throw new Error('Unsuccessful request');
  }
}

async function accessToken({ oauth_token, oauth_secret }, verifier) {
  try {
      const url = `https://api.twitter.com/oauth/access_token?oauth_verifier=${oauth_secret}&oauth_token=${oauth_token}`
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

// async function accessToken({
//   oauth_token,
//   oauth_token_secret
// }, verifier) {

//   const authHeader = oauth.toHeader(oauth.authorize({
//     url: accessTokenURL,
//     method: 'POST'
//   }));

//   const path = `https://api.twitter.com/oauth/access_token?oauth_verifier=${oauth_token_secret}&oauth_token=${oauth_token}`

//   const request = await fetch(path, {
//     method: 'POST',
//     headers: {
//         Authorization: authHeader['Authorization']
//     }
// });


//   if (req.body) {
//     return qs.parse(req.body);
//   } else {
//     throw new Error('Cannot get an OAuth request token');
//   }
// }

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

// When logout, redirect to client
router.get("/logout", (req, res) => {
  req.logout();
  res.redirect(CLIENT_HOME_PAGE_URL);
});





router.get("/twitter", async (req, res) => {
  try {
    console.log("start here")
      // Get the request token from Twitter
      const oAuthRequestToken = await requestToken();
      const {ref} = req.body
console.log("oAuthRequestToken", oAuthRequestToken, "i got here")
      // Request the user for a PIN
      const authorizeURL = `https://api.twitter.com/oauth/authenticate?oauth_token=${oAuthRequestToken.oauth_token}`;
    
      console.log("authorizeURL", authorizeURL, "got here")
       res.send({
          success: true,
          message: "User logged in successfully",
          path: authorizeURL,
          ref:ref
        });


 
     
    
  } catch (error) {
      console.log('Error: ', error);
  }
})





router.post("/twitter/callback", async (req, res) => {


  
  console.log("tokens",req.body)
 

    const { oauth_verifier, oauth_token } = req.body;


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

      // return res.send({success:true, status:"Logged In"})
      const body = await request.text();
      return Object.fromEntries(new URLSearchParams(body));
  } catch (error) {
      console.error('Error:', error)
      throw error;
  }
})
module.exports = router;
