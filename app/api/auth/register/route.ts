import { NextRequest, NextResponse } from "next/server";
import { prisma,CreateUser } from "../../../lib/db";
import { CheckTeamExists, CheckUserExists, FindTeamByTeamCode } from "../../../lib/db";
import { hashPassword, validatePassword } from "../../../lib/auth";

export async function POST(request: NextRequest) {
    try {
        const { name, email, password, teamCode } = await request.json();

        
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

        return NextResponse.json(
            { message: "User created successfully", user: newUser },
            { status: 201 }
        );

    } catch (error) {
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}