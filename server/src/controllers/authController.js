import jwt from 'jsonwebtoken';
import User from "../models/User";
import { generateAccessToken, generateRefreshToken } from "../utils/generateToken";
import asyncHandler from '../middleware/asyncHandler.js';

const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
}

export const register = asyncHandler(async (req, res) => {
    const {username, email, password} = req.body;

    const userExists = await User.findOne({$or: [{email}, {username}]});
    if(userExists){
        return res.status(400).json({message: 'Username or email already in use'});
    }

    const user = await User.create({username, email, password});

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    res.cookie('refreshToken', refreshToken, cookieOptions);
    res.status(201).json({
        accessToken,
        user: {id: user._id, username: user.username, email: user.email, avatar: user.avatar},
    })

})

export const login = asyncHandler(async (req, res) => {
    const {email, password} = req.body;

    const user = await User.findOne({email}).select('+password');
    if(!user || !(user.matchPassword(password))){
        return res.status(401).json({message: 'Invalid email or password'});
    }

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    res.cookie('refreshToken', refreshToken, cookieOptions);
    res.json({
        accessToken,
        user: {id: user._id, username: user.user.username, email: user.email, avatar: user.avatar},
    })
})

export const refresh = asyncHandler(async (req, res) => {
    const token = req.cookies.refreshToken;
    if(!token){
        return res.status(401).json({message: 'No refresh token'});
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
        const accessToken = generateAccessToken(decoded.id);
        res.json({accessToken});
    } catch (err) {
        return res.status(401).json({message: 'Invalid or expired refresh token'});
    }
})

export const logout = (req, res) => {
    res.clearCookie('refreshToken', cookieOptions);
    res.json({message: 'Logged out'});
}

export const getMe = asyncHandler(async (req, res) => {
    res.json({user: req.user});
})