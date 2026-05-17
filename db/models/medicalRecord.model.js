import mongoose from "mongoose"

const prescriptionSchema = new mongoose.Schema({
    medicationName: { type: String, required: true, trim: true },
    dosage: { type: String, required: true },
    frequency: { type: String, required: true },
    duration: { type: String },
    notes: { type: String },
}, { _id: false })

const medicalRecordSchema = new mongoose.Schema({
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
    appointment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Appointment",
        default: null,
    },
    diagnosis: {
        type: String,
        required: [true, "Diagnosis is required"],
        trim: true,
    },
    symptoms: {
        type: [String],
        default: [],
    },
    prescriptions: {
        type: [prescriptionSchema],
        default: [],
    },
    notes: {
        type: String,
        trim: true,
    },
    attachments: {
        type: [String],
        default: [],
    },
    followUpDate: {
        type: Date,
        default: null,
    },
    isPrivate: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true, versionKey: false })

export const MedicalRecord = mongoose.model("MedicalRecord", medicalRecordSchema)
