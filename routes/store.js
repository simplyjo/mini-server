const express = require("express");
const router = express.Router();
const Store = require("../models/store");
const User = require("../models/user");
const Merchant = require("../models/merchant");
const cleanBody = require("../middlewares/cleanBody");
const mongoose = require("mongoose");

const cloudinary = require("../utils/cloudinary");
const upload = require("../utils/multer");
const fs = require("fs");
const { customAlphabet: generate } = require("nanoid");

const STORE_ID_LENGTH = 5;

const CHARACTER_SET = "0123456789";

const storeId = generate(CHARACTER_SET, STORE_ID_LENGTH);

router.get("/", cleanBody, async (req, res) => {
  try {

    const stores = await Store.find()
      .sort({ _id: -1 })
   
    if (!stores) {
      return res.status(400).json({
        error: true,
        message: "No Store Found",
      });
    } else {
      return res.status(200).json({
        success: true,
        message: "All store.",
        stores: stores,
  
      });
    }
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: error.message,
    });
  }
});

router.post("/", async (req, res) => {
  try {
    const store = new Store({
      storeName: req.body.storeName,
      storeLocation: req.body.storeLocation,
      category: req.body.category,
      merchantId: req.body.merchantId,
    });

    console.log("formDataStore", store);
    store.storeId = storeId();

    const newStore = await store.save();
    return res.status(200).json({
      success: true,
      message: "Store Created!!",
      store: newStore,
    });
  } catch (error) {
    console.error("signup-error", error);
    return res.json({
      error: true,
      message: "Cannot Create Store",
    });
  }
});
router.get("/merchant/:id", cleanBody, async (req, res) => {
  try {
    const { id } = req.params;
    const stores = await Store.find({ merchantId: id });
    if (!stores) {
      return res.status(400).json({
        error: true,
        message: "No Stores Found",
      });
    } else {
      return res.status(200).json({
        success: true,
        message: "All Merchant stores.",
        stores: stores,
      });
    }
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: error.message,
    });
  }
});

router.patch("/delete/:id", async (req, res) => {
  const { id: _id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(_id))
    return res.status(404).json("No Store with that Id");

  await Store.findByIdAndRemove(_id, {
    new: true,
  });
  return res.status(200).json({
    success: true,
    message: "Store Deleted!!",
  });
});

router.patch("/:id", async (req, res) => {
  const { id } = req.params;
  const { storeName, storeLocation, category } = req.body;

  const updatedStore = await Store.findOneAndUpdate(
    { storeId: id },
    {
      storeName:storeName,
      storeLocation:storeLocation,
      category:category,
    },
    { new: true }
  );

  console.log('updatedStore',updatedStore)

  res.json({
    store: updatedStore,
    success: true,
    message: "Store Successfully Updated",
  });
});
























router.get("/:id", cleanBody, async (req, res) => {
  try {
    const { id } = req.params;
    const store = await Store.findById(id);

    if (!store) {
      return res.status(400).json({
        error: true,
        message: "No Stores Found",
      });
    } else {
      return res.status(200).json({
        success: true,
        message: "All Stores",
        store: store,
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

  const store = req.body;

  if (!mongoose.Types.ObjectId.isValid(_id))
    return res.status(404).json("No DIscount with that Id");

  const updatedPost = await Store.findByIdAndUpdate(_id, store, {
    new: true,
  });

  return res.status(200).json({
    success: true,
    message: "All store.",
    stores: updatedPost,
  });
});

router.patch("/click/:id", async (req, res) => {
  const { id: _id } = req.params;
  const { id, email } = req.body;

  if (!mongoose.Types.ObjectId.isValid(_id))
    return res.status(404).json("No Store with that Id");

  const updatedPost = await Store.findByIdAndUpdate(
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

  const updatedCoupon = await Store.findByIdAndUpdate(
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
    return res.status(404).json("No Store with that Id");

  const updatedCoupon = await Store.findByIdAndUpdate(
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
