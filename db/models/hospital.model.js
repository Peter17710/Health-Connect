import mongoose from "mongoose"

const hospitalSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Hospital name is required"],
        trim: true,
    },
    address: {
        type: String,
        required: [true, "Address is required"],
        trim: true,
    },
    phone: {
        type: String,
        trim: true,
    },
    email: {
        type: String,
        trim: true,
        lowercase: true,
    },
    type: {
        type: String,
        enum: ["public", "private", "clinic", "emergency"],
        default: "public",
    },
    specialties: {
        type: [String],
        default: [],
    },
    location: {
        type: {
            type: String,
            enum: ["Point"],
            default: "Point",
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            required: true,
        },
    },
    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
    },
    isOpen24Hours: {
        type: Boolean,
        default: false,
    },
    openingHours: {
        type: String,
        default: "08:00 - 22:00",
    },
    image: {
        type: String,
        default: "default-hospital.png",
    },
    isActive: {
        type: Boolean,
        default: true,
    },
}, { timestamps: true, versionKey: false })

// Enable geospatial queries
hospitalSchema.index({ location: "2dsphere" })

export const Hospital = mongoose.model("Hospital", hospitalSchema)
