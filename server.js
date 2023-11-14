const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const app = express();
// const cardData = require("./helpers/config")


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


const loginRoute = require("./routes/loginauth");
const indexRoute = require("./routes/index");
const authRoutes = require("./routes/auth-routes");
const callbackRoute = require("./routes/callback");
const getLikesRoute = require("./routes/getLikes");
const getRtRoute = require("./routes/getRetweets");
const getQuoteRoute = require("./routes/getQuotes");
const getTaskRoute = require("./routes/getTask");
const getReferrerRoute = require("./routes/referrer");
const getTweetRoute = require("./routes/getTweet");
const walletRoute = require("./routes/wallet");

require("dotenv").config();

var corsOptions = {
  origin: "*",
  optionsSuccessStatus: 200,
  methods: "GET, PUT, POST, PATCH, DELETE, OPTIONS",
  accessAllowOrigin: "*",
};
app.use(cors(corsOptions));

app.use("/login", loginRoute);
app.use("/auth", authRoutes);
app.use("/callback", callbackRoute);
app.use("/task", getTaskRoute);
app.use("/like", getLikesRoute);
app.use("/rt", getRtRoute);
app.use("/quote", getQuoteRoute);
app.use("/referrer", getReferrerRoute);
app.use("/tweet", getTweetRoute);
app.use("/wallet", walletRoute);



app.use("/", indexRoute);
app.use(express.static("client/build"));

app.listen(process.env.PORT || 6000);

mongoose.connect(process.env.MONGO_DB, {}, () => {
  console.log("connected", process.env.PORT);
});

// const connectToMongo = async () => {
//   await mongoose.connect(process.env.MONGO_DB, {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//       useFindAndModify: false,
//   });
//   return mongoose;
// };

// await connectToMongo().then(async() => console.log('connected yeee'));
