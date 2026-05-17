import { Doctor } from "../../../db/models/doctor.model.js"
import { MedicalRecord } from "../../../db/models/medicalRecord.model.js"
import { Appointment } from "../../../db/models/appointment.model.js"
import { handleAsyncError } from "../../middleware/handleAsyncError.js"
import appError from "../../utils/appError.js"

// GET /doctors/recommended — based on patient's medical history
export const getRecommendedDoctors = handleAsyncError(async (req, res, next) => {
    const userId = req.user._id

    // Get specialties from patient's past medical records
    const pastRecords = await MedicalRecord.find({ patient: userId })
        .populate("doctor", "specialty")
        .limit(10)

    const visitedDoctorIds = await Appointment.distinct("doctor", { patient: userId })

    // Collect specialties from past records
    const specialties = [...new Set(pastRecords.map((r) => r.doctor?.specialty).filter(Boolean))]

    let recommended = []

    if (specialties.length > 0) {
        // Find doctors with same specialties, excluding already visited ones
        recommended = await Doctor.find({
            isActive: true,
            specialty: { $in: specialties },
            _id: { $nin: visitedDoctorIds },
        })
            .populate("user", "firstName lastName email phoneNumber")
            .sort({ rating: -1 })
            .limit(6)
    }

    // If not enough recommendations, fill with top-rated doctors
    if (recommended.length < 4) {
        const existingIds = recommended.map((d) => d._id)
        const topRated = await Doctor.find({
            isActive: true,
            _id: { $nin: [...visitedDoctorIds, ...existingIds] },
        })
            .populate("user", "firstName lastName email phoneNumber")
            .sort({ rating: -1 })
            .limit(6 - recommended.length)

        recommended = [...recommended, ...topRated]
    }

    res.json({
        message: "Done!",
        basedOn: specialties.length > 0 ? specialties : ["top rated"],
        recommended,
    })
})

// ── existing controllers (keep as-is) ──────────────────────────────────────

export const createDoctorProfile = handleAsyncError(async (req, res, next) => {
    const exists = await Doctor.findOne({ user: req.user._id })
    if (exists) throw new appError("Doctor profile already exists", 409)
    if (req.user.registerAs !== "doctor") throw new appError("Only doctors can create a doctor profile", 403)
    const doctor = new Doctor({ ...req.body, user: req.user._id })
    const saved = await doctor.save()
    res.status(201).json({ message: "Doctor profile created", doctor: saved })
})

export const getAllDoctors = handleAsyncError(async (req, res, next) => {
    const { specialty, rating, page = 1, limit = 10 } = req.query
    const filter = { isActive: true }
    if (specialty) filter.specialty = { $regex: specialty, $options: "i" }
    if (rating) filter.rating = { $gte: Number(rating) }
    const skip = (page - 1) * limit
    const doctors = await Doctor.find(filter)
        .populate("user", "firstName lastName email phoneNumber")
        .skip(skip)
        .limit(Number(limit))
        .sort({ rating: -1 })
    const total = await Doctor.countDocuments(filter)
    res.json({ message: "Done!", total, page: Number(page), doctors })
})

export const getDoctor = handleAsyncError(async (req, res, next) => {
    const doctor = await Doctor.findById(req.params.id)
        .populate("user", "firstName lastName email phoneNumber")
    if (!doctor) throw new appError("Doctor not found", 404)
    res.json({ message: "Done!", doctor })
})

export const updateDoctorProfile = handleAsyncError(async (req, res, next) => {
    const doctor = await Doctor.findOneAndUpdate(
        { _id: req.params.id, user: req.user._id },
        req.body,
        { new: true }
    )
    if (!doctor) throw new appError("Doctor not found or not authorized", 404)
    res.json({ message: "Done!", doctor })
})

export const deleteDoctorProfile = handleAsyncError(async (req, res, next) => {
    const doctor = await Doctor.findByIdAndDelete(req.params.id)
    if (!doctor) throw new appError("Doctor not found", 404)
    res.json({ message: "Doctor profile deleted" })
})
