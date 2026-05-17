import express from "express"
import {
    createRecord,
    getMyRecords,
    getRecord,
    updateRecord,
    deleteRecord,
} from "./medicalRecordController.js"
import { protectRoutes, allowTo } from "../../middleware/protectRoutes.js"

const medicalRecordRouter = express.Router()

medicalRecordRouter.use(protectRoutes)

medicalRecordRouter.post("/", allowTo("doctor"), createRecord)
medicalRecordRouter.get("/my", allowTo("patient"), getMyRecords)
medicalRecordRouter.get("/:id", getRecord)
medicalRecordRouter.put("/:id", allowTo("doctor"), updateRecord)
medicalRecordRouter.delete("/:id", allowTo("admin"), deleteRecord)

export default medicalRecordRouter
