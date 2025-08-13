import { NextResponse } from "next/server";
import pool from "@/lib/database.js";

// GET - Fetch ministry registrations
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const ministry = searchParams.get("ministry");
    const status = searchParams.get("status");

    let query = "SELECT * FROM ministry_registrations";
    let params = [];
    let paramIndex = 1;

    if (ministry) {
      query += ` WHERE ministry = $${paramIndex}`;
      params.push(ministry);
      paramIndex++;
    }

    if (status) {
      const whereClause = ministry ? "AND" : "WHERE";
      query += ` ${whereClause} status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    query += " ORDER BY created_at DESC";

    const result = await pool.query(query, params);

    return NextResponse.json({
      success: true,
      registrations: result.rows,
      total: result.rows.length,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch ministry registrations" },
      { status: 500 }
    );
  }
}

// POST - Create new ministry registration
export async function POST(request) {
  try {
    const data = await request.json();

    // Validation
    const errors = {};
    if (!data.name?.trim()) errors.name = "Name is required";
    if (!data.email?.trim()) errors.email = "Email is required";
    if (!data.ministry?.trim()) errors.ministry = "Ministry is required";

    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ success: false, errors }, { status: 400 });
    }

    const insertQuery = `
      INSERT INTO ministry_registrations (
        name, email, phone, ministry, congregation, message, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;

    const insertParams = [
      data.name.trim(),
      data.email.trim().toLowerCase(),
      data.phone?.trim() || "",
      data.ministry.trim(),
      data.congregation?.trim() || "",
      data.message?.trim() || "",
      "pending",
    ];

    const result = await pool.query(insertQuery, insertParams);
    const newRegistration = result.rows[0];

    return NextResponse.json({
      success: true,
      registration: newRegistration,
      message: "Ministry registration submitted successfully",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to submit ministry registration" },
      { status: 500 }
    );
  }
}

// PUT - Update ministry registration
export async function PUT(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = parseInt(searchParams.get("id"));

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Registration ID is required" },
        { status: 400 }
      );
    }

    const data = await request.json();

    // Check if registration exists
    const checkResult = await pool.query(
      "SELECT * FROM ministry_registrations WHERE id = $1",
      [id]
    );

    if (checkResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: "Ministry registration not found" },
        { status: 404 }
      );
    }

    const updateQuery = `
      UPDATE ministry_registrations SET
        name = $1,
        email = $2,
        phone = $3,
        ministry = $4,
        congregation = $5,
        message = $6,
        status = $7,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $8
      RETURNING *
    `;

    const updateParams = [
      data.name,
      data.email,
      data.phone || "",
      data.ministry,
      data.congregation || "",
      data.message || "",
      data.status || "pending",
      id,
    ];

    const result = await pool.query(updateQuery, updateParams);
    const updatedRegistration = result.rows[0];

    return NextResponse.json({
      success: true,
      registration: updatedRegistration,
      message: "Ministry registration updated successfully",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to update ministry registration" },
      { status: 500 }
    );
  }
}

// DELETE - Delete ministry registration
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = parseInt(searchParams.get("id"));

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Registration ID is required" },
        { status: 400 }
      );
    }

    const result = await pool.query(
      "DELETE FROM ministry_registrations WHERE id = $1 RETURNING id",
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: "Ministry registration not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Ministry registration deleted successfully",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to delete ministry registration" },
      { status: 500 }
    );
  }
}
