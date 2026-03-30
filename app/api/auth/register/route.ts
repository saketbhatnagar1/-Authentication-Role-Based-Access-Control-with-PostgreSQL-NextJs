import { NextRequest, NextResponse } from "next/server";
export async function POST(request: NextRequest) {
    try {
        const { name, email, password } = await request.json()
        //validate required fields

        if (!name || !email || !password) {
            return NextResponse.json({
                error:"name email or password invalid"
            })
        }
    } catch (error) {
        

    }

}