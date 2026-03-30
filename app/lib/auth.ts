//helper function in authenticaiton
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { prisma } from "./db"
import { cookies } from "next/headers"
import { User } from "../types"

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

//helper Funciton to check logged in users
export const getCurrentUser = async ():Promise<User|null> => { 
    try {
        const cookiesStore = await cookies();
        const token = cookiesStore.get("token")?.value
        if (!token) return null
        const decode = verifyToken(token)
        const userFromDb = await prisma.user.findUnique({
        where:{id:decode.userId}    
        })
        if (!userFromDb) return null
        const { password, ...user } = userFromDb
        return user as User
        
    } catch (error) {
        console.log(error)
        return null
    }
}