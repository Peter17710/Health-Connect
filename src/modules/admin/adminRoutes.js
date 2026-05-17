import express from "express"
import {
    getDashboardStats,
    getAllUsers,
    toggleBlockUser,
    deleteUser,
    getAllAppointments,
    getAllMedicalRecords,
} from "./adminController.js"
import { protectRoutes, allowTo } from "../../middleware/protectRoutes.js"

const adminRouter = express.Router()

adminRouter.use(protectRoutes)
adminRouter.use(allowTo("admin"))

adminRouter.get("/stats", getDashboardStats)
adminRouter.get("/users", getAllUsers)
adminRouter.patch("/users/:id/block", toggleBlockUser)
adminRouter.delete("/users/:id", deleteUser)
adminRouter.get("/appointments", getAllAppointments)
adminRouter.get("/medical-records", getAllMedicalRecords)

export default adminRouter
