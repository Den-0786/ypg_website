import { NextResponse } from "next/server";

// Ministry registrations data (empty initially)
let ministryRegistrations = [];

export async function GET(request) {
  try {
    return NextResponse.json({
      success: true,
      ministry: ministryRegistrations,
    });
  } catch (error) {
    console.error("Error in ministry GET:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch ministry registrations" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();

    const newRegistration = {
      id: ministryRegistrations.length + 1,
      ...body,
      created_at: new Date().toISOString(),
    };

    ministryRegistrations.push(newRegistration);

    return NextResponse.json({
      success: true,
      registration: newRegistration,
      message: "Ministry registration recorded successfully",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to record ministry registration" },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    const registrationIndex = ministryRegistrations.findIndex(
      (reg) => reg.id === id
    );
    if (registrationIndex === -1) {
      return NextResponse.json(
        { success: false, error: "Registration not found" },
        { status: 404 }
      );
    }

    ministryRegistrations[registrationIndex] = {
      ...ministryRegistrations[registrationIndex],
      ...updateData,
    };

    return NextResponse.json({
      success: true,
      registration: ministryRegistrations[registrationIndex],
      message: "Registration updated successfully",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to update registration" },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = parseInt(searchParams.get("id"));

    const registrationIndex = ministryRegistrations.findIndex(
      (reg) => reg.id === id
    );
    if (registrationIndex === -1) {
      return NextResponse.json(
        { success: false, error: "Registration not found" },
        { status: 404 }
      );
    }

    ministryRegistrations.splice(registrationIndex, 1);

    return NextResponse.json({
      success: true,
      message: "Registration deleted successfully",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to delete registration" },
      { status: 500 }
    );
  }
}
