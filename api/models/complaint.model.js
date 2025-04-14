import mongoose from "mongoose";

// Complaint Model
const complaintSchema = new mongoose.Schema({
  complaintId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    unique: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User"
  },
  title: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true,
    enum: ["Received", "Assigned", "Done"],
    default: "Received"
  },
  description: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String,
    required: false,
    default: null
  },
  category: {
    type: String,
    required: true
  },
  subCategory: {
    type: String,
    required: true
  },
  assignedName: {
    type: String,
    required: false,
    default: null
  },
  assignedContact: {
    type: String,
    required: false,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
});

const SupportStaff = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true }
});

exports.Complaint = mongoose.model("Complaint", complaintSchema);
exports.SupportStaff = mongoose.model("SupportStaff", SupportStaff);