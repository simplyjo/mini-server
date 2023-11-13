const express = require("express");
const router = express.Router();
const Product = require("../models/product");
const User = require("../models/user");
const Merchant = require("../models/merchant");
const cleanBody = require("../middlewares/cleanBody");
const mongoose = require("mongoose");
const { customAlphabet: generate } = require("nanoid");

const cloudinary = require("../utils/cloudinary");
const upload = require("../utils/multer");
const fs = require("fs");

const PRODUCT_ID_LENGTH = 7;

const PRODUCT_CHARACTER_SET =
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

const productId = generate(PRODUCT_CHARACTER_SET, PRODUCT_ID_LENGTH);

router.get("/", cleanBody, async (req, res) => {
  try {

    const { page } = req.query;

    const LIMIT = 9;
    const startIndex = (Number(page) - 1) * LIMIT;
    const total = await Product.countDocuments();

    const products = await Product.find()
      .sort({ _id: -1 })
      .limit(LIMIT)
      .skip(startIndex);

    if (!products) {
      return res.status(400).json({
        error: true,
        message: "No Product Found",
      });
    } else {
      return res.status(200).json({
        success: true,
        message: "All product.",
        products: products,
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

router.post("/", upload.array("image", 5), async (req, res) => {
  try {
    const uploader = async (path,folder) => await cloudinary.uploads(path,folder, "Images");
    let urls = [];
    console.log(req.files)

    if (req.method === "POST") {
      const files = req.files;
    console.log('files', req)

      for (const file of files) {
        const { path } = file;
      let folder = 'Products'
        const newPath = await uploader(path, folder);

        let newObject = {
          secure_url: newPath.secure_url,
          cloudinary_id: newPath.public_id,
        };
        urls.push(newObject);
        console.log("a", urls);

        fs.unlinkSync(path);
      }
    }

    const product = new Product({
      campaignFiles: urls,
      productName: req.body.productName,
      description: req.body.description,
      category: req.body.category,
      ProductId: req.body.ProductId,
      adminId: req.body.adminId,
      merchantId: req.body.merchantId,
      price: req.body.price,
      campaignType: req.body.campaignType,
      stockQty: req.body.qty,
      storeLocation: req.body.address,
      storeName: req.body.merchantName,
    });

    let productCode = productId();

    product.productId =  `product-${productCode}`;
    // product.point = (Number(product.product) * Number(product.price)) / 2000;

    const newProduct = await product.save();
    return res.status(200).json({
      success: true,
      message: "New Product Created!!",
      product: newProduct,
    });

    // return res.redirect("/")
  } catch (error) {
    console.error("signup-error", error);
    return res.json({
      error: true,
      message: "Cannot Create Product",
    });
  }
});

router.get("/:id", cleanBody, async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);

    if (!product) {
      return res.status(400).json({
        error: true,
        message: "No Discounts Found",
      });
    } else {
      return res.status(200).json({
        success: true,
        message: "Product Found Succesfully.",
        product: product,
      });
    }
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: error.message,
    });
  }
});



router.get("/merchant/:id", cleanBody, async (req, res) => {
  try {
    const { id } = req.params;
    const products = await Product.find({ merchantId: id });
    if (!products) {
      return res.status(400).json({
        error: true,
        message: "No products Found",
      });
    } else {
      return res.status(200).json({
        success: true,
        message: "All Merchant products.",
        products: products,
      });
    }
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: error.message,
    });
  }
});

router.patch("/:id", upload.array("image", 5), async (req, res) => {
  const { id: _id } = req.params;
  
  let urls = [];

  if(req.files){
    const uploader = async (path, folder) => await cloudinary.uploads(path,folder, "Images");
    console.log(req.files);

    if (req.method === "PATCH") {
      const files = req.files;
      console.log("files", req);

      for (const file of files) {
        const { path } = file;
       let folder = 'Products'

        const newPath = await uploader(path,folder);

        let newObject = {
          secure_url: newPath.secure_url,
          cloudinary_id: newPath.public_id,
        };
        urls.push(newObject);
        console.log("a", urls);

        fs.unlinkSync(path);
      }
    }
  }
  console.log('urls', urls)

  const product = req.body;

  if (!mongoose.Types.ObjectId.isValid(_id))
    return res.status(404).json("No DIscount with that Id");

  // const updatedPost = await Coupon.findByIdAndUpdate(_id, coupon, {
  //   new: true,
  // });
let updatedPost
  if(urls) {
   updatedPost = await Product.findByIdAndUpdate(
      _id,
      {
        ...product,
        $push: { campaignFiles: urls },
      },
      {
        new: true,
      }
    );
  } else {
   updatedPost = await Product.findByIdAndUpdate(
      _id,
      {
        ...product,
      },
      {
        new: true,
      }
    );
    console.log('nourls',"----------------------------------nourls----------------")

  }


  return res.status(200).json({
    success: true,
    message: "updated!.",
    products: updatedPost,
  });
});

router.patch("/delete/:id", async (req, res) => {
  const { id: _id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(_id))
    return res.status(404).json("No Product with that Id");

  await Product.findByIdAndRemove(_id, {
    new: true,
  });
  return res.status(200).json({
    success: true,
    message: "Product Deleted!!",
  });
});










router.get("/:id", cleanBody, async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);

    if (!product) {
      return res.status(400).json({
        error: true,
        message: "No Discounts Found",
      });
    } else {
      return res.status(200).json({
        success: true,
        message: "Product Found Succesfully.",
        product: product,
      });
    }
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: error.message,
    });
  }
});


router.patch("/status/:id", async (req, res) => {
  const { id: _id } = req.params;
  const { status } = req.body;

  if (!mongoose.Types.ObjectId.isValid(_id))
    return res.status(404).json("No Product with that Id");

    console.log("status",status)
  const updatedPost = await Product.findByIdAndUpdate(
    _id,
    { active: status },
    {
      new: true,
    }
  );

  res.json(updatedPost);
});
router.patch("/delete/:id", async (req, res) => {
  const { id: _id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(_id))
    return res.status(404).json("No Product with that Id");

  const updatedPost = await Product.findByIdAndDelete(_id, {
    new: true,
  });

  return res.status(200).json({
    success: true,
    message: "Campaign Deleted!!",
  });
});



router.patch("/campaignImages/:id", async (req, res) => {
  const { id: _id } = req.params;

  const { selectedFiles } = req.body;

  if (!mongoose.Types.ObjectId.isValid(_id))
    return res.status(404).json("No Product with that Id");

  const updatedDiscount = await Product.findByIdAndUpdate(
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
