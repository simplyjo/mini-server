const express = require("express");
const router = express.Router();
const Ticket = require("../models/ticket");
const User = require("../models/user");
const Merchant = require("../models/merchant");
const cleanBody = require("../middlewares/cleanBody");
const mongoose = require("mongoose");

const cloudinary = require("../utils/cloudinary");
const upload = require("../utils/multer");
const fs = require("fs");



router.post("/", async (req, res) => {
  try {

    const ticket = new Ticket({
  
      name: req.body.name,
      email: req.body.email,
      services: req.body.services,
      priority: req.body.priority,
      subject: req.body.subject,
      message: req.body.message,
      merchantId: req.body.merchantId,
    });
    const code = Math.floor(Math.random() * 1000000 + 1);

    ticket.ticketNo = `TN-${Date.now()}-${ticket.name.split(' ')[0]}-${code}`;



    const newTicket = await ticket.save();
    return res.status(200).json({
      success: true,
      message: "Ticket Created!!",
      ticket: newTicket,
    });
  } catch (error) {
    console.error("signup-error", error);
    return res.json({
      error: true,
      message: "Cannot Register",
    });
  }
});
router.get("/merchant/:id", cleanBody, async (req, res) => {
  try {
    const { id } = req.params;
    const tickets = await Ticket.find({ merchantId: id });


    if (!tickets) {
      return res.status(400).json({
        error: true,
        message: "No Tickets Found",
      });
    } else {
      return res.status(200).json({
        success: true,
        message: "All ticket.",
        tickets: tickets,
       
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
    const total = await Ticket.countDocuments();

    const tickets = await Ticket.find()
      .sort({ _id: -1 })
      .limit(LIMIT)
      .skip(startIndex);
    tickets.merchant = mongoose.Types.ObjectId(tickets.merchantId);
    if (!tickets) {
      return res.status(400).json({
        error: true,
        message: "No Ticket Found",
      });
    } else {
      return res.status(200).json({
        success: true,
        message: "All ticket.",
        tickets: tickets,
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
    const ticket = await Ticket.findById(id);

    if (!ticket) {
      return res.status(400).json({
        error: true,
        message: "No Tickets Found",
      });
    } else {
      return res.status(200).json({
        success: true,
        message: "Ticket Found Succesfully.",
        ticket: ticket,
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

  const ticket = req.body;

  if (!mongoose.Types.ObjectId.isValid(_id))
    return res.status(404).json("No DIscount with that Id");

  const updatedPost = await Ticket.findByIdAndUpdate(_id, ticket, {
    new: true,
  });

  return res.status(200).json({
    success: true,
    message: "All ticket.",
    tickets: updatedPost,
  });
});
router.patch("/delete/:id", async (req, res) => {
  const { id: _id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(_id))
    return res.status(404).json("No Ticket with that Id");

  await Ticket.findByIdAndRemove(_id, {
    new: true,
  });
  return res.status(200).json({
    success: true,
    message: "Campaign Deleted!!",
  });
});
router.patch("/click/:id", async (req, res) => {
  const { id: _id } = req.params;
  const { id, email } = req.body;

  if (!mongoose.Types.ObjectId.isValid(_id))
    return res.status(404).json("No Ticket with that Id");

  const updatedPost = await Ticket.findByIdAndUpdate(
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

  const updatedCoupon = await Ticket.findByIdAndUpdate(
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
    return res.status(404).json("No Ticket with that Id");

  const updatedCoupon = await Ticket.findByIdAndUpdate(
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
