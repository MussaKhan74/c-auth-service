import { DataSource } from 'typeorm'
import { AppDataSource } from '../../src/config/data-source'
import request from 'supertest'
import app from '../../src/app'
import { Tenant } from '../../src/entity/Tenant'

describe('POST /tenants', () => {
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
        it('should return a 201 status code', async () => {
            const tenantData = {
                name: 'Tenant name',
                address: 'Tenant address',
            }

            const response = await request(app)
                .post('./tenants')
                .send(tenantData)

            expect(response.statusCode).toBe(201)
        })
        it('should create a tenant in database', async () => {
            const tenantData = {
                name: 'Tenant name',
                address: 'Tenant address',
            }

            await request(app).post('./tenants').send(tenantData)

            const tenanRepository = connection.getRepository(Tenant)
            const tenants = await tenanRepository.find()

            expect(tenants[0]).toHaveLength(1)
            expect(tenants[0].name).toBe(tenantData.name)
            expect(tenants[0].address).toBe(tenantData.address)
        })
    })
})
