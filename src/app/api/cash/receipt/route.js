import { NextResponse } from "next/server";
import pool from "@/lib/database.js";

// GET - Fetch cash receipts
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    let query = "SELECT * FROM cash_receipts";
    let params = [];

    if (status) {
      query += " WHERE status = $1";
      params.push(status);
    }

    query += " ORDER BY created_at DESC";

    const result = await pool.query(query, params);

    return NextResponse.json({
      success: true,
      receipts: result.rows,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch cash receipts" },
      { status: 500 }
    );
  }
}

// POST - Generate cash receipt
export async function POST(request) {
  try {
    const data = await request.json();

    // Validation
    const errors = {};
    if (!data.donor_name?.trim()) errors.donor_name = "Donor name is required";
    if (!data.amount || data.amount <= 0)
      errors.amount = "Valid amount is required";
    if (!data.purpose?.trim()) errors.purpose = "Purpose is required";

    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ success: false, errors }, { status: 400 });
    }

    // Generate receipt number
    const receiptNumber = `CR${Date.now()}`;

    const insertQuery = `
      INSERT INTO cash_receipts (
        receipt_number, donor_name, amount, currency, purpose, 
        phone, email, message, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;

    const insertParams = [
      receiptNumber,
      data.donor_name.trim(),
      data.amount,
      data.currency || "GHS",
      data.purpose.trim(),
      data.phone?.trim() || "",
      data.email?.trim() || "",
      data.message?.trim() || "",
      "pending",
    ];

    const result = await pool.query(insertQuery, insertParams);
    const newReceipt = result.rows[0];

    return NextResponse.json({
      success: true,
      receipt: newReceipt,
      message: "Cash receipt generated successfully",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to generate cash receipt" },
      { status: 500 }
    );
  }
}

// PUT - Verify cash receipt
export async function PUT(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = parseInt(searchParams.get("id"));

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Receipt ID is required" },
        { status: 400 }
      );
    }

    const data = await request.json();

    // Check if receipt exists
    const checkResult = await pool.query(
      "SELECT * FROM cash_receipts WHERE id = $1",
      [id]
    );

    if (checkResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: "Cash receipt not found" },
        { status: 404 }
      );
    }

    const updateQuery = `
      UPDATE cash_receipts SET
        status = $1,
        verified_by = $2,
        verified_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING *
    `;

    const updateParams = [
      data.status || "verified",
      data.verified_by || "admin",
      id,
    ];

    const result = await pool.query(updateQuery, updateParams);
    const updatedReceipt = result.rows[0];

    return NextResponse.json({
      success: true,
      receipt: updatedReceipt,
      message: "Cash receipt verified successfully",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to verify cash receipt" },
      { status: 500 }
    );
  }
}

// DELETE - Delete cash receipt
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = parseInt(searchParams.get("id"));

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Receipt ID is required" },
        { status: 400 }
      );
    }

    const result = await pool.query(
      "DELETE FROM cash_receipts WHERE id = $1 RETURNING id",
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: "Cash receipt not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Cash receipt deleted successfully",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to delete cash receipt" },
      { status: 500 }
    );
  }
}
