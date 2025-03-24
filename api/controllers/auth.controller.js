import User from '../models/user.model.js';
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import createError from '../utils/createError.js';

export const register = async (req, res, next) => {
    try {
        const hash = bcrypt.hashSync(req.body.password, 5);
        const newUser = new User({
            ...req.body,
            password: hash,
        });

        await newUser.save();
        res.status(201).send("user has been created");
    } catch (err) {
        // res.status(500).send("Something went wrong!");
        next(err);
    }

}
export const logout = async (req, res) => {
    res
        .clearCookie("accessToken", {
            sameSite: "none",
            secure: true,
        })
        .status(200)
        .send("User has been logged out");

}