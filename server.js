import express from "express"
import { connection } from "./db/connection.js"
import appError from "./src/utils/appError.js"
import { globalError } from "./src/utils/globalError.js"
import cors from "cors"
import authRouter from "./src/modules/auth/authRoutes.js"
import adminRouter from "./src/modules/admin/adminRoutes.js"
import appointmentRouter from "./src/modules/appointment/appointmentRoutes.js"
import doctorRouter from "./src/modules/doctor/doctorRoutes.js"
import medicalRecordRouter from "./src/modules/medicalRecord/medicalRecordRoutes.js"
import userRoutes from "./src/modules/user/userRoutes.js"
import emergencyRouter from "./src/modules/emergency/emergencyRoutes.js"
import hospitalRouter from "./src/modules/hospital/hospitalRoutes.js"

const app = express()

app.use(express.json())
app.use(cors())

connection

app.get("/", (req, res, next) => {
    res.send("Hello World")
})

app.use("/auth" , authRouter)
app.use("/admin" , adminRouter)
app.use("/appointment" , appointmentRouter)
app.use("/doctor" , doctorRouter)
app.use("/medicalRecord" , medicalRecordRouter)
app.use("/user" , userRoutes)
app.use("/emergency" , emergencyRouter)
app.use("/hospital" , hospitalRouter)

app.use((req, res, next) => {
    next(new appError("invalid url", 404))
})

app.use(globalError)

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
    console.log("Server is running");
})