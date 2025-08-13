import { NextResponse } from "next/server";
import pool from "@/lib/database.js";

// GET - Fetch branch presidents
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const isActive = searchParams.get("isActive");

    let query = "SELECT * FROM branch_presidents";
    let params = [];

    if (isActive !== null) {
      query += " WHERE is_active = $1";
      params.push(isActive === "true");
    }

    query += " ORDER BY congregation ASC";

    const result = await pool.query(query, params);

    return NextResponse.json({
      success: true,
      presidents: result.rows,
      total: result.rows.length,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch branch presidents" },
      { status: 500 }
    );
  }
}

// POST - Create new branch president
export async function POST(request) {
  try {
    const data = await request.json();

    // Validation
    const errors = {};
    if (!data.president_name?.trim())
      errors.president_name = "President name is required";
    if (!data.congregation?.trim())
      errors.congregation = "Congregation is required";
    if (!data.phone_number?.trim())
      errors.phone_number = "Phone number is required";

    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ success: false, errors }, { status: 400 });
    }

    const insertQuery = `
      INSERT INTO branch_presidents (
        president_name, congregation, location, phone_number, email, is_active
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;

    const insertParams = [
      data.president_name,
      data.congregation,
      data.location || "",
      data.phone_number,
      data.email || "",
      data.is_active !== false, // Default to true
    ];

    const result = await pool.query(insertQuery, insertParams);
    const newPresident = result.rows[0];

    return NextResponse.json({
      success: true,
      president: newPresident,
      message: "Branch president created successfully",
    });
  } catch (error) {
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

    const data = await request.json();

    // Check if president exists
    const checkResult = await pool.query(
      "SELECT * FROM branch_presidents WHERE id = $1",
      [id]
    );

    if (checkResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: "Branch president not found" },
        { status: 404 }
      );
    }

    const updateQuery = `
      UPDATE branch_presidents SET
        president_name = $1,
        congregation = $2,
        location = $3,
        phone_number = $4,
        email = $5,
        is_active = $6,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $7
      RETURNING *
    `;

    const updateParams = [
      data.president_name,
      data.congregation,
      data.location || "",
      data.phone_number,
      data.email || "",
      data.is_active !== false,
      id,
    ];

    const result = await pool.query(updateQuery, updateParams);
    const updatedPresident = result.rows[0];

    return NextResponse.json({
      success: true,
      president: updatedPresident,
      message: "Branch president updated successfully",
    });
  } catch (error) {
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

    const result = await pool.query(
      "DELETE FROM branch_presidents WHERE id = $1 RETURNING id",
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: "Branch president not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Branch president deleted successfully",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to delete branch president" },
      { status: 500 }
    );
  }
}
