import { MedicalRecord } from "../../../db/models/medicalRecord.model.js"
import { Doctor } from "../../../db/models/doctor.model.js"
import { handleAsyncError } from "../../middleware/handleAsyncError.js"
import appError from "../../utils/appError.js"

// Create medical record (doctors only)
export const createRecord = handleAsyncError(async (req, res, next) => {
    const doctor = await Doctor.findOne({ user: req.user._id })
    if (!doctor) throw new appError("Doctor profile not found", 404)

    const record = new MedicalRecord({ ...req.body, doctor: doctor._id })
    const saved = await record.save()
    await saved.populate([
        { path: "patient", select: "firstName lastName email" },
        { path: "doctor", populate: { path: "user", select: "firstName lastName" } },
    ])
    res.status(201).json({ message: "Medical record created", record: saved })
})

// Get my medical records (patient)
export const getMyRecords = handleAsyncError(async (req, res, next) => {
    const { page = 1, limit = 10 } = req.query
    const skip = (page - 1) * limit

    const records = await MedicalRecord.find({ patient: req.user._id, isPrivate: false })
        .populate({ path: "doctor", populate: { path: "user", select: "firstName lastName" } })
        .populate("appointment", "date time")
        .skip(skip)
        .limit(Number(limit))
        .sort({ createdAt: -1 })

    const total = await MedicalRecord.countDocuments({ patient: req.user._id, isPrivate: false })
    res.json({ message: "Done!", total, page: Number(page), records })
})

// Get single record
export const getRecord = handleAsyncError(async (req, res, next) => {
    const record = await MedicalRecord.findById(req.params.id)
        .populate("patient", "firstName lastName email")
        .populate({ path: "doctor", populate: { path: "user", select: "firstName lastName" } })
        .populate("appointment", "date time")

    if (!record) throw new appError("Record not found", 404)

    const isPatient = record.patient._id.toString() === req.user._id.toString()
    const isAdmin = req.user.registerAs === "admin"
    if (!isPatient && !isAdmin) throw new appError("Not authorized", 403)

    res.json({ message: "Done!", record })
})

// Update record (doctor who created it)
export const updateRecord = handleAsyncError(async (req, res, next) => {
    const doctor = await Doctor.findOne({ user: req.user._id })
    if (!doctor) throw new appError("Doctor profile not found", 404)

    const record = await MedicalRecord.findOneAndUpdate(
        { _id: req.params.id, doctor: doctor._id },
        req.body,
        { new: true }
    )
    if (!record) throw new appError("Record not found or not authorized", 404)
    res.json({ message: "Done!", record })
})

// Delete record (admin only)
export const deleteRecord = handleAsyncError(async (req, res, next) => {
    const record = await MedicalRecord.findByIdAndDelete(req.params.id)
    if (!record) throw new appError("Record not found", 404)
    res.json({ message: "Medical record deleted" })
})
