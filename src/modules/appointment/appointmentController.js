import { Appointment } from "../../../db/models/appointment.model.js"
import { Doctor } from "../../../db/models/doctor.model.js"
import { handleAsyncError } from "../../middleware/handleAsyncError.js"
import appError from "../../utils/appError.js"

// Book appointment (patients only)
export const bookAppointment = handleAsyncError(async (req, res, next) => {
    const doctor = await Doctor.findById(req.body.doctor)
    if (!doctor || !doctor.isActive) throw new appError("Doctor not found or unavailable", 404)

    const conflict = await Appointment.findOne({
        doctor: req.body.doctor,
        date: req.body.date,
        time: req.body.time,
        status: { $in: ["pending", "confirmed"] },
    })
    if (conflict) throw new appError("This time slot is already booked", 409)

    const appointment = new Appointment({ ...req.body, patient: req.user._id })
    const saved = await appointment.save()
    await saved.populate([
        { path: "patient", select: "firstName lastName email" },
        { path: "doctor", populate: { path: "user", select: "firstName lastName" } },
    ])
    res.status(201).json({ message: "Appointment booked!", appointment: saved })
})

// Get my appointments (patient sees own, doctor sees theirs)
export const getMyAppointments = handleAsyncError(async (req, res, next) => {
    let filter = {}
    if (req.user.registerAs === "patient") {
        filter.patient = req.user._id
    } else if (req.user.registerAs === "doctor") {
        const doctor = await Doctor.findOne({ user: req.user._id })
        if (!doctor) throw new appError("Doctor profile not found", 404)
        filter.doctor = doctor._id
    }

    const { status, page = 1, limit = 10 } = req.query
    if (status) filter.status = status

    const skip = (page - 1) * limit
    const appointments = await Appointment.find(filter)
        .populate("patient", "firstName lastName email phoneNumber")
        .populate({ path: "doctor", populate: { path: "user", select: "firstName lastName" } })
        .skip(skip)
        .limit(Number(limit))
        .sort({ date: -1 })

    const total = await Appointment.countDocuments(filter)
    res.json({ message: "Done!", total, page: Number(page), appointments })
})

// Get single appointment
export const getAppointment = handleAsyncError(async (req, res, next) => {
    const appointment = await Appointment.findById(req.params.id)
        .populate("patient", "firstName lastName email phoneNumber")
        .populate({ path: "doctor", populate: { path: "user", select: "firstName lastName" } })
    if (!appointment) throw new appError("Appointment not found", 404)

    const isOwner =
        appointment.patient._id.toString() === req.user._id.toString() ||
        req.user.registerAs === "admin"

    if (!isOwner) throw new appError("Not authorized", 403)
    res.json({ message: "Done!", appointment })
})

// Update appointment status (doctor confirms/completes, patient/doctor can cancel)
export const updateAppointmentStatus = handleAsyncError(async (req, res, next) => {
    const { status, cancelReason } = req.body
    const appointment = await Appointment.findById(req.params.id)
    if (!appointment) throw new appError("Appointment not found", 404)

    if (status === "cancelled") {
        appointment.cancelledBy = req.user._id
        appointment.cancelReason = cancelReason || "No reason provided"
    }

    appointment.status = status
    await appointment.save()
    res.json({ message: "Appointment updated!", appointment })
})

// Cancel appointment
export const cancelAppointment = handleAsyncError(async (req, res, next) => {
    const appointment = await Appointment.findById(req.params.id)
    if (!appointment) throw new appError("Appointment not found", 404)

    const isOwner = appointment.patient.toString() === req.user._id.toString()
    if (!isOwner && req.user.registerAs !== "admin") throw new appError("Not authorized", 403)

    if (appointment.status === "completed") throw new appError("Cannot cancel a completed appointment", 400)

    appointment.status = "cancelled"
    appointment.cancelledBy = req.user._id
    appointment.cancelReason = req.body.cancelReason || "Cancelled by user"
    await appointment.save()
    res.json({ message: "Appointment cancelled", appointment })
})
