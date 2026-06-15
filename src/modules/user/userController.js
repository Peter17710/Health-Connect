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
    const { oldPassword, newPassword, confirmPassword } = req.body

    if (!oldPassword || !newPassword || !confirmPassword) {
        throw new appError("Please provide oldPassword, newPassword and confirmPassword", 400)
    }

    if (newPassword !== confirmPassword) {
        throw new appError("New password and confirmation do not match", 400)
    }

    if (newPassword === oldPassword) {
        throw new appError("New password must be different from the old password", 400)
    }

    // Get user with password field included
    const user = await User.findById(req.params.id).select("+password")
    if (!user) throw new appError("User not found", 404)

    // Verify old password
    const match = bcrypt.compareSync(oldPassword, user.password)
    if (!match) throw new appError("Old password is incorrect", 401)

    // Update password (pre-findOneAndUpdate hook will hash it)
    const updatedUser = await User.findByIdAndUpdate(
        req.params.id,
        { password: newPassword, changePasswordAt: Date.now() },
        { new: true }
    )

    res.json({ message: "Password changed successfully!", user: updatedUser })
})

// GET /user/medical-info
export const getMedicalInfo = handleAsyncError(async (req, res, next) => {
    const user = await User.findById(req.user._id).select("medicalInfo")
    if (!user) throw new appError("User not found", 404)
    res.json({ message: "Done!", medicalInfo: user.medicalInfo })
})

// PUT /user/medical-info
export const updateMedicalInfo = handleAsyncError(async (req, res, next) => {
    const { bloodType, allergies, chronicDiseases, currentMedications, height, weight } = req.body

    const medicalInfo = {}
    if (bloodType !== undefined) medicalInfo.bloodType = bloodType
    if (allergies !== undefined) medicalInfo.allergies = allergies
    if (chronicDiseases !== undefined) medicalInfo.chronicDiseases = chronicDiseases
    if (currentMedications !== undefined) medicalInfo.currentMedications = currentMedications
    if (height !== undefined) medicalInfo.height = height
    if (weight !== undefined) medicalInfo.weight = weight

    const user = await User.findByIdAndUpdate(
        req.user._id,
        { medicalInfo },
        { new: true, runValidators: true }
    ).select("medicalInfo")

    if (!user) throw new appError("User not found", 404)
    res.json({ message: "Medical info updated!", medicalInfo: user.medicalInfo })
})
