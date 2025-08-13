import { NextResponse } from "next/server";
import pool from "@/lib/database.js";

// GET - Fetch contact messages
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    let query = "SELECT * FROM contact_messages";
    let params = [];

    if (status) {
      query += " WHERE status = $1";
      params.push(status);
    }

    query += " ORDER BY created_at DESC";

    const result = await pool.query(query, params);

    return NextResponse.json({
      success: true,
      messages: result.rows,
      total: result.rows.length,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch contact messages" },
      { status: 500 }
    );
  }
}

// POST - Create new contact message
export async function POST(request) {
  try {
    const data = await request.json();

    // Validation
    const errors = {};
    if (!data.name?.trim()) errors.name = "Name is required";
    if (!data.email?.trim()) errors.email = "Email is required";
    if (!data.message?.trim()) errors.message = "Message is required";

    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ success: false, errors }, { status: 400 });
    }

    const insertQuery = `
      INSERT INTO contact_messages (
        name, email, subject, message, status
      ) VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;

    const insertParams = [
      data.name.trim(),
      data.email.trim().toLowerCase(),
      data.subject?.trim() || "",
      data.message.trim(),
      "unread",
    ];

    const result = await pool.query(insertQuery, insertParams);
    const newMessage = result.rows[0];

    return NextResponse.json({
      success: true,
      message: newMessage,
      message: "Contact message sent successfully",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to send contact message" },
      { status: 500 }
    );
  }
}

// PUT - Update contact message (mark as read, etc.)
export async function PUT(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = parseInt(searchParams.get("id"));

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Message ID is required" },
        { status: 400 }
      );
    }

    const data = await request.json();

    // Check if message exists
    const checkResult = await pool.query(
      "SELECT * FROM contact_messages WHERE id = $1",
      [id]
    );

    if (checkResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: "Contact message not found" },
        { status: 404 }
      );
    }

    const updateQuery = `
      UPDATE contact_messages SET
        status = $1,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `;

    const updateParams = [data.status || "read", id];

    const result = await pool.query(updateQuery, updateParams);
    const updatedMessage = result.rows[0];

    return NextResponse.json({
      success: true,
      message: updatedMessage,
      message: "Contact message updated successfully",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to update contact message" },
      { status: 500 }
    );
  }
}

// DELETE - Delete contact message
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = parseInt(searchParams.get("id"));

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Message ID is required" },
        { status: 400 }
      );
    }

    const result = await pool.query(
      "DELETE FROM contact_messages WHERE id = $1 RETURNING id",
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: "Contact message not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Contact message deleted successfully",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to delete contact message" },
      { status: 500 }
    );
  }
}
