
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: String,
  userName: { type: String, required: true },
  twitterId: { type: String, required: true },
  profileImageUrl: String,
  total_points:0,
  task_one:false,
  task_two:false,
  task_three:false,
  task_four:false,
  referrals:{type:[String]},
  referrer:{type:String},
  referralCode:{type:String},
  tweet:false

});

const User = mongoose.model("user", userSchema);

module.exports = User;