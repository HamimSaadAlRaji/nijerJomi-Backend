import express from "express";
import Bidding from "../models/bidding.js";

const router = express.Router();

// Middleware to check if user is Citizen
function requireCitizenRole(req, res, next) {
	// Assuming req.user is set by authentication middleware
	if (req.user && req.user.userRole && req.user.userRole.toLowerCase() === "citizen") {
		return next();
	}
	return res.status(403).json({ success: false, message: "Access denied. Only Citizens can perform this action." });
}

// GET all bids
router.get("/", async (req, res) => {
	try {
		const bids = await Bidding.find();
		res.status(200).json({ success: true, data: bids });
	} catch (error) {
		res.status(500).json({ success: false, message: error.message });
	}
});

// GET bid by ID
router.get("/:id", async (req, res) => {
	try {
		const bid = await Bidding.findById(req.params.id);
		if (!bid) return res.status(404).json({ success: false, message: "Bid not found" });
		res.status(200).json({ success: true, data: bid });
	} catch (error) {
		res.status(500).json({ success: false, message: error.message });
	}
});

// GET by property ID
router.get("/property/:propertyId", async (req, res) => {
	try {
		const bids = await Bidding.find({ propertyId: req.params.propertyId }).sort({ bidAmount: -1 });
		if (!bids || bids.length === 0) {
			return res.status(404).json({ success: false, message: "No bids found for this property" });
		}
		res.status(200).json({ success: true, data: bids });
	} catch (error) {
		res.status(500).json({ success: false, message: error.message });
	}
});


// POST create bid (Citizen only)
router.post("/", async (req, res) => {
	try {
		const { propertyId, bidder, bidAmount } = req.body;
		if (!propertyId || !bidder || !bidAmount) {
			return res.status(400).json({ success: false, message: "Missing required fields" });
		}
		const newBid = new Bidding({ propertyId, bidder, bidAmount });
		await newBid.save();
		res.status(201).json({ success: true, data: newBid });
	} catch (error) {
		res.status(500).json({ success: false, message: error.message });
	}
});

// PUT update bid by ID
router.put("/:id", async (req, res) => {
	try {
		const updatedBid = await Bidding.findByIdAndUpdate(req.params.id, req.body, { new: true });
		if (!updatedBid) return res.status(404).json({ success: false, message: "Bid not found" });
		res.status(200).json({ success: true, data: updatedBid });
	} catch (error) {
		res.status(500).json({ success: false, message: error.message });
	}
});

// DELETE bid by ID
router.delete("/:id", async (req, res) => {
	try {
		const deletedBid = await Bidding.findByIdAndDelete(req.params.id);
		if (!deletedBid) return res.status(404).json({ success: false, message: "Bid not found" });
		res.status(200).json({ success: true, message: "Bid deleted" });
	} catch (error) {
		res.status(500).json({ success: false, message: error.message });
	}
});

export default router;


// Delete all the biddings of a property
router.delete("/property/:propertyId", async (req, res) => {
	try {
		const { propertyId } = req.params;
		const deletedBids = await Bidding.deleteMany({ propertyId });
		res.status(200).json({ success: true, message: "All bids deleted", data: deletedBids });
	} catch (error) {
		res.status(500).json({ success: false, message: error.message });
	}
});
