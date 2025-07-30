import bcrypt from 'bcrypt'

export class CredentialService {
    async comparePassword(userPassword: string, passowrdHash: string) {
        return await bcrypt.compare(userPassword, passowrdHash)
    }
}
