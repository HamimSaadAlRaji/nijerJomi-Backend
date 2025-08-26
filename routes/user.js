import express from "express";
import User from "../models/User.js";
import { v2 as cloudinary } from "cloudinary";
import { profile } from "console";

const router = express.Router();

// Add this route to your existing user.js file

router.get("/users", async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json({
      success: true,
      message: "Users fetched successfully",
      data: users,
    });
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch users",
      error: error.message,
    });
  }
});

router.patch("/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Validate ID
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    // Find and update user
    const updatedUser = await User.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update user",
      error: error.message,
    });
  }
});

// GET /api/user/:walletAddress - Get user by wallet address
router.get("/user/:walletAddress", async (req, res) => {
  try {
    const { walletAddress } = req.params;

    // Validate wallet address
    if (!walletAddress) {
      return res.status(400).json({
        success: false,
        message: "Wallet address is required",
      });
    }

    // Find user by wallet address
    const user = await User.findOne({
      walletAddress: walletAddress.toLowerCase(),
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found with this wallet address",
      });
    }

    // Return user data
    res.status(200).json({
      success: true,
      message: "User found successfully",
      data: user,
    });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user",
      error: error.message,
    });
  }
});

// Get wallet address from nid
router.get("/user/wallet-by-nid/:nidNumber", async (req, res) => {
    try {
      const { nidNumber } = req.params;
      console.log("NID Number:", nidNumber);
      if (!nidNumber) {
        return res.status(400).json({
          success: false,
          message: "NID number is required",
        });
      }
      const user = await User.findOne({ nidNumber: nidNumber });
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found with this NID number",
        });
      }
      res.status(200).json({
        success: true,
        message: "Wallet address found successfully",
        walletAddress: user.walletAddress,
      });
    } catch (error) {
      console.error("Get wallet address by NID error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get wallet address by NID",
        error: error.message,
      });
    }
  });

// Get nid from wallet address
router.get("/user/nid-by-wallet/:walletAddress", async (req, res) => {
  try {
    const { walletAddress } = req.params;
    if (!walletAddress) {
      return res.status(400).json({
        success: false,
        message: "Wallet address is required",
      });
    }
    const user = await User.findOne({ walletAddress: walletAddress });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found with this wallet address",
      });
    }
    res.status(200).json({
      success: true,
      message: "NID number found successfully",
      nidNumber: user.nidNumber,
    });
  } catch (error) {
    console.error("Get NID by wallet address error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get NID by wallet address",
      error: error.message,
    });
  }
});

// POST /api/connect-wallet - Connect MetaMask wallet and check if user exists
router.post("/connect-wallet", async (req, res) => {
  try {
    const { walletAddress } = req.body;

    // Validate wallet address
    if (!walletAddress) {
      return res.status(400).json({
        success: false,
        message: "Wallet address is required",
      });
    }

    // Check if wallet exists in database
    const existingUser = await User.findOne({
      walletAddress: walletAddress.toLowerCase(),
    });

    if (existingUser) {
      // User exists - login successful
      return res.status(200).json({
        success: true,
        message: "Wallet connected successfully",
        userExists: true,
        data: {
          id: existingUser._id,
          walletAddress: existingUser.walletAddress,
          fullName: existingUser.fullName,
          nidNumber: existingUser.nidNumber,
          phoneNumber: existingUser.phoneNumber,
          presentAddress: existingUser.presentAddress,
          permanentAddress: existingUser.permanentAddress,
          profilePicture: existingUser.profilePicture,
          status: existingUser.status,
          userRole: existingUser.userRole,
          submittedAt: existingUser.submittedAt,
        },
      });
    } else {
      // User doesn't exist - show registration form
      return res.status(200).json({
        success: true,
        message: "New wallet detected. Please complete registration.",
        userExists: false,
        walletAddress: walletAddress.toLowerCase(),
      });
    }
  } catch (error) {
    console.error("Wallet connection error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to connect wallet",
      error: error.message,
    });
  }
});

// POST /api/register - Register new user with MetaMask wallet
router.post("/register", async (req, res) => {
  try {
    const {
      walletAddress,
      fullName,
      nidNumber,
      phoneNumber,
      presentAddress,
      permanentAddress,
      profilePicture,
      userRole,
    } = req.body;

    // Validate wallet address
    if (!walletAddress) {
      return res.status(400).json({
        success: false,
        message: "Wallet address is required",
      });
    }

    // Check if wallet already exists
    const existingUser = await User.findOne({
      walletAddress: walletAddress.toLowerCase(),
    });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message:
          "Wallet address already registered. Please use connect wallet instead.",
      });
    }

    // Check if NID already exists (if provided)
    if (nidNumber) {
      const existingNID = await User.findOne({ nidNumber });
      if (existingNID) {
        return res.status(400).json({
          success: false,
          message: "User with this NID number already exists",
        });
      }
    }

    // Create image URL if image uploaded
    let imageUrl = null;
    if (profilePicture) {
      const uploadResult = await cloudinary.uploader.upload(profilePicture, {
        folder: "users",
      });
      imageUrl = uploadResult.secure_url;
    }

    // Create new user
    const newUser = new User({
      walletAddress: walletAddress.toLowerCase(),
      fullName,
      nidNumber,
      phoneNumber,
      presentAddress,
      permanentAddress,
      profilePicture: imageUrl,
      userRole: userRole || "citizen", // Default to 'citizen' if not provided
      status: userRole == "ADMIN" ? "accepted" : "pending",
      submittedAt: new Date(),
    });

    const savedUser = await newUser.save();

    res.status(201).json({
      success: true,
      message:
        "Registration completed successfully! Your request has been sent to admin for approval.",
      data: {
        id: savedUser._id,
        walletAddress: savedUser.walletAddress,
        fullName: savedUser.fullName,
        nidNumber: savedUser.nidNumber,
        phoneNumber: savedUser.phoneNumber,
        presentAddress: savedUser.presentAddress,
        permanentAddress: savedUser.permanentAddress,
        profilePicture: savedUser.profilePicture,
        userRole: savedUser.userRole,
        status: savedUser.status,
        submittedAt: savedUser.submittedAt,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);

    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `${
          field === "walletAddress" ? "Wallet address" : "NID number"
        } already exists`,
      });
    }

    res.status(500).json({
      success: false,
      message: "Registration failed",
      error: error.message,
    });
  }
});

export default router;
