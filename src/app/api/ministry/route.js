import { NextResponse } from "next/server";

// Mock database - in production, this would be a real database
let ministryRegistrations = [
  {
    id: 1,
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "+233 24 123 4567",
    congregation: "Emmanuel Congregation Ahinsan",
    ministry: "Y-Singers 🎤",
    age: 25,
    message:
      "I'm passionate about working with young people and leading worship through music",
    created_at: "2024-03-10T14:30:00Z",
  },
  {
    id: 2,
    name: "Sarah Smith",
    email: "sarah.smith@example.com",
    phone: "+233 20 987 6543",
    congregation: "Grace Presbyterian Church",
    ministry: "Y-Media 🎥",
    age: 28,
    message:
      "I love creating visual content and managing social media for the church",
    created_at: "2024-03-08T10:15:00Z",
  },
  {
    id: 3,
    name: "Mike Johnson",
    email: "mike.johnson@example.com",
    phone: "+233 26 555 1234",
    congregation: "Bethel Congregation",
    ministry: "Evangelism & Prayer Team 🙏",
    age: 32,
    message: "I have experience in outreach and prayer ministry",
    created_at: "2024-03-05T16:45:00Z",
  },
];

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
