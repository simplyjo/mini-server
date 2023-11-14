
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  name:{
    type: String, // or whatever
   
  },
  userName: { type: String,unique: true, required: true },
  twitterId: { type: String, unique: true, required: true },
  profileImageUrl: String,
  total_points:0,
  task_one:false,
  task_two:false,
  task_three:false,
  task_four:false,
  referrals:{type:[String]},
  referrer:{type:String},
  referralCode:{type:String},
  tweet:false,
  wallet:String,
  walletStatus:false

});

const User = mongoose.model("user", userSchema);

module.exports = User;