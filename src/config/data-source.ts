import 'reflect-metadata'
import { DataSource } from 'typeorm'
import { User } from '../entity/User'
import { Config } from '.'

export const AppDataSource = new DataSource({
    type: 'postgres',
    url: Config.DB_URL,
    ssl: true,
    // Don't use this in production
    synchronize: Config.NODE_ENV === 'test' || Config.NODE_ENV === 'dev',
    logging: false,
    entities: [User],
    migrations: [],
    subscribers: [],
})
