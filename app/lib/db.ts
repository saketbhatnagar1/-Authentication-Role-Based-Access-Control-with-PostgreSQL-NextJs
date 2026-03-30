import { PrismaClient, User,Team } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

console.log("DATABASE_URL:", process.env.DATABASE_URL ? `✓ loaded ${process.env.DATABASE_URL}` : "✗ missing")

export const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL })
})

export async function CheckDatabaseConnection(): Promise<boolean>{
    try {
        await prisma.$queryRaw`SELECT 1`;
        return true;
    } catch (error) {
        console.log(`Database connection failed: ${error}`)
        return false;
    }
}

export async function CheckUserExists(email:string): Promise<boolean>{
    
    const existingUser = await prisma.user.findUnique({
        where:{email:email} 
    })
    if (existingUser) {
        return true
    } else {
        return false
    }
}

export async function findUserByEmail(email: string): Promise<User> {
    const user = await prisma.user.findUnique({
        where: { email }
    });

    if (!user) {
        throw new Error("User not found");
    }

    return user;
}

export async function checkTeamExists(code: string):Promise<boolean>{
    
    const TeamId = await prisma.team.findUnique(
        {where:{code:code}}
    )
    if (TeamId) {
        return true
    } else {
        return false
    }

}

export async function findTeamById(id: string): Promise<Team> {
    const team = await prisma.team.findUnique({
        where: { id: id }
    });

    if (!team) {
        throw new Error("team not found");
    }

    return team;
}