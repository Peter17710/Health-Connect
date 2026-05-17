import { Emergency } from "../../../db/models/emergency.model.js"
import { handleAsyncError } from "../../middleware/handleAsyncError.js"
import appError from "../../utils/appError.js"

const EMERGENCY_CONTACTS = {
    ambulance: { number: "123", label: "Ambulance / EMS" },
    fire: { number: "180", label: "Fire Department" },
    police: { number: "122", label: "Police" },
    general: { number: "911", label: "General Emergency" },
}

// POST /emergency — log an emergency call
export const triggerEmergency = handleAsyncError(async (req, res, next) => {
    const { type = "general", location, description } = req.body

    if (!EMERGENCY_CONTACTS[type]) throw new appError("Invalid emergency type", 400)

    const contact = EMERGENCY_CONTACTS[type]

    const emergency = new Emergency({
        user: req.user._id,
        type,
        location: location || {},
        description: description || "Emergency assistance needed",
        contactNumber: contact.number,
        status: "pending",
    })

    const saved = await emergency.save()
    await saved.populate("user", "firstName lastName phoneNumber")

    res.status(201).json({
        message: "Emergency logged! Please call the number below immediately.",
        emergency: saved,
        callNow: {
            label: contact.label,
            number: contact.number,
        },
        allContacts: EMERGENCY_CONTACTS,
        instructions: [
            "Stay calm and stay on the line",
            "Provide your exact location",
            "Do not move the injured person unless necessary",
            "Follow dispatcher instructions",
        ],
    })
})

// GET /emergency/my — get my emergency history
export const getMyEmergencies = handleAsyncError(async (req, res, next) => {
    const emergencies = await Emergency.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(20)
    res.json({ message: "Done!", emergencies })
})

// GET /emergency — admin gets all emergencies
export const getAllEmergencies = handleAsyncError(async (req, res, next) => {
    const { status, page = 1, limit = 10 } = req.query
    const filter = {}
    if (status) filter.status = status

    const skip = (page - 1) * limit
    const emergencies = await Emergency.find(filter)
        .populate("user", "firstName lastName phoneNumber email")
        .skip(skip)
        .limit(Number(limit))
        .sort({ createdAt: -1 })

    const total = await Emergency.countDocuments(filter)
    res.json({ message: "Done!", total, page: Number(page), emergencies })
})

// PATCH /emergency/:id/status — admin updates emergency status
export const updateEmergencyStatus = handleAsyncError(async (req, res, next) => {
    const { status } = req.body
    const emergency = await Emergency.findByIdAndUpdate(
        req.params.id,
        {
            status,
            ...(status === "resolved" ? { resolvedAt: new Date() } : {}),
        },
        { new: true }
    )
    if (!emergency) throw new appError("Emergency not found", 404)
    res.json({ message: "Emergency status updated", emergency })
})
