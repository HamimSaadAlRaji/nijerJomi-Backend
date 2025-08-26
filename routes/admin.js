import express from "express";
import User from "../models/User.js";
const router = express.Router();

// GET /api/admin/applications - Get all pending applications
router.get("/admin/applications", async (req, res) => {
  try {
    const pendingApplications = await User.find({ status: "pending" })
      .sort({ submittedAt: -1 })
      .select("walletAddress fullName nidNumber userRole status submittedAt");

    res.status(200).json({
      success: true,
      data: pendingApplications,
    });
  } catch (error) {
    console.error("Pending applications fetch error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch pending applications",
      error: error.message,
    });
  }
});

// PUT /api/admin/approve/:id - Approve application
router.put("/admin/approve/:id", async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        status: "approved",
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Application approved successfully",
      data: user,
    });
  } catch (error) {
    console.error("Approval error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to approve application",
      error: error.message,
    });
  }
});

// PUT /api/admin/reject/:id - Reject application
router.put("/admin/reject/:id", async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        status: "rejected",
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Application rejected successfully",
      data: user,
    });
  } catch (error) {
    console.error("Rejection error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to reject application",
      error: error.message,
    });
  }
});

export default router;
