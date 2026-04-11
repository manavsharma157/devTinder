const express = require("express");
const paymentRouter = express.Router();
const { userAuth } = require("../middlewares/auth");
const razorpayInstance = require("../utils/razorpay");
const User = require("../models/user");
const Payment = require("../models/payments");
const { membershipAmount } = require("../utils/constants");
const {
  validateWebhookSignature,
} = require("razorpay/dist/utils/razorpay-utils");

paymentRouter.post("/payment/create", userAuth, async (req, res) => {
  try {
    const { membershipType } = req.body;
    const order = await razorpayInstance.orders.create({
      amount: membershipAmount[membershipType] * 100, // Amount in paise (1 INR = 100 paise)
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
      notes: {
        userId: req.user._id.toString(),
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        membershipType: membershipType,
      },
    });

    const payment = new Payment({
      userId: req.user._id,
      orderId: order.id,
      status: "created",
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
      notes: order.notes,
    });

    const savedPayment = await payment.save();
    res.json({ ...savedPayment.toJSON(), keyId: process.env.RAZORPAY_KEY_ID }); // Send the order details back to the client, including the Razorpay key ID for frontend use
  } catch (error) {
    console.error("Razorpay Error:", error); // Check your VS Code terminal for this!
    res.status(500).json({ err: error.message });
  }
});

paymentRouter.post("/payment/webhook", async (req, res) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const webhookSignature = req.headers["x-razorpay-signature"];

    const isWebhookValid = validateWebhookSignature(
      JSON.stringify(req.body),
      webhookSignature,
      webhookSecret,
    );
    if (!isWebhookValid) {
      return res.status(400).send("Invalid webhook signature");
    }

    //if the payment is valid, update the payment status in db
    const paymentDetails = req.body.payload.payment.entity;

    const payment = await Payment.findOne({ orderId: paymentDetails.order_id });
    if (!payment) {
        return res.status(404).send("Payment not found");
    }
    
    payment.status = paymentDetails.status;
    await payment.save();

    // Update the user as premium
    //and
    //return success response to razorpay
    if (req.body.event == "payment.captured" || paymentDetails.status === "captured") {
        const user = await User.findOne({_id: payment.userId});
        if (user) {
            user.isPremium = true;
            user.membershipType = payment.notes.membershipType;
            await user.save();
        }
    }

    // if (req.body.event == "payment.captured"){

    // }
    // if (req.body.event == "payment.failed"){

    // }

    return res.status(200).json({ status: "ok" }); // Acknowledge receipt of the webhook to Razorpay
  } catch (err) {
    console.error("Webhook Error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

paymentRouter.post("/payment/verify", userAuth, async (req, res) => {
    const user = req.user.toJSON();
    if (user.isPremium) {
        res.json({ isPremium: true, membershipType: user.membershipType });
        
    } else {
        res.json({ isPremium: false });
    }
});

module.exports = paymentRouter;