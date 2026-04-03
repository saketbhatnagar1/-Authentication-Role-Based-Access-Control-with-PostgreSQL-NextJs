import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "../../../../lib/auth";
import { Prisma, Role,User } from "@prisma/client";
import { prisma } from "../../../../lib/db";

//gets the users based on role and teamid provided in queryParams
export async function GET(request:NextRequest) {
    
    try {
        const user = await getCurrentUser();
        if (!user)
        {
            return NextResponse.json(
                {
                    error: "You are not authorized to access user information",
                }, {status:500}
            )
        }
        const searchParams = request.nextUrl.searchParams;//?role="" or ?teamId=""
        const teamId = searchParams.get("teamId")
        const role = searchParams.get("role")

        const where: Prisma.UserWhereInput = {}
        if (user.role == Role.ADMIN)
        {
            //admin can see all users
        }
        else if (user.role === Role.MANAGER)
        {
                //can see users in their team or cross team users, but not cross team managers
            where.OR = [{ teamId: user.teamId }, {role:Role.USER}]//[users in team,users in cross team]
        }
        else {
            //regular users can only see members of their team

            where.teamId==user.teamId
            where.role = { not: Role.ADMIN }
            
        }
        if (teamId) {
            where.teamId = teamId
        
        }
        if (role) {
            where.role=role as Role
        }

        const users = prisma.user.findMany(
            {
                where,
                select: {
                    id:true,
                    email: true,
                    name: true,
                    role: true,
                    Team: {
                        select: {
                            id:true,
                            name: true,
                            
                        }
                    },
                    createdAt: true,
                    
                },
                orderBy: {createdAt:"desc"}
         })
        return NextResponse.json({
            users
        })
        
    } catch (error)
    {
        console.log(error)
        return NextResponse.json({
            message: "Internal Server Error"
            
        }, {status:500})
    }


}