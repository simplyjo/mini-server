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

const pdf = require("html-pdf");
const pdfTemplate = require("./documents");
const loginRoute = require("./routes/loginauth");
const callbackRoute = require("./routes/callback");
const indexRoute = require("./routes/index");
const registerRoute = require("./routes/register");
const discountRoute = require("./routes/discounts");
const couponRoute = require("./routes/coupons");
const discountSearchRoute = require("./routes/discountsSearch");
const activateRoute = require("./routes/activate");
const forgotRoute = require("./routes/forgot");
const referredRoute = require("./routes/referred");
const adminRoute = require("./routes/admin");
const logoutRoute = require("./routes/logout");
const userRoute = require("./routes/user");
const resetRoute = require("./routes/reset");
const receiptRoute = require("./routes/receipts");
const merchantRoute = require("./routes/merchant");
const orderRoute = require("./routes/order");
const buypointRoute = require("./routes/buypoint");
const cardRoute = require("./routes/card");
const cardProcessingRoute = require("./routes/cardprocessing");
const agentRoute = require("./routes/agent");
const sudoRoute = require("./routes/sudocustomer");
const rewardRoute = require("./routes/reward");
const testRoute = require("./routes/test");
const ticketRoute = require("./routes/tickets");
const storeRoute = require("./routes/store");
const teamRoute = require("./routes/team");
const productRoute = require("./routes/products");
const productOrderRoute = require("./routes/productOrders");


require("dotenv").config();

var corsOptions = {
  origin: "*",
  optionsSuccessStatus: 200,
  methods: "GET, PUT, POST, PATCH, DELETE, OPTIONS",
  accessAllowOrigin: "*",
};
app.use(cors(corsOptions));

app.use("/login", loginRoute);
app.use("/callback", callbackRoute);
app.use("/productOrders", productOrderRoute);
app.use("/products", productRoute);
app.use("/team", teamRoute);
app.use("/store", storeRoute);
app.use("/ticket", ticketRoute);
app.use("/test", testRoute);
app.use("/register", registerRoute);
app.use("/discountsSearch", discountSearchRoute);
app.use("/discounts", discountRoute);
app.use("/coupons", couponRoute);
app.use("/receipts", receiptRoute);
app.use("/merchant", merchantRoute);
app.use("/admin", adminRoute);
app.use("/forgot", forgotRoute);
app.use("/activate", activateRoute);
app.use("/referred", referredRoute);
app.use("/logout", logoutRoute);
app.use("/user", userRoute);
app.use("/reset", resetRoute);
app.use("/order", orderRoute);
app.use("/card", cardRoute);
app.use("/cardprocessing", cardProcessingRoute);
app.use("/agent", agentRoute);
app.use("/buypoint", buypointRoute);
app.use("/customers", sudoRoute);
app.use("/rewards", rewardRoute);

app.get("/fetch-pdf", (req, res) => {
  res.sendFile(`${__dirname}/result.pdf`);
});
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
