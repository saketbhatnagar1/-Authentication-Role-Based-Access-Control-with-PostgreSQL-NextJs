import { CheckDatabaseConnection } from "../../lib/db";
import { NextResponse } from "next/server";
export async function GET() {
    const isConnected = await CheckDatabaseConnection();
    if (!isConnected) {
        return NextResponse.json({
            status: "error",
            message:"Database connection failed",
        },{status:503})
    } else {
        return NextResponse.json({
            status: "ok",
            message:" connection successfull ",
        },{status:200})
    }
}