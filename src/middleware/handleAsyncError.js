import appError from "../utils/appError.js"


export const handleAsyncError = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch((err) => {
            if (err instanceof appError) return next(err)
            next(new appError(err?.message || "Unexpected error", 422))
        })
    }
}