import jwt from "jsonwebtoken"
import { User } from "../../db/models/user.model.js"
import appError from "../utils/appError.js"
import { handleAsyncError } from "./handleAsyncError.js"

export const protectRoutes = handleAsyncError(async (req, res, next) => {
    let { token } = req.headers
    if (!token) return next(new appError("Please provide token", 401))

    let decoded = jwt.verify(token, process.env.JWT_SECRET || "bl7")

    let user = await User.findById(decoded.userId)
    if (!user) return next(new appError("invalid user", 404))
    if (user.isBlocked) return next(new appError("your account is blocked", 403))

    if (user.changePasswordAt) {
        let changePasswordTime = Math.round(user.changePasswordAt.getTime() / 1000)
        if (changePasswordTime > decoded.iat) return next(new appError("token invalid, please login again", 401))
    }

    req.user = user
    next()
})

export const allowTo = (...roles) => {
    return handleAsyncError(async (req, res, next) => {
        if (!roles.includes(req.user.registerAs)) return next(new appError("not authorized!", 403))
        next()
    })
}
