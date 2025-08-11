import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    // In a real application, you might want to invalidate server-side sessions
    // For now, we'll just return a success response since logout is handled client-side

    return NextResponse.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to logout" },
      { status: 500 }
    );
  }
}


