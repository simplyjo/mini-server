const express = require("express");
const router = express.Router();
const Receipt = require("../models/receipts");
const Merchant = require("../models/merchant");
const cleanBody = require("../middlewares/cleanBody");
const mongoose = require("mongoose");

router.get("/", cleanBody, async (req, res) => {
  try {
    const { page } = req.query;

    const LIMIT = 9;
    const startIndex = (Number(page) - 1) * LIMIT;
    const total = await Receipt.countDocuments();
    const receipts = await Receipt.find()
      .sort({ _id: -1 })
      .limit(LIMIT)
      .skip(startIndex);

    if (!receipts) {
      return res.status(400).json({
        error: true,
        message: "No Receipt Found",
      });
    } else {
      return res.status(200).json({
        success: true,
        message: "All receipts.",
        receipts: receipts,
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
    const receipt = await Receipt.find({ user: id });

    if (!receipt) {
      return res.status(400).json({
        error: true,
        message: "No Receipts Found",
      });
    } else {
      return res.status(200).json({
        success: true,
        message: "Receipt Found Succesfully.",
        receipt: receipt,
      });
    }
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: error.message,
    });
  }
});
router.get("/merchants/:id", cleanBody, async (req, res) => {
  try {
    const { id } = req.params;
    const { page } = req.query;

    const LIMIT = 9;
    const startIndex = (Number(page) - 1) * LIMIT;
    const total = await Receipt.find({ merchant: id }).countDocuments();
    const receipts = await Receipt.find({ merchant: id })
      .sort({ _id: -1 })
      .limit(LIMIT)
      .skip(startIndex);

    if (!receipts) {
      return res.status(400).json({
        error: true,
        message: "No Receipts Found",
      });
    } else {
      return res.status(200).json({
        success: true,
        message: "All Merchants receipts.",
        receipts: receipts,
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
router.get("/search", async (req, res) => {
  try {
    const { merchant, category, receipt } = req.query;

    res.status(200).json({ data: receipts });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
});
router.patch("/status/:id", async (req, res) => {
  const { id: _id } = req.params;

  const { merchantId, awardedPoint, newMerchantPoint } = req.body;

  if (!mongoose.Types.ObjectId.isValid(_id))
    return res.status(404).json("No Receipt found with that Id");

  await Merchant.findByIdAndUpdate(
    merchantId,
    { points: newMerchantPoint },
    {
      new: true,
    }
  );
  await Receipt.findByIdAndUpdate(
    _id,
    { status: "completed", point: awardedPoint },
    {
      new: true,
    }
  );

  res.json({
    success: true,
    message: "Success!",
  });
});

router.post("/", cleanBody, async (req, res) => {
  try {
    const receipt = new Receipt({
      user: req.body.user,
      merchant: req.body.merchant,
      selectedFiles: req.body.selectedFiles,
    });

    if (!receipt.user || !receipt.merchant || !receipt.selectedFiles) {
      return res.status(201).json({
        error: true,
        message: "Please Add a receipt",
      });
    }

    const newReceipt = await receipt.save();

    return res.status(200).json({
      success: true,
      message: "Receipt is under review",
      receipt: newReceipt,
    });


  } catch (error) {
    console.error("signup-error", error);
    return res.json({
      error: true,
      message: "Cannot Register",
    });
  }
});

module.exports = router;
