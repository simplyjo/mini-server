const express = require("express");
const router = express.Router();
const User = require("../models/user");
const { validateToken } = require("../middlewares/validateToken");

router.get("/logout", validateToken, async (req, res) => {
  try {
    const { id } = req.decoded;

    let user = await User.findOne({ userId: id });

    user.accessToken = "";

    await user.save();

    return res.redirect("/login");
  } catch (error) {
    console.error("user-logout-error", error);
    return res.stat(500).json({
      error: true,
      message: error.message,
    });
  }
});

module.exports = router;
