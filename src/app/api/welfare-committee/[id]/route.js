import { NextResponse } from "next/server";
import pool from "@/lib/database.js";

// GET - Fetch single welfare committee member
export async function GET(request, { params }) {
  try {
    const { id } = params;

    const result = await pool.query(
      "SELECT * FROM welfare_committee WHERE id = $1 AND deleted_at IS NULL",
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: "Committee member not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      member: result.rows[0],
    });
  } catch (error) {
    console.error("Error fetching welfare committee member:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch committee member" },
      { status: 500 }
    );
  }
}

// PUT - Update welfare committee member
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const formData = await request.formData();

    const name = formData.get("name");
    const email = formData.get("email");
    const phone = formData.get("phone");
    const position = formData.get("position");
    const congregation = formData.get("congregation");
    const picture = formData.get("picture");

    // Validation
    if (!name || !email || !phone || !position || !congregation) {
      return NextResponse.json(
        { success: false, error: "All fields are required" },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid email address" },
        { status: 400 }
      );
    }

    // Phone validation
    const phoneRegex = /^(\+233|0)[0-9]{9}$/;
    if (!phoneRegex.test(phone)) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid phone number" },
        { status: 400 }
      );
    }

    // Check if email already exists for other members
    const existingMember = await pool.query(
      "SELECT id FROM welfare_committee WHERE email = $1 AND id != $2 AND deleted_at IS NULL",
      [email, id]
    );

    if (existingMember.rows.length > 0) {
      return NextResponse.json(
        { success: false, error: "Email already exists" },
        { status: 400 }
      );
    }

    // Get current member data
    const currentMember = await pool.query(
      "SELECT picture FROM welfare_committee WHERE id = $1 AND deleted_at IS NULL",
      [id]
    );

    if (currentMember.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: "Committee member not found" },
        { status: 404 }
      );
    }

    let picturePath = currentMember.rows[0].picture;
    if (picture && picture.size > 0) {
      // In production, you would save to cloud storage
      picturePath = `/uploads/welfare-committee/${Date.now()}-${picture.name}`;
    }

    const result = await pool.query(
      `UPDATE welfare_committee 
       SET name = $1, email = $2, phone = $3, position = $4, congregation = $5, picture = $6, updated_at = CURRENT_TIMESTAMP
       WHERE id = $7 AND deleted_at IS NULL
       RETURNING *`,
      [name, email, phone, position, congregation, picturePath, id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: "Committee member not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      member: result.rows[0],
      message: "Committee member updated successfully",
    });
  } catch (error) {
    console.error("Error updating welfare committee member:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update committee member" },
      { status: 500 }
    );
  }
}

// DELETE - Delete welfare committee member (soft or hard delete)
export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    const { hardDelete } = await request.json();

    if (hardDelete) {
      // Hard delete - permanently remove from database
      const result = await pool.query(
        "DELETE FROM welfare_committee WHERE id = $1 RETURNING *",
        [id]
      );

      if (result.rows.length === 0) {
        return NextResponse.json(
          { success: false, error: "Committee member not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        message: "Committee member permanently deleted",
      });
    } else {
      // Soft delete - mark as deleted
      const result = await pool.query(
        "UPDATE welfare_committee SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1 AND deleted_at IS NULL RETURNING *",
        [id]
      );

      if (result.rows.length === 0) {
        return NextResponse.json(
          { success: false, error: "Committee member not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        message: "Committee member removed successfully",
      });
    }
  } catch (error) {
    console.error("Error deleting welfare committee member:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete committee member" },
      { status: 500 }
    );
  }
}
