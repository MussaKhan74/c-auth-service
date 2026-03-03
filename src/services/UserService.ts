import { Repository } from 'typeorm'
import bcrypt from 'bcrypt'
import { User } from '../entity/User'
import { UserData } from '../types'
import createHttpError from 'http-errors'

export class UserService {
    constructor(private userRepository: Repository<User>) {}
    async create({ firstName, lastName, email, password, role }: UserData) {
        const user = await this.userRepository.findOne({ where: { email } })

        if (user) {
            const err = createHttpError(400, 'Email already exist!')
            throw err
        }
        // Hash the password
        const saltRounds = 10
        const hashedPassowrd = await bcrypt.hash(password, saltRounds)

        try {
            return await this.userRepository.save({
                firstName,
                lastName,
                email,
                password: hashedPassowrd,
                role,
            })
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
            const err = createHttpError(
                500,
                'Failed to store the data in the database',
            )
            throw err
        }
    }
    async findByEmail(email: string) {
        return await this.userRepository.findOne({
            where: {
                email,
            },
        })
    }
    async findById(id: number) {
        return await this.userRepository.findOne({
            where: {
                id,
            },
        })
    }
}
