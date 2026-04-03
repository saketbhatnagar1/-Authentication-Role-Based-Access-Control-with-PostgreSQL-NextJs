//give information about a logged in user

import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "../../../lib/auth";

export async function GET(request:NextRequest) {
    
    try {
        const user = await getCurrentUser()

        if (!user) {
            return NextResponse.json({
                error: "You are Not Authenticated, Kindly Login"
            }, {
                status: 401
            })
        }
        return NextResponse.json({
            user
        })

    } catch (error) {
        console.error("Error:", error)
        return NextResponse.json({
            message:"Internal Server Error please try again"
        }, {
            status:500
        })
    }
}