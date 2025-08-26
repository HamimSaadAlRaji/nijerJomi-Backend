import mongoose from "mongoose";

const biddingSchema = new mongoose.Schema({
    propertyId: { type: Number, required: true },
    bidder: { type: String, required: true },
    bidAmount: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now }
});

const Bidding = mongoose.model("Bidding", biddingSchema);

export default Bidding;