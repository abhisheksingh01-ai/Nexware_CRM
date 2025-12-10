const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    productName: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      lowercase: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    offerPrice: {
      type: Number,
      min: 0,
      validate: {
        validator: function (value) {
          return value <= this.price;
        },
        message: "Offer price cannot be greater than main price",
      },
    },
    images: [
      {
        url: { type: String },
        public_id: { type: String }, 
      },
    ],
    category: {
      type: String,
      required: true,
      trim: true,
    },
    stock: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "outofstock"],
      default: "active",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);
productSchema.pre("save", function () {
  if (this.isModified("productName")) {
    this.slug = this.productName.toLowerCase().replace(/ /g, "-");
  }
});



module.exports = mongoose.model("Product", productSchema);
