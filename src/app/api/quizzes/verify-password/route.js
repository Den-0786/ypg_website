import { NextResponse } from "next/server";

// Simple quiz password verification - works with existing ypg_db system
export async function POST(request) {
  try {
    const body = await request.json();
    const { quizId, password } = body;

    // Validate input
    if (!quizId || !password) {
      return NextResponse.json(
        { success: false, error: "Quiz ID and password are required" },
        { status: 400 }
      );
    }

    // Forward the request to the ypg_db system
    const response = await fetch(
      "http://localhost:8000/api/quizzes/verify-password/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ quizId, password }),
      }
    );

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to verify quiz password" },
      { status: 500 }
    );
  }
}



