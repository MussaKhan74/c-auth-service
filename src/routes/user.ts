import express, { NextFunction } from 'express'
import { AppDataSource } from '../config/data-source'
import logger from '../config/logger'
import authenticate from '../middlewares/authenticate'
import { canAccess } from '../middlewares/canAccess'
import { Roles } from '../constants'
import { UserController } from '../controllers/UserController'
import { UserService } from '../services/UserService'
import { User } from '../entity/User'

const router = express.Router()

const userRepository = AppDataSource.getRepository(User)
const userService = new UserService(userRepository)
const userController = new UserController(userService, logger)

router.post('/', authenticate, canAccess([Roles.ADMIN]), (req, res, next) =>
    userController.create(req, res, next),
)
router.patch('/:id', authenticate, canAccess([Roles.ADMIN]), (req, res, next) =>
    userController.update(req, res, next),
)
router.get(
    '/',
    authenticate,
    canAccess([Roles.ADMIN]),
    (req, res, next: NextFunction) => userController.getAll(res, next),
)

export default router
