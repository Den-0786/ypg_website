import { NextResponse } from "next/server";
import pool from "@/lib/database.js";

// GET - Fetch donations
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const purpose = searchParams.get("purpose");
    const payment_method = searchParams.get("payment_method");
    const limit = parseInt(searchParams.get("limit")) || 10;

    let query = "SELECT * FROM donations";
    let params = [];
    let paramIndex = 1;

    if (status) {
      query += ` WHERE status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (purpose) {
      const whereClause = status ? "AND" : "WHERE";
      query += ` ${whereClause} purpose = $${paramIndex}`;
      params.push(purpose);
      paramIndex++;
    }

    if (payment_method) {
      const whereClause = status || purpose ? "AND" : "WHERE";
      query += ` ${whereClause} payment_method = $${paramIndex}`;
      params.push(payment_method);
      paramIndex++;
    }

    query += " ORDER BY created_at DESC LIMIT $1";
    params.push(limit);

    const result = await pool.query(query, params);

    // Calculate totals
    const totalAmount = result.rows.reduce(
      (sum, donation) => sum + (parseFloat(donation.amount) || 0),
      0
    );
    const totalCount = result.rows.length;

    return NextResponse.json({
      success: true,
      donations: result.rows,
      total: result.rows.length,
      summary: {
        total_amount: totalAmount,
        total_count: totalCount,
        average_amount:
          totalCount > 0 ? Math.round(totalAmount / totalCount) : 0,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch donations" },
      { status: 500 }
    );
  }
}

// POST - Create new donation
export async function POST(request) {
  try {
    const data = await request.json();

    // Validation
    const errors = {};
    if (!data.donor_name?.trim()) errors.donor_name = "Donor name is required";
    if (!data.amount || data.amount <= 0)
      errors.amount = "Valid amount is required";

    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ success: false, errors }, { status: 400 });
    }

    const insertQuery = `
      INSERT INTO donations (
        donor_name, email, phone, amount, currency, payment_method, 
        purpose, message, status, transaction_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;

    const insertParams = [
      data.donor_name,
      data.email || "",
      data.phone || "",
      data.amount,
      data.currency || "GHS",
      data.payment_method || "",
      data.purpose || "",
      data.message || "",
      "pending",
      data.transaction_id || "",
    ];

    const result = await pool.query(insertQuery, insertParams);
    const newDonation = result.rows[0];

    return NextResponse.json({
      success: true,
      donation: newDonation,
      message: "Donation recorded successfully",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to record donation" },
      { status: 500 }
    );
  }
}

// PUT - Update donation
export async function PUT(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = parseInt(searchParams.get("id"));

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Donation ID is required" },
        { status: 400 }
      );
    }

    const data = await request.json();

    const checkResult = await pool.query(
      "SELECT * FROM donations WHERE id = $1",
      [id]
    );

    if (checkResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: "Donation not found" },
        { status: 404 }
      );
    }

    const updateQuery = `
      UPDATE donations SET
        donor_name = $1,
        email = $2,
        phone = $3,
        amount = $4,
        currency = $5,
        payment_method = $6,
        purpose = $7,
        message = $8,
        status = $9,
        transaction_id = $10,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $11
      RETURNING *
    `;

    const updateParams = [
      data.donor_name,
      data.email || "",
      data.phone || "",
      data.amount,
      data.currency || "GHS",
      data.payment_method || "",
      data.purpose || "",
      data.message || "",
      data.status || "pending",
      data.transaction_id || "",
      id,
    ];

    const result = await pool.query(updateQuery, updateParams);
    const updatedDonation = result.rows[0];

    return NextResponse.json({
      success: true,
      donation: updatedDonation,
      message: "Donation updated successfully",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to update donation" },
      { status: 500 }
    );
  }
}

// DELETE - Delete donation
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = parseInt(searchParams.get("id"));

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Donation ID is required" },
        { status: 400 }
      );
    }

    const result = await pool.query(
      "DELETE FROM donations WHERE id = $1 RETURNING id",
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: "Donation not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Donation deleted successfully",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to delete donation" },
      { status: 500 }
    );
  }
}
