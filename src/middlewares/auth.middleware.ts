import type{  NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import pool from '../utils/db.js';

declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                username: string;
            };
        }
    }
}


export const authMiddleware = async(req : Request , res : Response , next : NextFunction)=>{
    try {
        const authHeader = req.headers.authorization as string

        if(!authHeader){
            return res.status(401).json({
                success:false,
                error : "Authorization header missing"
            })
        }

        const token = authHeader.split(' ')[1]

        if(!token){
            return res.status(401).json({
                success:false,
                error : "Token missing after Bearer"
            })
        }

        const decoded = jwt.verify(token , process.env.JWT_SECRET as string) as jwt.JwtPayload
        const {id, username} = decoded

        const userExistQuery = `
            SELECT * FROM users WHERE id = $1 AND username = $2
        `

        const user = await pool.query(userExistQuery , [id, username])

        if(user.rows.length === 0){
            return res.status(401).json({
                success:false,
                error:"Invalid Token"
            })
        }

        req.user = {
            id,
            username
        }

        next()
    } catch (error) {
        console.log(error)
        res.status(401).json({
            success:false,
            error :'Unauthorized or token expired!'
        })
    }
}