import mongoose from "mongoose"

const appointmentSchema = new mongoose.Schema({
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "Patient is required"],
    },
    doctor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Doctor",
        required: [true, "Doctor is required"],
    },
    date: {
        type: Date,
        required: [true, "Appointment date is required"],
    },
    time: {
        type: String,
        required: [true, "Appointment time is required"],
    },
    status: {
        type: String,
        enum: ["pending", "confirmed", "cancelled", "completed"],
        default: "pending",
    },
    type: {
        type: String,
        enum: ["in-person", "online"],
        default: "in-person",
    },
    reason: {
        type: String,
        trim: true,
        maxLength: [300, "Reason cannot exceed 300 characters"],
    },
    notes: {
        type: String,
        trim: true,
    },
    cancelledBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
    },
    cancelReason: {
        type: String,
        default: null,
    },
}, { timestamps: true, versionKey: false })

export const Appointment = mongoose.model("Appointment", appointmentSchema)
