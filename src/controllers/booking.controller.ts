import type { Response,Request } from "express";
import z from "zod";
import pool from "../utils/db.js";

export const postBookingController = async(req:Request , res:Response)=>{
    try {
        const requiredBody = z.object({
            carName : z.string(),
            days : z.number(),
            rentPerDay : z.number()
        })

        const parsed = requiredBody.safeParse(req.body)

        if(!parsed.success){
            return res.status(400).json({
                success : false,
                error : "Invalid input"
            })
        }

        const {carName, days, rentPerDay} = parsed.data
        const userId = req.user?.id

        if(!userId){
            return res.status(401).json({
                success: false,
                error: "Unauthorized"
            });
        }

        if(days > 365 || rentPerDay > 2000 || days <=0 || rentPerDay <= 0){
            return res.status(400).json({
                success : false,
                error : "Invalid input"
            })
        }

        const totalCost = days * rentPerDay

        const bookingQuery = `
            INSERT INTO bookings(user_id, car_name, days, rent_per_day, status)
            VALUES ($1, $2, $3, $4, 'booked')
            RETURNING id
        `

        const booking = await pool.query(bookingQuery , [userId, carName, days, rentPerDay])

        res.status(201).json({
            success : true,
            data : {
                message : "Booking created successfully",
                bookingId : booking.rows[0].id,
                totalCost
            }
        })

    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            error : "Internal server error!"
        })
    }
}

export const getBookingController = async(req: Request, res: Response)=>{
    try {

        const requiredQuery = z.object({
            summary : z.enum(['true', 'false']).optional().transform(val=> val === 'true'),
            bookingId : z.coerce.number().optional()
        })

        const parsed = requiredQuery.safeParse(req.query)
        if(!parsed.success){
            return res.status(404).json({
                success : false,
                error : "bookingId not found"
            })
        }

        const {bookingId, summary} = parsed.data

        const userId = req.user?.id

        if(!userId){
            return res.status(401).json({
                success : false,
                error : "User not founf. Please login again!"
            })
        }


        if(summary){
            const getSummaryQuery = `
                SELECT 
                    u.id AS "userId", 
                    u.username, 
                    COUNT(b.id) AS "totalBookings", 
                    COALESCE(SUM(b.days * b.rent_per_day), 0) AS "totalAmountSpent"
                FROM users u 
                LEFT JOIN bookings b
                    ON u.id = b.user_id 
                    AND b.status IN ('booked', 'completed')
                WHERE u.id = $1
                GROUP BY u.id, u.username
            `

            const result = await pool.query(getSummaryQuery, [userId])
            return res.status(200).json({
                success : true,
                data : result.rows[0]
            })
        }

        if(!bookingId){
            return res.status(404).json({
                success : false,
                error : "BookingId not found!"
            })
        }


        const getBookingQuery = `
            SELECT id, car_name, days, rent_per_day, status FROM bookings WHERE id = $1 AND user_id = $2
        `

        const booking = await pool.query(getBookingQuery, [bookingId, userId])

        if(booking.rows.length === 0){
            return res.status(404).json({
                error : "booking not found!",
                success : false
            })
        }

        const totalCost = booking.rows[0].days * booking.rows[0].rent_per_day

        res.status(200).json({
            success : true,
            data : [
                {
                    ...booking.rows[0],
                    totalCost
                }
            ]
        })

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            error: "Internal server error!"
        });
    }
}

export const updateBookingDetails = async(req: Request, res: Response)=>{
    try {
        const bookingId = Number(req.params.bookingId)
        const userId = req.user?.id

        if (!userId) {
            return res.status(401).json({
                success: false,
                error: "Unauthorized"
            });
        }

        if (!bookingId || isNaN(bookingId)) {
            return res.status(400).json({
                success: false,
                error: "Invalid bookingId"
            });
        }

        const requiredBody = z.object({
            carName : z.string().optional(),
            days : z.number().optional(),
            rentPerDay : z.number().optional(),
            status : z.enum(['cancelled', 'completed']).optional()
        })

        const parsed = requiredBody.safeParse(req.body)

        if(!parsed.success){
            return res.status(400).json({
                success : false,
                error : "invalid inputs"
            })
        }

        let {carName, days, rentPerDay, status} = parsed.data

        const searchBookingQuery = `
            SELECT * FROM bookings WHERE id = $1
        `

        const booking = await pool.query(searchBookingQuery, [bookingId])

        if(booking.rows.length === 0){
            return res.status(404).json({
                success: false,
                error : "booking not found!"
            })
        }else if(booking.rows[0].user_id !== userId){
            return res.status(403).json({
                success: false,
                error : "booking does not belong to user"
            })
        }

        if(status && status === 'completed' && booking.rows[0].status === 'cancelled'){
            return res.status(400).json({
                success : false,
                error : "Cancelled bookings cannot be marked as completed"
            })
        }

        const updateBookingQuery = `
            UPDATE bookings 
            SET car_name = $1, rent_per_day = $2, days = $3, status = $4
            WHERE id = $5
            RETURNING id, car_name, days, rent_per_day, status
        `
        carName = carName ?? booking.rows[0].car_name;
        rentPerDay = rentPerDay ?? booking.rows[0].rent_per_day;
        days = days ?? booking.rows[0].days;
        status = status ?? booking.rows[0].status


        const updatedBooking = await pool.query(updateBookingQuery, [carName, rentPerDay, days, status, bookingId])

        const totalCost = (days ?? 0) * (rentPerDay ?? 0)

        res.status(200).json({
            success : true,
            data : {
                message : "Booking updated successfully",
                booking : {...updatedBooking.rows[0], totalCost}
            }
        })

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            error: "Internal server error!"
        });
    }
}

export const deleteBookingDetails = async(req: Request, res: Response)=>{
    try {
        const bookingId = req.params.bookingId
        const userId = req.user?.id

        if(!userId){
            return res.status(401).json({
                success : false,
                error : "Unauthorized!"
            })
        }

        const searchBookingQuery = `
            SELECT * FROM bookings WHERE id = $1
        `

        const booking = await pool.query(searchBookingQuery , [bookingId])

        if(booking.rows.length === 0){
            return res.status(404).json({
                success : false,
                error : "booking not found"
            })
        }else if(booking.rows[0].user_id !== userId){
            return res.status(403).json({
                success : false,
                error : "booking does not belong to user"
            })
        }

        const deleteBookingQuery = `
            DELETE FROM bookings WHERE id = $1 AND user_id = $2
        `

        const deleted = await pool.query(deleteBookingQuery , [bookingId, userId])

        res.status(200).json({
            success : true,
            data : {
                message : "Booking deleted successfully"
            }
        })

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            error: "Internal server error!"
        });
    }
}