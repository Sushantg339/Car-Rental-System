import express from 'express'
import { deleteBookingDetails, getBookingController, postBookingController, updateBookingDetails } from '../controllers/booking.controller.js'

const router = express.Router()

router.post('/', postBookingController)
router.get('/', getBookingController)
router.put('/:bookingId', updateBookingDetails)
router.delete('/:bookingId', deleteBookingDetails)

export default router