import mongoose from "mongoose"

const doctorSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "Doctor must be linked to a user account"],
        unique: true,
    },
    specialty: {
        type: String,
        required: [true, "Specialty is required"],
        trim: true,
    },
    bio: {
        type: String,
        trim: true,
        maxLength: [500, "Bio cannot exceed 500 characters"],
    },
    profileImage: {
        type: String,
        default: "default-doctor.png",
    },
    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
    },
    reviewsCount: {
        type: Number,
        default: 0,
    },
    availableDays: {
        type: [String],
        enum: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        default: ["Monday", "Wednesday", "Thursday"],
    },
    availableFrom: {
        type: String,
        default: "09:00",
    },
    availableTo: {
        type: String,
        default: "17:00",
    },
    hospitalName: {
        type: String,
        trim: true,
    },
    location: {
        type: String,
        trim: true,
    },
    consultationFee: {
        type: Number,
        default: 0,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
}, { timestamps: true, versionKey: false })

export const Doctor = mongoose.model("Doctor", doctorSchema)
