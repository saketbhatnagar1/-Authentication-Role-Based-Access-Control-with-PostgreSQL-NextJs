import { NextRequest, NextResponse } from "next/server";
import { CheckUserExists, FindUserByEmail } from "../../../lib/db";
import { CheckPassword, generateToken } from "../../../lib/auth";
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
        const userFromDb = await FindUserByEmail(email)

        //verify password
        const isValid = CheckPassword(password, userFromDb.password);
        if(!isValid)
        {
            return NextResponse.json(
                { error: "Incorrect Password" },
                { status: 401 }
            )
        }

        const token = generateToken(userFromDb.id)
        

        const response = NextResponse.json({
  message: "Login successful"
});

response.cookies.set("token", token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  path: "/",
});

return response;
    }
    catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}