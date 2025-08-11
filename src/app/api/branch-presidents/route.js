import { NextResponse } from "next/server";

// Branch presidents data (empty initially)
let branchPresidents = [];

// GET - Fetch all branch presidents (for admin)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const isActive = searchParams.get("active");

    let filteredPresidents = branchPresidents;

    if (isActive === "true") {
      filteredPresidents = branchPresidents.filter(
        (president) => president.is_active
      );
    }

    // Sort by newest first
    filteredPresidents.sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at)
    );

    return NextResponse.json(filteredPresidents);
  } catch (error) {
    console.error("Error fetching branch presidents:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch branch presidents" },
      { status: 500 }
    );
  }
}

// POST - Create new branch president
export async function POST(request) {
  try {
    const presidentData = await request.json();
    const {
      president_name,
      congregation,
      location,
      phone_number,
      email,
      is_active,
    } = presidentData;

    // Validation
    const errors = {};
    if (!president_name?.trim()) errors.president_name = "Name is required";
    if (!congregation?.trim()) errors.congregation = "Congregation is required";
    if (!phone_number?.trim()) errors.phone_number = "Phone is required";
    if (!email?.trim()) errors.email = "Email is required";

    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ success: false, errors }, { status: 400 });
    }

    const newPresident = {
      id: Math.max(...branchPresidents.map((p) => p.id), 0) + 1,
      president_name: president_name.trim(),
      congregation: congregation.trim(),
      location: location?.trim() || "",
      phone_number: phone_number.trim(),
      email: email.trim().toLowerCase(),
      is_active: is_active !== undefined ? is_active : true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    branchPresidents.push(newPresident);

    return NextResponse.json({
      success: true,
      message: "Branch president created successfully",
      id: newPresident.id,
    });
  } catch (error) {
    console.error("Error creating branch president:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create branch president" },
      { status: 500 }
    );
  }
}

// PUT - Update branch president
export async function PUT(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = parseInt(searchParams.get("id"));

    if (!id) {
      return NextResponse.json(
        { success: false, error: "President ID is required" },
        { status: 400 }
      );
    }

    const presidentData = await request.json();
    const {
      president_name,
      congregation,
      location,
      phone_number,
      email,
      is_active,
    } = presidentData;

    // Validation
    const errors = {};
    if (!president_name?.trim()) errors.president_name = "Name is required";
    if (!congregation?.trim()) errors.congregation = "Congregation is required";
    if (!phone_number?.trim()) errors.phone_number = "Phone is required";
    if (!email?.trim()) errors.email = "Email is required";

    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ success: false, errors }, { status: 400 });
    }

    const presidentIndex = branchPresidents.findIndex((p) => p.id === id);
    if (presidentIndex === -1) {
      return NextResponse.json(
        { success: false, error: "Branch president not found" },
        { status: 404 }
      );
    }

    // Update the president
    branchPresidents[presidentIndex] = {
      ...branchPresidents[presidentIndex],
      president_name: president_name.trim(),
      congregation: congregation.trim(),
      location: location?.trim() || "",
      phone_number: phone_number.trim(),
      email: email.trim().toLowerCase(),
      is_active: is_active !== undefined ? is_active : true,
      updated_at: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      message: "Branch president updated successfully",
    });
  } catch (error) {
    console.error("Error updating branch president:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update branch president" },
      { status: 500 }
    );
  }
}

// DELETE - Delete branch president
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = parseInt(searchParams.get("id"));

    if (!id) {
      return NextResponse.json(
        { success: false, error: "President ID is required" },
        { status: 400 }
      );
    }

    const presidentIndex = branchPresidents.findIndex((p) => p.id === id);
    if (presidentIndex === -1) {
      return NextResponse.json(
        { success: false, error: "Branch president not found" },
        { status: 404 }
      );
    }

    // Remove the president
    branchPresidents.splice(presidentIndex, 1);

    return NextResponse.json({
      success: true,
      message: "Branch president deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting branch president:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete branch president" },
      { status: 500 }
    );
  }
}
