import express from "express"
import {
    bookAppointment,
    getMyAppointments,
    getAppointment,
    updateAppointmentStatus,
    cancelAppointment,
} from "./appointmentController.js"
import { protectRoutes, allowTo } from "../../middleware/protectRoutes.js"

const appointmentRouter = express.Router()

appointmentRouter.use(protectRoutes)

appointmentRouter.post("/", allowTo("patient"), bookAppointment)
appointmentRouter.get("/my", getMyAppointments)
appointmentRouter.get("/:id", getAppointment)
appointmentRouter.patch("/:id/status", allowTo("doctor", "admin"), updateAppointmentStatus)
appointmentRouter.patch("/:id/cancel", cancelAppointment)

export default appointmentRouter
