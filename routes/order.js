const express = require("express");
const router = express.Router();
const Order = require("../models/order");
const Merchant = require("../models/merchant");
const cleanBody = require("../middlewares/cleanBody");
const User = require("../models/user");
const mongoose = require("mongoose");
const { sendEmail } = require("../helpers/voucherMailer");
const ObjectId = require("mongodb").ObjectId;

router.post("/", cleanBody, async (req, res) => {
  try {
    let { id, amount_paid_in_point, new_user_point_balance, email, order } =
      req.body;
    console.log("id", id, req.body);
 
    let merchantIDs = [];
    await order.map((order) => merchantIDs.push(order.merchant));

    let oids = [];
    await merchantIDs.forEach(function (item) {
      oids.push(ObjectId(item));
    });
    // customers : { $ne: id },
    const merch = await Merchant.updateMany({
 
    _id: { $in: oids},
    },
    {$push: { "customers": {id:id, createdAt:Date.now()} }}
    );

    console.log("merch", oids, merch, id);

    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(404).json("No User with that Id");

    const updatedUser = await User.findByIdAndUpdate(
      id,
      {
        totalPoint: 12.5,
        point: 12.5,
        redeemDate: Date.now(),
      },
      {
        new: true,
      }
    );
    const orderSaved = new Order(req.body);

    let total = await Order.countDocuments();
    total = total + 1;
    orderSaved.createdAt = Date.now();
    orderSaved.order_ref = `WAZODEAL-ORDER-${total}`;
    orderSaved.userId = id;

    const newOrder = await orderSaved.save();
    return res.status(200).json({
      success: true,
      message: "Order submitted Successfully",
      Order: newOrder,
      user: id,
    });
  } catch (error) {
    console.error("order-error", error);
    return res.json({
      error: true,
      message: "Cannot Submit Order",
    });
  }
});

module.exports = router;
