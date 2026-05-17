import express from "express"
import {
    triggerEmergency,
    getMyEmergencies,
    getAllEmergencies,
    updateEmergencyStatus,
} from "./emergencyController.js"
import { protectRoutes, allowTo } from "../../middleware/protectRoutes.js"

const emergencyRouter = express.Router()

emergencyRouter.use(protectRoutes)

emergencyRouter.post("/", triggerEmergency)
emergencyRouter.get("/my", getMyEmergencies)
emergencyRouter.get("/", allowTo("admin"),  )
emergencyRouter.patch("/:id/status", allowTo("admin"), updateEmergencyStatus)

export default emergencyRouter
