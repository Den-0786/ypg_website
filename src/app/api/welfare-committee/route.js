import { NextResponse } from "next/server";
import pool from "@/lib/database.js";

// GET - Fetch all welfare committee members
export async function GET() {
  try {
    // First check if table exists
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'welfare_committee'
      );
    `);

    if (!tableCheck.rows[0].exists) {
      // Create table if it doesn't exist
      await pool.query(`
        CREATE TABLE IF NOT EXISTS welfare_committee (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          phone VARCHAR(20) NOT NULL,
          position VARCHAR(100) NOT NULL,
          congregation VARCHAR(255) NOT NULL,
          picture TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          deleted_at TIMESTAMP NULL
        );
      `);
    }

    const result = await pool.query(
      `SELECT * FROM welfare_committee 
        WHERE deleted_at IS NULL 
        ORDER BY name ASC`
    );

    return NextResponse.json({
      success: true,
      members: result.rows,
    });
  } catch (error) {
    console.error("Error fetching welfare committee:", error);
    return NextResponse.json(
      {
        success: false,
        error: `Failed to fetch committee members: ${error.message}`,
      },
      { status: 500 }
    );
  }
}

// POST - Add new welfare committee member
export async function POST(request) {
  try {
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

    // Check if email already exists
    const existingMember = await pool.query(
      "SELECT id FROM welfare_committee WHERE email = $1 AND deleted_at IS NULL",
      [email]
    );

    if (existingMember.rows.length > 0) {
      return NextResponse.json(
        { success: false, error: "Email already exists" },
        { status: 400 }
      );
    }

    let picturePath = null;
    if (picture && picture.size > 0) {
      picturePath = `/uploads/welfare-committee/${Date.now()}-${picture.name}`;
    }

    const result = await pool.query(
      `INSERT INTO welfare_committee (name, email, phone, position, congregation, picture, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       RETURNING *`,
      [name, email, phone, position, congregation, picturePath]
    );

    return NextResponse.json({
      success: true,
      member: result.rows[0],
      message: "Committee member added successfully",
    });
  } catch (error) {
    console.error("Error adding welfare committee member:", error);
    return NextResponse.json(
      { success: false, error: "Failed to add committee member" },
      { status: 500 }
    );
  }
}
