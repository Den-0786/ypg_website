import { NextResponse } from "next/server";

export async function POST(request, { params }) {
  try {
    const { id } = params;

    // Restoring team member

    return NextResponse.json({
      success: true,
      message: "Team member restored successfully",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to restore team member" },
      { status: 500 }
    );
  }
}
