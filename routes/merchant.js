const express = require("express");
const router = express.Router();
const Merchant = require("../models/merchant");
const cleanBody = require("../middlewares/cleanBody");
const Discount = require("../models/discount");
const BuyPoint = require("../models/buypoint");
const Coupon = require("../models/coupon");
const MerchantReceipt = require("../models/merchantReceipt");
const { v4: uuid } = require("uuid");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const Order = require("../models/order");
const { sendEmail } = require("../helpers/mailerMerchant");
const Reward = require("../models/reward");
const reward = require("../models/reward");


const cloudinary = require("../utils/cloudinary");
const upload = require("../utils/multer");
const fs = require("fs");

router.get("/", cleanBody, async (req, res) => {
  try {
    const merchant = await Merchant.find().sort({ _id: -1 });

    if (!merchant) {
      return res.status(400).json({
        error: true,

        message: "No Merchant Found",
      });
    } else {
      return res.status(200).json({
        success: true,
        message: "All merchants.",
        merchant: merchant,
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
    // await Merchant.updateMany({}, [{ $set: { passwordText: '' } }]);

    console.log('merchant', id)

    const merchant = await Merchant.findById(id);

    if (!merchant) {
      return res.status(400).json({
        error: true,

        message: "No Merchant Found",
      });
    } else {
      return res.status(200).json({
        success: true,
        message: "merchants.",
        merchant: merchant,
      });
    }
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: error.message,
    });
  }
});

router.get("/discounts/:id", cleanBody, async (req, res) => {
  try {


    const { id } = req.params;
    const discounts = await Discount.find({ merchant: id });
    const statusArr = await Discount.find(
      { merchant: id },
      { _id: 0, active: true, _id: true }
    );

    if (!discounts) {
      return res.status(400).json({
        error: true,
        message: "No Discounts Found",
      });
    } else {
      return res.status(200).json({
        success: true,
        message: "All Merchant Discounts.",
        discounts: discounts,
        statusArr: statusArr,
      });
    }
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: error.message,
    });
  }
});
router.get("/purchase/:id", cleanBody, async (req, res) => {
  try {

    // await Merchant.updateMany({}, { $set: { customers:[]} });

    const { id } = req.params;
    
    const pointsHistory = await BuyPoint.find({ merchantId: id }).sort({ _id: -1 })
    ;


    if (!pointsHistory) {
      return res.status(400).json({
        error: true,
        message: "No Discounts Found",
      });
    } else {
      return res.status(200).json({
        success: true,
        message: "Merchant Points History.",
        pointsHistory: pointsHistory,
     
      });
    }
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: error.message,
    });
  }
});
router.get("/coupons/:id", cleanBody, async (req, res) => {
  try {
    const { id } = req.params;
    const coupons = await Coupon.find({ merchant: id });
    const statusArr = await Coupon.find(
      { merchant: id },
      { _id: 0, active: true, _id: true }
    );

    const couponByMonth = await Coupon.aggregate([
      { $match: { merchant: id } },
      {
        $project: {
          _id: 0,
          campaignMonth: { $month: "$startDate" },
          campaignYear: { $year: "$startDate" },
          clicks: { $size: "$clicks" },
        },
      },

      {
        $group: {
          _id: "$campaignMonth",
          totalCampaign: { $sum: 1 },
          clicks: { $sum: "$clicks" },
        },
      },
    ]);
    const couponByID = await Coupon.aggregate([
      { $match: { merchant: id } },
      {
        $project: {
          _id: 0,
          campaignID: "$_id",
          campaignMonth: { $month: "$startDate" },
          clicks: { $size: "$clicks" },
        },
      },

      {
        $group: {
          _id: "$campaignID",
          month: { $sum: "$campaignMonth" },
          totalCampaign: { $sum: 1 },
          clicks: { $sum: "$clicks" },
        },
      },
    ]);

    if (!coupons) {
      return res.status(400).json({
        error: true,
        message: "No Coupons Found",
      });
    } else {
      return res.status(200).json({
        success: true,
        message: "All Merchant Coupons.",
        coupons: coupons,
        couponStatusArr: statusArr,
        couponByMonth: couponByMonth,
        couponByID: couponByID,
      });
    }
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: error.message,
    });
  }
});
router.get("/rewards/:id", cleanBody, async (req, res) => {
  try {
    const { id } = req.params;
    const rewards = await Reward.find({ merchantId: id }).sort({ _id: -1 });


    // const couponByMonth = await Coupon.aggregate([
    //   { $match: { merchant: id } },
    //   {
    //     $project: {
    //       _id: 0,
    //       campaignMonth: { $month: "$startDate" },
    //       campaignYear: { $year: "$startDate" },
    //       clicks: { $size: "$clicks" },
    //     },
    //   },

    //   {
    //     $group: {
    //       _id: "$campaignMonth",
    //       totalCampaign: { $sum: 1 },
    //       clicks: { $sum: "$clicks" },
    //     },
    //   },
    // ]);
    // const couponByID = await Coupon.aggregate([
    //   { $match: { merchant: id } },
    //   {
    //     $project: {
    //       _id: 0,
    //       campaignID: "$_id",
    //       campaignMonth: { $month: "$startDate" },
    //       clicks: { $size: "$clicks" },
    //     },
    //   },

    //   {
    //     $group: {
    //       _id: "$campaignID",
    //       month: { $sum: "$campaignMonth" },
    //       totalCampaign: { $sum: 1 },
    //       clicks: { $sum: "$clicks" },
    //     },
    //   },
    // ]);


    const uniqueRewards = await Reward.aggregate( [
      {
        $match : { "merchantId": id }
      },
      { $group : { _id : "$cardNo" } } ] )

    console.log('rewaerds', uniqueRewards)

 

      return res.status(200).json({
        success: true,
        message: "All Merchant Rewards.",
        rewards: rewards,
        uniqueCardNo: uniqueRewards
      });
    
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: error.message,
    });
  }
});
router.get("/merchantReceipts/:id", cleanBody, async (req, res) => {
  try {

    // await Merchant.updateMany({}, { $set: { emailToken:'', emailTokenExpires:''} });

    const { id } = req.params;
    const merchantReceipt = await MerchantReceipt.find({ merchant: id });
 

    if (!merchantReceipt) {
      return res.status(400).json({
        error: true,
        message: "No Receipt Found",
      });
    } else {
      return res.status(200).json({
        success: true,
        message: "All Merchant Receipt.",
        merchantReceipts: merchantReceipt,
      });
    }
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: error.message,
    });
  }
});

router.get("/orders/:id", cleanBody, async (req, res) => {
  try {
    const { page } = req.query;
    const { id } = req.params;

    const LIMIT = 9;
    const startIndex = (Number(page) - 1) * LIMIT;
    const total = await Order.countDocuments();

    const orders = await Order.aggregate([
      {
        $match: {
          "order.merchant": {
            $in: [id],
          },
        },
      },
      {
        $addFields: {
          order: {
            $filter: {
              input: "$order",
              cond: {
                $in: ["$$this.merchant", [id]],
              },
            },
          },
        },
      },
    ])
      .sort({ _id: -1 })
      .limit(LIMIT)
      .skip(startIndex);

    const totalSale = await Order.aggregate([
      {
        $match: {
          "order.merchant": {
            $in: [id],
          },
        },
      },
      {
        $addFields: {
          order: {
            $filter: {
              input: "$order",
              cond: {
                $in: ["$$this.merchant", [id]],
              },
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          campaignMonth: { $month: "$createdAt" },
          campaignWeek: { $week: "$createdAt" },
          campaignYear: { $year: "$createdAt" },
          totalSale: { $sum: "$order.orderQty" },
        },
      },
      {
        $group: {
          _id: "$campaignMonth",
          totalSale: { $sum: "$totalSale" },
        },
      },
    ])
      .sort({ _id: -1 })
      .limit(LIMIT)
      .skip(startIndex);

    if (!orders) {
      return res.status(400).json({
        error: true,
        message: "No Order Found",
      });
    } else {
      return res.status(200).json({
        success: true,
        orders: orders,
        total: total,
        currentPage: Number(page),
        numberOfPages: Math.ceil(total / LIMIT),
        totalSale: totalSale,
      });
    }
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: error.message,
    });
  }
});

// router.post("/", cleanBody, async (req, res) => {
//   try {
//     // const result = merchantSchema.validate(req.body);

//     const { email } = req.body;

//     const merchant = await Merchant.findOne({ email: email });

//     if (merchant) {
//       return res.json({
//         success: true,
//         msg: "merchant already exist",
//       });
//     }

//     const newMerchant = new Merchant({
//       title: req.body.title,
//       description: req.body.description,
//       merchant: req.body.merchant,
//       price: req.body.price,
//       point: req.body.point,
//       merchant: req.body.merchant,
//     });

//     saveCover(newMerchant, req.body.cover);

//     const SavedMerchant = await newMerchant.save();
//     return res.status(200).json({
//       success: true,
//       message: "Registration Success",
//       merchant: savedMerchant,
//     });

//     // return res.redirect("/")
//   } catch (error) {
//     console.error("signup-error", error);
//     return res.json({
//       error: true,
//       message: "Cannot Register",
//     });
//     // return res.status(500).json({
//     //   error: true,
//     //   message: "Cannot Register",
//     // });
//   }
// });

router.post("/signup", cleanBody, async (req, res) => {
  try {
    const merchant = new Merchant({
      email: req.body.email,
      password: req.body.password,
      phone: req.body.phone,
      merchantName: req.body.merchantName,
      address: req.body.address,
      category: req.body.category,
      discount: req.body.discount,
      description: req.body.description,
    });
console.log("merchant",merchant,"req", req.body)

  
    const existingMerchant = await Merchant.findOne({ email: merchant.email });

    if (existingMerchant) {
      return res.json({
        error:true,
        message: "This Email is already in use ",
      });
    } 

    

    // check if password is entered correctly
    const check = merchant.password === req.body.confirmPassword;

    if (!check) {
      return res.status(400).json({
        error: true,
        message: "Password does not match",
      });
    }

    const hashedpassword = await Merchant.hashPassword(merchant.password);

    merchant.password = hashedpassword;
    merchant.passwordText = merchant.password;

    const id = uuid(); //Generate unique id for the merchant.

    merchant.merchantId = id;

    // let code = Math.floor(1000000 + Math.random() * 900000); // Generate code for sending email

    // let expiry = Date.now() + 60 * 1000 * 15; //15 mins in ms

    // const sendCode = await sendEmail(merchant.email, code);
    let code = Math.floor(1000000 + Math.random() * 900000); // Generate code for sending email

    let expiry = Date.now() + 60 * 1000 * 15; //15 mins in ms

    const sendCode = await sendEmail(merchant.email, code);

    if (sendCode.error) {
      return res.status(500).json({
        error: true,
        message: "Couldn't send verification email.",
      });
    }
    merchant.emailToken = code;

    const newMerchant = new Merchant(merchant);
    await newMerchant.save();
    const token = jwt.sign(
      { email: merchant.email, id: newMerchant._id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    return res.status(200).json({
      success: true,
      message: "Check Your Mail For Further Instruction",
      merchant: newMerchant,
      token: token,
    });
  } catch (error) {
    console.log("error",error.response)
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user email exist

    const merchant = await Merchant.findOne({ email: email });

    if (!merchant) {
      return res.status(201).json({
        error: true,
        message: "This Email does not exist",
      });
    }

    //3. Verify the password is valid
    const isValid = await Merchant.comparePasswords(
      password,
      merchant.password
    );

    if (!isValid) {
      return res.status(201).json({
        error: true,
        message: "Invalid credentials",
      });
    }

    const token = jwt.sign(
      { email: merchant.email, id: merchant._id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

  await Merchant.findOneAndUpdate({email},{passwordText:password}, {
      new: true,
    });
  
    return res.status(200).json({
      success: true,
      message: "Login Successful",
      merchant: merchant,
      token,
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: "Enter Valid Details",
    });
  }
});


router.post("/receipts", upload.array("image", 5), async (req, res) => {
  try {
    const uploader = async (path, folder) => await cloudinary.uploads(path,folder, "Images");
    let urls = [];
    console.log(req.files);

 
    if (req.method === "POST") {
      const files = req.files;
      console.log("files", req);

      for (const file of files) {
        const { path } = file;
       let folder = 'ReceiptCampaign'

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

    const merchantReceipt = new MerchantReceipt({
      campaignFiles: urls,
      title: req.body.title,
      description: req.body.description,
      categories: req.body.categories.split(','),
      point: req.body.point,
      merchant: req.body.merchant,
      campaignType: req.body.campaignType,
      merchantRef: req.body.merchant,
      selectedFiles: req.body.selectedFiles,
      startDate: req.body.startDate,
      endDate: req.body.endDate,
      merchantName: req.body.merchantName,
    });
    const code = Math.floor(Math.random() * 1000000 + 1);

    merchantReceipt.code = `WD-${merchantReceipt.title.split(' ')[0]}-${merchantReceipt.point}WP`;


    const newMerchantReceipt = await merchantReceipt.save();
    return res.status(200).json({
      success: true,
      message: "Receipt Campaign Created!!",
      merchantReceipts: newMerchantReceipt,
    });;
 
  } catch (error) {
    console.error("signup-error", error);
    return res.json({
      error: true,
      message: "Cannot Register",
    });
  }
});

router.patch("/verify", async (req, res) => {
  const { code, email } = req.query;

  if (!email || !code) {
    return res.json({
      error: true,
      status: 400,
      message: "Please make a valid request",
    });
  }

  const merchant = await Merchant.findOne({
    email: email,
    emailToken: code,
    emailTokenExpires: { $gt: Date.now() },
  });
  if (!merchant) {
    return res.status(201).json({
      error: true,
      message: "Invalid Details",
    });
  } else {
    if (merchant.active)
      return res.send({
        success: true,
        message: "Account already activated",
        status: 400,
      });

    merchant.emailToken = "";
    merchant.emailTokenExpires = null;
    merchant.active = true;
    merchant.points = 25000
  }

  await merchant.save();

  return res.status(200).json({
    success: true,
    message: "Account activated.",
    merchant: merchant,
  });
});
router.patch("/:id", async (req, res) => {
  const { id: _id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(_id))
    return res.status(404).json("No Merchant with that Id");

  const updatedMerchant = await Merchant.findByIdAndUpdate(_id, {
    active: true,
  });

  res.json(updatedMerchant);
});
router.patch("/otherDetails/:id", async (req, res) => {
  const { id: _id } = req.params;
  const otherDetails = req.body;
  // await Merchant.updateMany({}, [{ $set: { otherDetails: [] } }]);

  if (!mongoose.Types.ObjectId.isValid(_id))
    return res.status(404).json("No Merchant with that Id");

  const updatedMerchant = await Merchant.findByIdAndUpdate(_id, {
    otherDetails: otherDetails
  }, { new: true,});

  res.json({ merchant: updatedMerchant , success: true,
    message: "Merchant Succesfully Updated"});
});
router.patch("/delete/:id", async (req, res) => {
  const { id: _id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(_id))
    return res.status(404).json("No Discount with that Id");

  await Merchant.findByIdAndRemove(_id, {
    new: true,
  });

  return res.status(200).json({
    success: true,
    message: "Merchant Succesfully Deleted",
  });
});

router.patch("/receipts/:id", upload.array("image", 5), async (req, res) => {
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
       let folder = 'ReceiptCampaign'

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

  const receipt = req.body;

  if (!mongoose.Types.ObjectId.isValid(_id))
    return res.status(404).json("No Receipt with that Id");

  // const updatedPost = await Coupon.findByIdAndUpdate(_id, coupon, {
  //   new: true,
  // });
let updatedPost
  if(urls) {
   updatedPost = await MerchantReceipt.findByIdAndUpdate(
      _id,
      {
        ...receipt,
        categories:MerchantReceipt.categories.split(','),

        $push: { campaignFiles: urls },
      },
      {
        new: true,
      }
    );
  } else {
   updatedPost = await MerchantReceipt.findByIdAndUpdate(
      _id,
      {
        ...receipt,
        categories:MerchantReceipt.categories.split(','),

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
    receipts: updatedPost,
  });
});
router.patch("/receipts/campaignImages/:id", async (req, res) => {
  const { id: _id } = req.params;

  const { selectedFiles } = req.body;

  if (!mongoose.Types.ObjectId.isValid(_id))
    return res.status(404).json("No Receipt with that Id");

  const updatedMerchantReceipt = await MerchantReceipt.findByIdAndUpdate(
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
router.patch("/receipts/status/:id", async (req, res) => {
  const { id: _id } = req.params;
  const { status } = req.body;

  if (!mongoose.Types.ObjectId.isValid(_id))
    return res.status(404).json("No Receipts with that Id");

  const updatedReceipt = await MerchantReceipt.findByIdAndUpdate(
    _id,
    { active: status },
    {
      new: true,
    }
  );

  res.json(updatedReceipt);
});
router.patch("/receipts/delete/:id", async (req, res) => {
  const { id: _id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(_id))
    return res.status(404).json("No Discount with that Id");

  const updatedReceipt = await MerchantReceipt.findByIdAndDelete(_id, {
    new: true,
  });

  return res.status(200).json({
    success: true,
    message: "Campaign Deleted!!",
  });
});
module.exports = router;
