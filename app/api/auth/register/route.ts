import { NextRequest, NextResponse } from "next/server";
import { prisma,CreateUser } from "../../../lib/db";
import { CheckTeamExists, CheckUserExists, FindTeamByTeamCode } from "../../../lib/db";
import { generateToken, hashPassword, validatePassword } from "../../../lib/auth";

export async function POST(request: NextRequest) {
    try {
        const { name, email, password, teamCode } = await request.json();
        console.log(`name is :${name}, email is :${email}, password is :${password}`)
        if (!name || !email || !password) {
            return NextResponse.json(
                { error: "name, email or password invalid" },
                { status: 400 }
            );
        }
        // check existing user
        const existingUser = await CheckUserExists(email);
        if (existingUser) {
            return NextResponse.json(
                { error: "User with this email exists" },
                { status: 409 }
            );
        }
        let teamId: string | undefined;

        if (teamCode) {
            const team = await CheckTeamExists(teamCode);

            if (!team) {
                return NextResponse.json(
                    { error: "Please enter a valid Team Code" },
                    { status: 400 }
                );
            }

            const userTeam = await FindTeamByTeamCode(teamCode);
            teamId = userTeam.id;
        }
        const passwordError = validatePassword(password);
        if (passwordError) {
            return NextResponse.json(
                { error: passwordError },
                { status: 400 }
            );
        }
        const hashedPassword = await hashPassword(password);
        const newUser = await CreateUser({
        name,
        email,
        password: hashedPassword,
        teamId
});
        //generate Token
        
        const token = generateToken(newUser.id)

        const response = NextResponse.json(
            {
                user: {
                id:newUser.id,
                name: newUser.name,
                    email: newUser.email,
                    role: newUser.role,
                    teamId: newUser.teamId,
                    team: newUser.teamId,
                    token
                
            }}
        );
        //set cookie:
        response.cookies.set("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge:60*60*24*70,
        })

        return response
    } catch (error) {
            return NextResponse.json(
            { error: `Internal server error:{error}` },
            { status: 500 }
        );
    }
}