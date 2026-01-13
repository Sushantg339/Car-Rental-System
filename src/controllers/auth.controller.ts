import type {Request, Response} from 'express'
import z from 'zod'
import pool from '../utils/db.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

export const signupController = async(req:Request  , res : Response)=>{
    try {
        const requiredBody = z.object({
            username : z.string(),
            password : z.string().min(6)
        })

        const parsed = requiredBody.safeParse(req.body)

        if(!parsed.success){
            return res.status(400).json({
                success:false,
                error:"Invalid Input"
            })
        }

        const {username , password} = parsed.data

        const userExistQuery = `
            SELECT * FROM USERS WHERE username = $1
        `

        const user = await pool.query(userExistQuery , [username])
        if(user.rows.length > 0){
            return res.status(401).json({
                success:false,
                error:"Username already exists!"
            })
        }


        const hashedPassword = await bcrypt.hash(password,10)
        const createUserQuery = `
            INSERT INTO users (username, password)
            VALUES ($1, $2)
            RETURNING id, username
        `

        const newUser = await pool.query(createUserQuery , [username , hashedPassword])

        res.status(201).json({
            success: true,
            data: {
                "message":"User created successfully",
                "userId": newUser.rows[0].id
            }
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            success:false,
            error:"Internal server error!"
        })
    }
}


export const loginController = async(req : Request , res:Response)=>{
    try {
        const requiredBody = z.object({
            username : z.string(),
            password : z.string().min(6)
        })

        const parsed = requiredBody.safeParse(req.body)

        if(!parsed.success){
            return res.status(400).json({
                success:false,
                error:"Invalid Input"
            })
        }

        const {username , password } = parsed.data

        const userExistQuery = `
            SELECT * FROM USERS WHERE username = $1
        `
        const user = await pool.query(userExistQuery , [username])

        if(!(user.rows.length > 0)){
            return res.status(401).json({
                success:false,
                error:"Username does not exists!"
            })
        }

        const isPasswordValid = await bcrypt.compare(password , user.rows[0].password)

        if(!isPasswordValid){
            return res.status(401).json({
                success:false,
                error:"Incorrect Password. Please try again!"
            })
        }

        const token = jwt.sign({id : user.rows[0].id, username : user.rows[0].username}, process.env.JWT_SECRET as string , {expiresIn : '7d'})
        
        res.status(200).json({
            success: true,
            data: {
                "message":"Login successful",
                "token": token
            }
        })

    } catch (error) {
        console.log(error)
        res.status(500).json({
            success:false,
            error:"Internal server error!"
        })
    }
}