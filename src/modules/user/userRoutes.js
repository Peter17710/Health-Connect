import express from "express"
import {
    addUser,
    getUser,
    getUsers,
    updateUser,
    changePasssword,
    getProfile,
    updateProfile,
} from "./userController.js"
import { protectRoutes } from "../../middleware/protectRoutes.js"

const userRoutes = express.Router()

// Profile routes (logged-in user)
userRoutes.get("/profile", protectRoutes, getProfile)
userRoutes.put("/profile", protectRoutes, updateProfile)

// Admin / general routes
userRoutes.route("/").post(addUser).get(getUsers)
userRoutes.route("/:id").get(getUser).put(updateUser)
userRoutes.patch("/changePassword/:id", changePasssword)

export default userRoutes
