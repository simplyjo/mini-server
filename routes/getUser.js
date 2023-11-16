const express = require("express");
const cleanBody = require("../middlewares/cleanBody");
const router = express.Router();
const User = require("../models/user");

const mongoose = require("mongoose");




router.get("/:id", async (req, res) => {
  const { id } = req.params;
 

  const user = await User.findOne({twitterId:id})

  if(user )
 

  return res.status(200).json({
    success: true,
    message: "updated profile",
    user: user,
  });
});


module.exports = router;
