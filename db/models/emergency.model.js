import mongoose from "mongoose"

const emergencySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    type: {
        type: String,
        enum: ["ambulance", "fire", "police", "general"],
        default: "ambulance",
    },
    location: {
        latitude: { type: Number },
        longitude: { type: Number },
        address: { type: String, trim: true },
    },
    description: {
        type: String,
        trim: true,
        maxLength: [500, "Description too long"],
    },
    status: {
        type: String,
        enum: ["pending", "dispatched", "resolved"],
        default: "pending",
    },
    contactNumber: {
        type: String,
        default: "911",
    },
    resolvedAt: {
        type: Date,
        default: null,
    },
}, { timestamps: true, versionKey: false })

export const Emergency = mongoose.model("Emergency", emergencySchema)
