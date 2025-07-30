import { DataSource } from 'typeorm'
import { AppDataSource } from '../../src/config/data-source'

describe('POST /auth/login', () => {
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
        it.todo('should give 200 status code')
        it.todo('should login the user')
    })
    describe('Fields are missing', () => {})
    describe('Fields are not in proper format', () => {})
})
