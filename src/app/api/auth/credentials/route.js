import { NextResponse } from "next/server";
import pool from "@/lib/database.js";
import bcrypt from "bcryptjs";

// GET - Get current username (never return password)
export async function GET() {
  try {
    const result = await pool.query(
      "SELECT username FROM admin_credentials WHERE id = 1"
    );

    const username =
      result.rows.length > 0 ? result.rows[0].username : "Not configured";

    return NextResponse.json({
      success: true,
      credentials: {
        username: username,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to get credentials" },
      { status: 500 }
    );
  }
}

// PUT - Update credentials
export async function PUT(request) {
  try {
    const body = await request.json();
    const { currentPassword, newUsername, newPassword } = body;

    // Get current credentials from database
    const currentResult = await pool.query(
      "SELECT username, password FROM admin_credentials WHERE id = 1"
    );

    if (currentResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: "Admin credentials not configured" },
        { status: 500 }
      );
    }

    const currentCredentials = currentResult.rows[0];

    // Check current password
    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      currentCredentials.password
    );
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, error: "Current password is incorrect" },
        { status: 400 }
      );
    }

    // Validate new credentials
    if (newUsername && newUsername.length < 3) {
      return NextResponse.json(
        {
          success: false,
          error: "Username must be at least 3 characters long",
        },
        { status: 400 }
      );
    }

    if (newPassword && newPassword.length < 8) {
      return NextResponse.json(
        {
          success: false,
          error: "Password must be at least 8 characters long",
        },
        { status: 400 }
      );
    }

    // Update credentials in database
    let updateQuery = "UPDATE admin_credentials SET ";
    let params = [];
    let paramIndex = 1;

    if (newUsername) {
      updateQuery += `username = $${paramIndex}, `;
      params.push(newUsername);
      paramIndex++;
    }

    if (newPassword) {
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      updateQuery += `password = $${paramIndex}, `;
      params.push(hashedPassword);
      paramIndex++;
    }

    updateQuery += `updated_at = CURRENT_TIMESTAMP WHERE id = 1`;

    await pool.query(updateQuery, params);

    return NextResponse.json({
      success: true,
      message: "Credentials updated successfully!",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to update credentials" },
      { status: 500 }
    );
  }
}
