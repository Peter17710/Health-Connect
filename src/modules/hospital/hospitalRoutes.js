import express from "express"
import {
    getNearbyHospitals,
    getAllHospitals,
    getHospital,
    createHospital,
} from "./hospitalController.js"
import { protectRoutes, allowTo } from "../../middleware/protectRoutes.js"

const hospitalRouter = express.Router()

hospitalRouter.get("/nearby", protectRoutes, getNearbyHospitals)
hospitalRouter.get("/", getAllHospitals)
hospitalRouter.get("/:id", getHospital)
hospitalRouter.post("/", protectRoutes, allowTo("admin"), createHospital)

export default hospitalRouter
