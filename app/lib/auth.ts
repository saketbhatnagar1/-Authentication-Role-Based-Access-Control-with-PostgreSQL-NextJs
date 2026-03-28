//helper function in authenticaiton
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
export const hashPassword = async (password: string): Promise<string> => {
    return bcrypt.hash(password,12)
}

export const verifyPassword = async (password: string,
    hashedPassword:string
): Promise<boolean> => {
    return bcrypt.compare(password,hashedPassword)
}

const JWT_SECRET = process.env.JWT_SECRET!
export const generateToken = (userId:string):string => {
    return jwt.sign({ userId }, JWT_SECRET, {expiresIn:"7d"})
}

export const verifyToken = (token: string ): { userId: string }=> {
    return jwt.verify(token, JWT_SECRET) as { userId: string };
}