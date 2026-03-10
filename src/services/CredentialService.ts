import bcrypt from 'bcryptjs'

export class CredentialService {
    async comparePassword(userPassword: string, passowrdHash: string) {
        return await bcrypt.compare(userPassword, passowrdHash)
    }
}
