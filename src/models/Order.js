const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    customerName: {
      type: String,
      required: [true, "Customer name is required"],
      trim: true,
    },
    address: {
      type: String,
      required: [true, "Address is required"],
      trim: true,
    },
    pincode: {
      type: String,
      required: [true, "Pincode is required"],
      trim: true,
      validate: {
        validator: (v) => /^\d{6}$/.test(v),
        message: (props) => `${props.value} is not a valid 6-digit pincode`,
      },
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
      validate: {
        validator: (v) => /^[6-9]\d{9}$/.test(v),
        message: (props) => `${props.value} is not a valid 10-digit Indian phone number`,
      },
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "Product reference is required"],
    },
    quantity: {
      type: Number,
      default: 1,
      min: [1, "Quantity cannot be less than 1"],
    },
    priceAtOrderTime: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    totalAmount: {
      type: Number,
      min: [0, "Total amount cannot be negative"],
    },
    agentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Agent reference is required"],
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
      enum: ["COD", "Partial Payment", "Full Payment"],
      default: "Partial Payment",
    },
    depositedAmount: {
      type: Number,
      default: 0,
      min: [0, "Deposited amount cannot be negative"],
    },
    remainingAmount: {
      type: Number,
      default: 0,
      min: [0, "Remaining amount cannot be negative"],
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

orderSchema.pre("save", function(){
  this.totalAmount = this.priceAtOrderTime * this.quantity;

  if (this.paymentMode !== "Partial Payment") {
    this.depositedAmount = 0;
    this.remainingAmount = 0;
  }
});


module.exports = mongoose.model("Order", orderSchema);
