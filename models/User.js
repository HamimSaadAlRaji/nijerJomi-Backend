import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    walletAddress: {
      type: String,
      //required: true,
      unique: true,
    },
    fullName: {
      type: String,
      //required: true
    },
    nidNumber: {
      type: String,
      //required: true,
      unique: true,
    },
    phoneNumber: {
      type: String,
      //required: true,
      unique: true,
    },
    presentAddress: {
      type: String,
      //required: true
    },
    permanentAddress: {
      type: String,
      //required: true
    },
    profilePicture: {
      type: String,
      //required: false
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
    userRole: {
      type: String,
      enum: ["ADMIN", "REGISTRAR", "COURT", "TAX_AUTHORITY", "CITIZEN", "NONE"],
      default: "CITIZEN",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("User", userSchema);
