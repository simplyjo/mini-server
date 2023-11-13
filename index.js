const cookieSession = require("cookie-session");
const bodyParser = require("body-parser");


const express = require("express");
const app = express();
const port = 4000;

const session = require("express-session");
const authRoutes = require("./routes/auth-routes");
const mongoose = require("mongoose");
const keys = require("./helpers/keys");
const cors = require("cors");
const cookieParser = require("cookie-parser"); // parse cookie header
const callbackRoute = require("./routes/callback");
const getLikesRoute = require("./routes/getLikes");
const getRtRoute = require("./routes/getRetweets");
const getQuoteRoute = require("./routes/getQuotes");
const getTaskRoute = require("./routes/getTask");
const getReferrerRoute = require("./routes/referrer");
const getTweetRoute = require("./routes/getTweet");


require("dotenv").config();


// connect to mongodb
mongoose.connect(process.env.MONGO_DB, () => {
  console.log("connected to mongo db");
});


app.use(
  bodyParser.json({ limit: "50mb", extended: true, parameterLimit: 50000 })
);
app.use(express.urlencoded({ extended: false, limit: "50mb" }));
app.use(
  bodyParser.urlencoded({
    limit: "50mb",
    extended: true,
    parameterLimit: 50000,
  })
);
app.use(
  cookieSession({
    name: "session",
    keys: [keys.COOKIE_KEY],
    maxAge: 24 * 60 * 60 * 100
  })
);

// parse cookies
app.use(cookieParser());



// set up cors to allow us to accept requests from our client
app.use(
  cors({
    origin: "*",
    optionsSuccessStatus: 200,
    methods: "GET, PUT, POST, PATCH, DELETE, OPTIONS",
    accessAllowOrigin: "*",
    credentials:true
  })
);

// set up routes
app.use("/auth", authRoutes);
app.use("/callback", callbackRoute);
app.use("/task", getTaskRoute);
app.use("/like", getLikesRoute);
app.use("/rt", getRtRoute);
app.use("/quote", getQuoteRoute);
app.use("/referrer", getReferrerRoute);
app.use("/tweet", getTweetRoute);

const authCheck = (req, res, next) => {
  if (!req.user) {
    res.status(401).json({
      authenticated: false,
      message: "user has not been authenticated"
    });
  } else {
    next();
  }
};

// if it's already login, send the profile response,
// otherwise, send a 401 response that the user is not authenticated
// authCheck before navigating to home page
app.get("/", (req, res) => {
  res.status(200).json({
    authenticated: true,
    message: "home",
    user: req.user,
    cookies: req.cookies
  });
});

// connect react to nodejs express server
app.listen(port, () => console.log(`Server is running on port ${port}!`));
