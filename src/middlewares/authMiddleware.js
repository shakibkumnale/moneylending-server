// middleware/authMiddleware.js
import jwt from 'jsonwebtoken';
import {User} from '../models/User.js'
import {AsyncHandler} from '../utils/AsyncHandler.js'
import { ApiError } from '../utils/ApiError.js';

export const verifyToken =AsyncHandler( async (req, res, next) => { 
  try {
    const token = req.cookies?.accessToken  || req.header("Authorization")?.replace("Bearer ", "")
    ;
    console.log("hello",req.cookies);
    
    if (!token) {
        throw new ApiError(401, "Unauthorized request")
    }

    const verifyUser = jwt.verify(token, process.env.JWT_SECRET);
    console.log(verifyUser)

    const user = await User.findOne({ _id: verifyUser.userId }).select({ Password: 0, tokens: 0 });
    if (!user) {
            
        throw new ApiError(401, "Invalid Access Token")
    }
    // console.log(user)
        req.user = user // Exclude sensitive data like password
        next();
    
} catch (error) {
throw new ApiError(401, error?.message || "Invalid access token")

    
}

});
