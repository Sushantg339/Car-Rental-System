import express from 'express'
import authRoutes from './auth.routes.js'
import bookingRoutes from './booking.routes.js'
import { authMiddleware } from '../middlewares/auth.middleware.js'

const router = express.Router()

router.use('/auth' , authRoutes)
router.use('/bookings' ,authMiddleware, bookingRoutes)


export default router