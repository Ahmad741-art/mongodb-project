import mongoose from "mongoose";

const articleSchema = new mongoose.Schema({
  articleNumber: { type: Number, required: true },
  articleName: { type: String, required: true },
  unit: String,
  packageSize: Number,
  purchasePrice: Number,
  salesPrice: Number
});

export default mongoose.model("Article", articleSchema);
