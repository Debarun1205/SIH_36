import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    shop: { type: mongoose.Schema.Types.ObjectId, ref: "Shop", required: true },
    name: { type: String, required: true, trim: true },
    category: { type: String, trim: true },
    price: { type: Number },
    unit: { type: String, trim: true }, // e.g. "per kg", "per litre", "each"
    description: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("Product", productSchema);
