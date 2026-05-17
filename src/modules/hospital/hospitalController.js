import { Hospital } from "../../../db/models/hospital.model.js"
import { handleAsyncError } from "../../middleware/handleAsyncError.js"
import appError from "../../utils/appError.js"

// GET /hospitals/nearby?lat=30.0444&lng=31.2357&radius=5000
export const getNearbyHospitals = handleAsyncError(async (req, res, next) => {
    const { lat, lng, radius = 5000, type, page = 1, limit = 10 } = req.query

    if (!lat || !lng) throw new appError("Please provide lat and lng query parameters", 400)

    const latitude = parseFloat(lat)
    const longitude = parseFloat(lng)

    if (isNaN(latitude) || isNaN(longitude)) throw new appError("Invalid lat or lng values", 400)

    const filter = {
        isActive: true,
        location: {
            $near: {
                $geometry: { type: "Point", coordinates: [longitude, latitude] },
                $maxDistance: parseInt(radius), // meters
            },
        },
    }

    if (type) filter.type = type

    const skip = (page - 1) * limit
    const hospitals = await Hospital.find(filter).skip(skip).limit(Number(limit))
    const total = hospitals.length

    // Add distance info to each hospital (in km)
    const hospitalsWithDistance = hospitals.map((h) => {
        const R = 6371 // Earth radius in km
        const dLat = ((h.location.coordinates[1] - latitude) * Math.PI) / 180
        const dLon = ((h.location.coordinates[0] - longitude) * Math.PI) / 180
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos((latitude * Math.PI) / 180) *
            Math.cos((h.location.coordinates[1] * Math.PI) / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2)
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
        const distance = (R * c).toFixed(2)

        return { ...h.toObject(), distanceKm: parseFloat(distance) }
    })

    res.json({
        message: "Done!",
        total,
        page: Number(page),
        userLocation: { latitude, longitude },
        radiusMeters: parseInt(radius),
        hospitals: hospitalsWithDistance,
    })
})

// GET /hospitals — get all hospitals (admin/general)
export const getAllHospitals = handleAsyncError(async (req, res, next) => {
    const { type, page = 1, limit = 10 } = req.query
    const filter = { isActive: true }
    if (type) filter.type = type

    const skip = (page - 1) * limit
    const hospitals = await Hospital.find(filter).skip(skip).limit(Number(limit)).sort({ rating: -1 })
    const total = await Hospital.countDocuments(filter)

    res.json({ message: "Done!", total, page: Number(page), hospitals })
})

// GET /hospitals/:id
export const getHospital = handleAsyncError(async (req, res, next) => {
    const hospital = await Hospital.findById(req.params.id)
    if (!hospital) throw new appError("Hospital not found", 404)
    res.json({ message: "Done!", hospital })
})

// POST /hospitals — admin creates hospital
export const createHospital = handleAsyncError(async (req, res, next) => {
    const { name, address, phone, email, type, specialties, lat, lng, isOpen24Hours, openingHours } = req.body

    if (!lat || !lng) throw new appError("Please provide lat and lng for hospital location", 400)

    const hospital = new Hospital({
        name, address, phone, email, type, specialties, isOpen24Hours, openingHours,
        location: { type: "Point", coordinates: [parseFloat(lng), parseFloat(lat)] },
    })

    const saved = await hospital.save()
    res.status(201).json({ message: "Hospital created", hospital: saved })
})
