const express = require("express");
const router = express.Router();
const Team = require("../models/team");
const Store = require("../models/store");
const User = require("../models/user");
const Merchant = require("../models/merchant");
const cleanBody = require("../middlewares/cleanBody");
const mongoose = require("mongoose");
const { v4: uuid } = require("uuid");

const cloudinary = require("../utils/cloudinary");
const upload = require("../utils/multer");
const fs = require("fs");
const { customAlphabet: generate } = require("nanoid");
const { sendEmail } = require("../helpers/teamCreation");
const { sendEmailWithRole } = require("../helpers/teamCreationWithRole");

const CHARACTER_SET =
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

const EMAIL_CODE_LENGTH = 8;

const code = generate(CHARACTER_SET, EMAIL_CODE_LENGTH);

const TEAM_ID_LENGTH = 7;

const TEAM_CHARACTER_SET =
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

const teamId = generate(TEAM_CHARACTER_SET, TEAM_ID_LENGTH);

router.post("/", async (req, res) => {
  try {
    const { roleInfo, selectedStore, merchantId } = req.body;
    const { store } = roleInfo[0];

    let team = new Team({
      email: req.body.email,
      role: req.body.role,
      merchantName: req.body.merchantName,
      merchantId: req.body.merchantId,
    });

    console.log("teamretttette", team, roleInfo, store, selectedStore);


    const existingUser = await Team.findOne({ email: team.email });

    if (existingUser) {
      return res.status(201).json({
        message: "This Email is already registered",
        error: true,
      });
    }
    let newCode = code();

    let expiry = Date.now() + 60 * 1000 * 60; //60 mins in ms

    let sendCode;
    if (team.role) {
      sendCode = await sendEmailWithRole(team, store, newCode);
    } else {
      sendCode = await sendEmail(team, newCode);
    }

    if (sendCode.error) {
      return res.status(500).json({
        error: true,
        message: "Couldn't send verification email.",
      });
    }
    if (selectedStore) {
      team.stores = [...roleInfo];
    team.status = true;

    }

    team.passwordText = newCode;
    const hash = await Team.hashPassword(newCode);

    const id = uuid(); //Generate unique id for the user.
    let teamCode = teamId();

    team.teamId =  `${team.merchantName.split(' ')[0]}-team-${teamCode}`;
    team.password = hash;
    console.log("formDataStore", team);
    const newTeam = await team.save();
    if (selectedStore) {
   await Store.findOneAndUpdate(
      { storeId: store[0].storeId },
      { $push: { admins: mongoose.Types.ObjectId(newTeam._id) } }
    );
   }

  
    return res.status(200).json({
      success: true,
      message: "Team Member Added Successfully!!",
      team: newTeam,
    });
  } catch (error) {
    console.error("signup-error", error);
    return res.json({
      error: true,
      message: "Cannot Create Team",
    });
  }
});
router.get("/merchant/:id", cleanBody, async (req, res) => {
  try {
    const { id } = req.params;
    const teams = await Team.find({ merchantId: id });
    if (!teams) {
      return res.status(400).json({
        error: true,
        message: "No Teams Found",
      });
    } else {
      return res.status(200).json({
        success: true,
        message: "All Merchant teams.",
        teams: teams,
      });
    }
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: error.message,
    });
  }
});

router.get("/", cleanBody, async (req, res) => {
  try {
    const { page } = req.query;

    const LIMIT = 9;
    const startIndex = (Number(page) - 1) * LIMIT;
    const total = await Team.countDocuments();

    const teams = await Team.find()
      .sort({ _id: -1 })
      .limit(LIMIT)
      .skip(startIndex);
    teams.merchant = mongoose.Types.ObjectId(teams.merchantId);
    if (!teams) {
      return res.status(400).json({
        error: true,
        message: "No Team Found",
      });
    } else {
      return res.status(200).json({
        success: true,
        message: "All team.",
        teams: teams,
        total: total,
        currentPage: Number(page),
        numberOfPages: Math.ceil(total / LIMIT),
      });
    }
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: error.message,
    });
  }
});
router.get("/:id", cleanBody, async (req, res) => {
  try {
    const { id } = req.params;
    const team = await Team.findById(id);

    if (!team) {
      return res.status(400).json({
        error: true,
        message: "No Teams Found",
      });
    } else {
      return res.status(200).json({
        success: true,
        message: "All Teams",
        team: team,
      });
    }
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: error.message,
    });
  }
});

router.patch("/:id", async (req, res) => {
  const { id: _id } = req.params;

  const team = req.body;

  if (!mongoose.Types.ObjectId.isValid(_id))
    return res.status(404).json("No DIscount with that Id");

  const updatedPost = await Team.findByIdAndUpdate(_id, team, {
    new: true,
  });

  return res.status(200).json({
    success: true,
    message: "All team.",
    teams: updatedPost,
  });
});
router.patch("/delete/:id", async (req, res) => {
  const { id: _id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(_id))
    return res.status(404).json("No Team with that Id");

  await Team.findByIdAndRemove(_id, {
    new: true,
  });
  return res.status(200).json({
    success: true,
    message: "Team Deleted!!",
  });
});
router.patch("/click/:id", async (req, res) => {
  const { id: _id } = req.params;
  const { id, email } = req.body;

  if (!mongoose.Types.ObjectId.isValid(_id))
    return res.status(404).json("No Team with that Id");

  const updatedPost = await Team.findByIdAndUpdate(
    _id,
    {
      $push: { clicks: { email: email, userId: id, clickedDate: Date.now() } },
    },
    {
      new: true,
    }
  );

  res.json(updatedPost);
});
router.patch("/status/:id", async (req, res) => {
  const { id: _id } = req.params;
  const { status } = req.body;

  if (!mongoose.Types.ObjectId.isValid(_id))
    return res.status(404).json("No Discount with that Id");

  const updatedCoupon = await Team.findByIdAndUpdate(
    _id,
    { active: status },
    {
      new: true,
    }
  );

  res.json(updatedCoupon);
});

router.patch("/campaignImages/:id", async (req, res) => {
  const { id: _id } = req.params;

  const { selectedFiles } = req.body;

  if (!mongoose.Types.ObjectId.isValid(_id))
    return res.status(404).json("No Team with that Id");

  const updatedCoupon = await Team.findByIdAndUpdate(
    _id,
    { campaignFiles: selectedFiles },
    {
      new: true,
    }
  );

  return res.status(200).json({
    success: true,
    message: "Campaign Files Added",
  });
});

module.exports = router;
