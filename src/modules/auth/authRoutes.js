import express from "express"
import { signIn, signUp } from "./authController.js"


const authRouter = express.Router()

authRouter.post("/signUp" , signUp)
authRouter.post("/signIn" , signIn)


export default authRouter;