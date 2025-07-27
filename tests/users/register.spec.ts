import request from 'supertest'
import app from '../../src/app'
import { DataSource } from 'typeorm'
import { User } from '../../src/entity/User'
import { AppDataSource } from '../../src/config/data-source'
import { Roles } from '../../src/constants'
import { isJwt } from '../utils'

describe('POST /auth/register', () => {
    let connection: DataSource

    beforeAll(async () => {
        connection = await AppDataSource.initialize()
    })

    beforeEach(async () => {
        // Database truncate
        await connection.dropDatabase()
        await connection.synchronize()
    }, 30000)

    afterAll(async () => {
        await connection.destroy()
    })

    describe('Given all fields', () => {
        it('should return the 201 status code', async () => {
            // AAA
            // Arrange
            const userData = {
                firstName: 'Mussa',
                lastName: 'Khan',
                email: 'MarkeLoof@gmail.com',
                password: 'secret',
            }
            // Act
            const response = await request(app)
                .post('/auth/register')
                .send(userData)
            // Assert
            expect(response.statusCode).toBe(201)
        })

        it('it should return valid json response', async () => {
            // AAA
            // Arrange
            const userData = {
                firstName: 'Mussa',
                lastName: 'Khan',
                email: 'MarkeLoof@gmail.com',
                password: 'secret',
            }
            // Act
            const response = await request(app)
                .post('/auth/register')
                .send(userData)
            // Assert application/json utf-8
            expect(
                (response.headers as Record<string, string>)['content-type'],
            ).toEqual(expect.stringContaining('json'))
        })

        it('should persist the user in the database', async () => {
            // AAA
            // Arrange
            const userData = {
                firstName: 'Mussa',
                lastName: 'Khan',
                email: 'MarkeLoof@gmail.com',
                password: 'secret',
            }

            // Act
            await request(app).post('/auth/register').send(userData)

            // Assert
            const userRepository = connection.getRepository(User)
            const users = await userRepository.find()

            expect(users).toHaveLength(1)
            expect(users[0].firstName).toBe(userData.firstName)
            expect(users[0].lastName).toBe(userData.lastName)
            expect(users[0].email).toBe(userData.email)
        })

        it('should return an id of the created user', async () => {
            // AAA
            // Arrange
            const userData = {
                firstName: 'Mussa',
                lastName: 'Khan',
                email: 'MarkeLoof@gmail.com',
                password: 'secret',
            }

            // Act
            const response = await request(app)
                .post('/auth/register')
                .send(userData)

            // Assert
            const userRepository = connection.getRepository(User)
            const users = await userRepository.find()

            expect(response.body).toHaveProperty('id')
            expect((response.body as Record<string, string>).id).toBe(
                users[0].id,
            )
        })
        it('should have assigned a customer role', async () => {
            // AAA
            // Arrange
            const userData = {
                firstName: 'Mussa',
                lastName: 'Khan',
                email: 'MarkeLoof@gmail.com',
                password: 'secret',
            }

            // Act
            await request(app).post('/auth/register').send(userData)

            // Assert
            const userRepository = connection.getRepository(User)
            const users = await userRepository.find()

            expect(users[0]).toHaveProperty('role')
            expect(users[0].role).toBe(Roles.CUSTOMER)
        })
        it('should have hashed password in the database', async () => {
            // AAA
            // Arrange
            const userData = {
                firstName: 'Mussa',
                lastName: 'Khan',
                email: 'MarkeLoof@gmail.com',
                password: 'secret',
            }

            // Act
            await request(app).post('/auth/register').send(userData)

            // Assert
            const userRepository = connection.getRepository(User)
            const users = await userRepository.find()
            // console.log(users[0].password)
            expect(users[0].password).not.toBe(userData.password)
            expect(users[0].password).toHaveLength(60)
            expect(users[0].password).toMatch(/^\$2b\$\d+\$/)
        })
        it('should return 400 status code if email already exists', async () => {
            // AAA
            // Arrange
            const userData = {
                firstName: 'Mussa',
                lastName: 'Khan',
                email: 'MarkeLoof@gmail.com',
                password: 'secret',
            }

            const userRepository = connection.getRepository(User)
            await userRepository.save({ ...userData, role: Roles.CUSTOMER })

            // Act
            const response = await request(app)
                .post('/auth/register')
                .send(userData)

            const users = await userRepository.find()

            // Assert
            expect(response.status).toBe(400)
            expect(users).toHaveLength(1)
        })
        it('should return the access token and refresh token inside a cookie', async () => {
            const userData = {
                firstName: 'Mussa',
                lastName: 'Khan',
                email: 'MarkeLoof@gmail.com',
                password: 'secret',
            }

            // Act
            const response = await request(app)
                .post('/auth/register')
                .send(userData)

            interface Headers {
                ['set-cookie']?: string[]
            }

            // Assert
            let accessToken: string | null = null
            let refreshToken: string | null = null
            const cookies = (response.headers as Headers)['set-cookie'] || []

            cookies.forEach((cookie) => {
                if (cookie.startsWith('accessToken=')) {
                    accessToken = cookie.split(';')[0].split('=')[1]
                }

                if (cookie.startsWith('refreshToken=')) {
                    refreshToken = cookie.split(';')[0].split('=')[1]
                }
            })

            expect(accessToken).not.toBeNull()
            expect(refreshToken).not.toBeNull()

            expect(isJwt(accessToken)).toBeTruthy()
            expect(isJwt(refreshToken)).toBeTruthy()
        })
    })
    describe('Fields are missing', () => {
        it('should return 400 status code if email field is missing', async () => {
            // AAA
            // Arrange
            const userData = {
                firstName: 'Mussa',
                lastName: 'Khan',
                email: '',
                password: 'secret',
            }

            // Act
            const response = await request(app)
                .post('/auth/register')
                .send(userData)

            // Assert
            expect(response.status).toBe(400)

            const userRepository = connection.getRepository(User)
            const users = await userRepository.find()

            expect(users).toHaveLength(0)
        })
        it.todo('should return 400 status code if firstName is missing')
        it.todo('should return 400 status code if lastName is missing')
        it.todo('should return 400 status code if password is missing')
    })

    describe('Fields are not in proper format', () => {
        it('should trim the email field', async () => {
            // AAA
            // Arrange
            const userData = {
                firstName: 'Mussa',
                lastName: 'Khan',
                email: ' MarkeLoof@gmail.com ',
                password: 'secret',
            }

            // Act
            await request(app).post('/auth/register').send(userData)
            const userRepository = connection.getRepository(User)
            const users = await userRepository.find()

            // Assert
            const user = users[0]

            expect(user.email).toBe(userData.email.trim())
        })
        it.todo('should return 400 if email is not a valid email')
        it.todo(
            'should return 400 if passowrd length is less than 8 characters',
        )
        it.todo(
            'should return 400 if passowrd length is less than 8 characters',
        )
    })
})
