import { PrismaClient } from "@prisma/client/extension"
export const prisma = new PrismaClient()

export async function CheckDatabaseConnection(): Promise<boolean>{
    try {
        await prisma.$queryRaw`Select 1`;
        return true;
    } catch (error) {
        console.log(`database connection failed : ${error}`)
    }
    return false;
}