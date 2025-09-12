import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: String,
  phone: String,
  job: String
});

export default mongoose.model("Employee", employeeSchema);
