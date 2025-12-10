const Product = require("../models/Product");
const {
  createProductValidation,
  updateProductValidation,
} = require("../validations/product.validation");

// ---------------------------------------------
// CREATE PRODUCT
// ---------------------------------------------
exports.createProduct = async (req, res) => {
  try {
    const { error } = createProductValidation.validate(req.body, { abortEarly: false });
    if (error) {
      const messages = error.details.map(d => d.message);
      return res.status(400).json({ success: false, errors: messages });
    }

    const {
      productName,
      description,
      price,
      offerPrice,
      images,
      category,
      stock,
      status,
    } = req.body;

    const product = new Product({
      productName,
      description,
      price,
      offerPrice,
      images: images || [],
      category,
      stock: stock || 0,
      status: status || "active",
      createdBy: req.user._id,
    });

    const savedProduct = await product.save();
    res.status(201).json({ success: true, data: savedProduct });
  } catch (error) {
    console.error("Create Product Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// ---------------------------------------------
// GET ALL PRODUCTS
// ---------------------------------------------
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .populate("createdBy", "name email role")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: products });
  } catch (error) {
    console.error("Get All Products Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// ---------------------------------------------
// GET SINGLE PRODUCT
// ---------------------------------------------
exports.getProductById = async (req, res) => {
  try {
    let { id } = req.body; // ID comes from request body
    if (!id) {
      return res.status(400).json({ success: false, message: "Product ID required" });
    }

    id = id.toString().trim();

    const product = await Product.findById(id)
      .populate("createdBy", "name email role");

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    res.status(200).json({ success: true, data: product });
  } catch (error) {
    console.error("Get Product By ID Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// ---------------------------------------------
// UPDATE PRODUCT
// ---------------------------------------------
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) return res.status(400).json({ success: false, message: "Product ID required" });

    const { error } = updateProductValidation.validate(req.body, { abortEarly: false });
    if (error) {
      const messages = error.details.map(d => d.message);
      return res.status(400).json({ success: false, errors: messages });
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    ).populate("createdBy", "name email role");

    if (!updatedProduct) return res.status(404).json({ success: false, message: "Product not found" });

    res.status(200).json({ success: true, message: "Product updated successfully", data: updatedProduct });
  } catch (error) {
    console.error("Update Product Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// ---------------------------------------------
// DELETE PRODUCT
// ---------------------------------------------
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) return res.status(400).json({ success: false, message: "Product ID required" });

    const deletedProduct = await Product.findByIdAndDelete(id);
    if (!deletedProduct) return res.status(404).json({ success: false, message: "Product not found" });

    res.status(200).json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    console.error("Delete Product Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
