import express, { NextFunction, Response } from 'express'
import { AppDataSource } from '../config/data-source'
import logger from '../config/logger'
import authenticate from '../middlewares/authenticate'
import { canAccess } from '../middlewares/canAccess'
import { Roles } from '../constants'
import { UserController } from '../controllers/UserController'
import { UserService } from '../services/UserService'
import { User } from '../entity/User'
import { AuthRequest } from '../types'
import updateUserValidator from '../validator/update-user-validator'
import { CreateUserRequest, UpdateUserRequest } from '../types'
import createUserValidator from '../validator/create-user-validator'

const router = express.Router()

const userRepository = AppDataSource.getRepository(User)
const userService = new UserService(userRepository)
const userController = new UserController(userService, logger)

router.post(
    '/',
    authenticate,
    canAccess([Roles.ADMIN]),
    createUserValidator,
    (req: CreateUserRequest, res: Response, next: NextFunction) =>
        userController.create(req, res, next),
)

router.patch(
    '/:id',
    authenticate,
    canAccess([Roles.ADMIN]),
    updateUserValidator,
    (req: UpdateUserRequest, res: Response, next: NextFunction) =>
        userController.update(req, res, next),
)

router.get(
    '/',
    authenticate,
    canAccess([Roles.ADMIN]),
    (req, res, next: NextFunction) => userController.getAll(res, next),
)

router.get('/:id', authenticate, canAccess([Roles.ADMIN]), (req, res, next) =>
    userController.getOne(req as AuthRequest, res, next),
)

router.delete(
    '/:id',
    authenticate,
    canAccess([Roles.ADMIN]),
    (req, res, next) => userController.destroy(req as AuthRequest, res, next),
)

export default router
