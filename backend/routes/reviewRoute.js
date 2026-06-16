import express from 'express'
import { addReview, deleteReview, adminDeleteReview, getAllReviews } from '../controllers/reviewController.js'
import authUser from '../middleware/auth.js'
import adminAuth from '../middleware/adminAuth.js'

const reviewRouter = express.Router()

reviewRouter.post('/add', authUser, addReview)
reviewRouter.post('/delete', authUser, deleteReview)
reviewRouter.post('/admin-delete', adminAuth, adminDeleteReview)
reviewRouter.get('/all', adminAuth, getAllReviews)

export default reviewRouter
