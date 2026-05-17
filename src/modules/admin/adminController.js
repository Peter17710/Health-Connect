import { User } from "../../../db/models/user.model.js"
import { Doctor } from "../../../db/models/doctor.model.js"
import { Appointment } from "../../../db/models/appointment.model.js"
import { MedicalRecord } from "../../../db/models/medicalRecord.model.js"
import { handleAsyncError } from "../../middleware/handleAsyncError.js"
import appError from "../../utils/appError.js"

// Dashboard stats
export const getDashboardStats = handleAsyncError(async (req, res, next) => {
    const [totalUsers, totalDoctors, totalAppointments, totalRecords,
        pendingAppointments, completedAppointments] = await Promise.all([
        User.countDocuments(),
        Doctor.countDocuments(),
        Appointment.countDocuments(),
        MedicalRecord.countDocuments(),
        Appointment.countDocuments({ status: "pending" }),
        Appointment.countDocuments({ status: "completed" }),
    ])

    res.json({
        message: "Done!",
        stats: {
            totalUsers,
            totalDoctors,
            totalAppointments,
            totalRecords,
            pendingAppointments,
            completedAppointments,
        },
    })
})

// Get all users
export const getAllUsers = handleAsyncError(async (req, res, next) => {
    const { role, isBlocked, page = 1, limit = 10 } = req.query
    const filter = {}
    if (role) filter.registerAs = role
    if (isBlocked !== undefined) filter.isBlocked = isBlocked === "true"

    const skip = (page - 1) * limit
    const users = await User.find(filter).skip(skip).limit(Number(limit)).sort({ createdAt: -1 })
    const total = await User.countDocuments(filter)

    res.json({ message: "Done!", total, page: Number(page), users })
})

// Block / Unblock user
export const toggleBlockUser = handleAsyncError(async (req, res, next) => {
    const user = await User.findById(req.params.id)
    if (!user) throw new appError("User not found", 404)

    user.isBlocked = !user.isBlocked
    await user.save()
    res.json({ message: `User ${user.isBlocked ? "blocked" : "unblocked"} successfully`, user })
})

// Delete user
export const deleteUser = handleAsyncError(async (req, res, next) => {
    const user = await User.findByIdAndDelete(req.params.id)
    if (!user) throw new appError("User not found", 404)
    res.json({ message: "User deleted successfully" })
})

// Get all appointments
export const getAllAppointments = handleAsyncError(async (req, res, next) => {
    const { status, page = 1, limit = 10 } = req.query
    const filter = {}
    if (status) filter.status = status

    const skip = (page - 1) * limit
    const appointments = await Appointment.find(filter)
        .populate("patient", "firstName lastName email")
        .populate({ path: "doctor", populate: { path: "user", select: "firstName lastName" } })
        .skip(skip)
        .limit(Number(limit))
        .sort({ createdAt: -1 })

    const total = await Appointment.countDocuments(filter)
    res.json({ message: "Done!", total, page: Number(page), appointments })
})

// Get all medical records
export const getAllMedicalRecords = handleAsyncError(async (req, res, next) => {
    const { page = 1, limit = 10 } = req.query
    const skip = (page - 1) * limit

    const records = await MedicalRecord.find()
        .populate("patient", "firstName lastName email")
        .populate({ path: "doctor", populate: { path: "user", select: "firstName lastName" } })
        .skip(skip)
        .limit(Number(limit))
        .sort({ createdAt: -1 })

    const total = await MedicalRecord.countDocuments()
    res.json({ message: "Done!", total, page: Number(page), records })
})
