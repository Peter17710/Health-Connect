import express from "express"
import {
    createDoctorProfile,
    getAllDoctors,
    getDoctor,
    updateDoctorProfile,
    deleteDoctorProfile,
    getRecommendedDoctors,
} from "./doctorController.js"
import { protectRoutes, allowTo } from "../../middleware/protectRoutes.js"

const doctorRouter = express.Router()

// Public routes
doctorRouter.get("/", getAllDoctors)
doctorRouter.get("/recommended", protectRoutes, getRecommendedDoctors)
doctorRouter.get("/:id", getDoctor)

// Protected routes
doctorRouter.use(protectRoutes)
doctorRouter.post("/", allowTo("doctor"), createDoctorProfile)
doctorRouter.put("/:id", allowTo("doctor"), updateDoctorProfile)
doctorRouter.delete("/:id", allowTo("admin"), deleteDoctorProfile)

export default doctorRouter
