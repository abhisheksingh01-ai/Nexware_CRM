const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    customerName: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    pincode: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: function (v) {
          return /^\d{6}$/.test(v);
        },
        message: (props) => `${props.value} is not a valid pincode!`,
      },
    },
    phone: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: function (v) {
          return /^[6-9]\d{9}$/.test(v);
        },
        message: (props) => `${props.value} is not a valid phone number!`,
      },
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    quantity: {
      type: Number,
      default: 1,
      min: 1,
    },
    priceAtOrderTime: {
      type: Number,
      required: true,
      min: 0,
    },
    totalAmount: {         // <-- added this field
      type: Number,
      min: 0,
    },
    agentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    awb: {
      type: String,
      trim: true,
      default: null,
    },
    orderStatus: {
      type: String,
      enum: [
        "Pending",
        "Confirmed",
        "Packed",
        "Shipped",
        "In Transit",
        "Out For Delivery",
        "Delivered",
        "RTO Initiated",
        "RTO Received",
        "Returned",
        "Cancelled",
      ],
      default: "Pending",
    },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Failed", "Refunded"],
      default: "Pending",
    },
    paymentMode: {
      type: String,
      enum: ["COD", "Online"],
      default: "COD",
    },
    remarks: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

orderSchema.pre("save", async function () {
  this.totalAmount = this.priceAtOrderTime * this.quantity;
});

module.exports = mongoose.model("Order", orderSchema);
