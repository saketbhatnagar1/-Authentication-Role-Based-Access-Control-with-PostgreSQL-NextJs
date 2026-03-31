import { NextRequest, NextResponse } from "next/server";
import { CheckUserExists, FindUserByEmail } from "../../../lib/db";
import { CheckPassword } from "../../../lib/auth";
export async function POST(request:NextRequest) {

    try {
        const { email, password } = await request.json()
        
        //validate email on FE

        //check if email exists:
        const emailExists = await CheckUserExists(email)
        if (!emailExists)
        {
            return NextResponse.json(
                { error: "User with this email does not exist" },
                { status: 409 }
            );
        }
        const user = await FindUserByEmail(email)

        //verify password
        const isValid = CheckPassword(password, user.password);
        if(!isValid)
        {
            return NextResponse.json(
                { error: "Incorrect Password" },
                { status: 401 }
            )
        }

        return NextResponse.json({
            message: "Logged in successfully",
        })
    }
    catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}