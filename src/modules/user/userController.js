import { handleAsyncError } from "../../middleware/handleAsyncError.js"
import { User } from "../../../db/models/user.model.js"
import appError from "../../utils/appError.js"

// GET /user/profile — get logged-in user's profile
export const getProfile = handleAsyncError(async (req, res, next) => {
    const user = await User.findById(req.user._id)
    if (!user) throw new appError("User not found", 404)
    res.json({ message: "Done!", user })
})

// PUT /user/profile — update logged-in user's profile
export const updateProfile = handleAsyncError(async (req, res, next) => {
    // Prevent updating sensitive fields via this route
    const forbiddenFields = ["password", "email", "registerAs", "isBlocked"]
    forbiddenFields.forEach((field) => delete req.body[field])

    const user = await User.findByIdAndUpdate(req.user._id, req.body, { new: true, runValidators: true })
    if (!user) throw new appError("User not found", 404)
    res.json({ message: "Profile updated!", user })
})

// ── existing controllers (keep as-is) ──────────────────────────────────────

export const addUser = handleAsyncError(async (req, res, next) => {
    let checkUser = await User.findOne({ email: req.body.email })
    if (checkUser) throw new appError("already register", 409)
    let user = new User(req.body)
    let added = await user.save()
    res.json({ message: "added", added })
})

export const getUser = handleAsyncError(async (req, res, next) => {
    const getuser = await User.findById(req.params.id)
    res.json({ message: "Done!", getuser })
})

export const getUsers = handleAsyncError(async (req, res, next) => {
    const getuser = await User.find()
    res.json({ message: "Done!", getuser })
})

export const updateUser = handleAsyncError(async (req, res, next) => {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!user) throw new appError("user not found", 404)
    user && res.json({ message: "Done!", user })
})

export const changePasssword = handleAsyncError(async (req, res, next) => {
    req.body.changePasswordAt = Date.now()
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!user) throw new appError("user not found", 404)
    user && res.json({ message: "Done!", user })
})
