import mongoose from "mongoose";
import bcrypt from "bcrypt";


const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        trim: true,
        required: [true, "First name is required"],
        minLength: [2, "First name is too short"],
    },
    lastName: {
        type: String,
        trim: true,
        required: [true, "Last name is required"],
        minLength: [2, "Last name is too short"],
    },
    phoneNumber: {
        type: String,
        trim: true,
        required: [true, "Phone number is required"],
    },
    age: {
        type: Number,
        required: [true, "Age is required"],
        min: [1, "Age must be at least 1"],
        max: [120, "Age is not valid"],
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        lowercase: true,
        trim: true,
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        minLength: [6, "Password is too short"],
        select: false,
    },
    gender: {
        type: String,
        required: [true, "Gender is required"],
        enum: {
            values: ["male", "female", "other"],
            message: "{VALUE} is not a valid gender",
        },
    },
    registerAs: {
        type: String,
        required: [true, "Register as is required"],
        enum: {
            values: ["patient", "doctor"],
            message: "{VALUE} is not valid; use patient or doctor",
        },
        default: "patient",
    },

    isBlocked: {
        type: Boolean,
        default: false,
    },
    changePasswordAt: Date,

},
    { timestamps: true, versionKey: false })

userSchema.virtual("role").get(function () {
    return this.registerAs;
});
userSchema.set("toJSON", { virtuals: true });
userSchema.set("toObject", { virtuals: true });

userSchema.pre("save", function () {
    if (!this.isModified("password")) return;
    this.password = bcrypt.hashSync(this.password, 7);
})

userSchema.pre("findOneAndUpdate", function () {
    if (!this._update.password) return;
    this._update.password = bcrypt.hashSync(this._update.password, 7);
});


export const User = mongoose.model('User', userSchema)
