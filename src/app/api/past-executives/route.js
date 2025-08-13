import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import { join } from "path";
import pool from "@/lib/database.js";

// GET - Fetch past executives
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const deleted = searchParams.get("deleted") === "true";

    let query = "SELECT * FROM past_executives";
    let params = [];

    if (deleted) {
      query += " WHERE dashboard_deleted = true";
    } else {
      query += " WHERE dashboard_deleted = false";
    }

    query += " ORDER BY reign_period DESC, created_at DESC";

    const result = await pool.query(query, params);

    return NextResponse.json({
      success: true,
      pastExecutives: result.rows,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch past executives" },
      { status: 500 }
    );
  }
}

// POST - Create new past executive
export async function POST(request) {
  try {
    const formData = await request.formData();
    const name = formData.get("name");
    const position = formData.get("position");
    const reignPeriod = formData.get("reignPeriod");
    const image = formData.get("image");

    // Validate required fields
    if (!name || !position || !reignPeriod) {
      return NextResponse.json(
        {
          success: false,
          error: "Name, position, and reign period are required",
        },
        { status: 400 }
      );
    }

    // Handle image upload
    let imagePath = null;
    if (image && image.size > 0) {
      const bytes = await image.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Generate unique filename
      const timestamp = Date.now();
      const sanitizedName = image.name.replace(/[^a-zA-Z0-9.-]/g, "_");
      const fileName = `${timestamp}-${sanitizedName}`;
      imagePath = `/uploads/past-executives/${fileName}`;

      // Save the image file to local storage
      try {
        const uploadDir = join(
          process.cwd(),
          "public",
          "uploads",
          "past-executives"
        );
        const filePath = join(uploadDir, fileName);
        await writeFile(filePath, buffer);
      } catch (error) {
        return NextResponse.json(
          { success: false, error: "Failed to save image" },
          { status: 500 }
        );
      }
    }

    const insertQuery = `
      INSERT INTO past_executives (
        name, position, reign_period, image
      ) VALUES ($1, $2, $3, $4)
      RETURNING *
    `;

    const insertParams = [name, position, reignPeriod, imagePath];

    const result = await pool.query(insertQuery, insertParams);
    const newPastExecutive = result.rows[0];

    return NextResponse.json({
      success: true,
      pastExecutive: newPastExecutive,
      message: "Past executive created successfully",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to create past executive" },
      { status: 500 }
    );
  }
}

// PUT - Update past executive
export async function PUT(request) {
  try {
    const formData = await request.formData();
    const id = parseInt(formData.get("id"));
    const name = formData.get("name");
    const position = formData.get("position");
    const reignPeriod = formData.get("reignPeriod");
    const image = formData.get("image");

    // Validate required fields
    if (!id || !name || !position || !reignPeriod) {
      return NextResponse.json(
        {
          success: false,
          error: "ID, name, position, and reign period are required",
        },
        { status: 400 }
      );
    }

    // Check if past executive exists
    const checkResult = await pool.query(
      "SELECT * FROM past_executives WHERE id = $1",
      [id]
    );

    if (checkResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: "Past executive not found" },
        { status: 404 }
      );
    }

    const existingExecutive = checkResult.rows[0];

    // Handle image upload if a new image is provided
    let imagePath = existingExecutive.image;
    if (image && image.size > 0) {
      const bytes = await image.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Generate unique filename
      const timestamp = Date.now();
      const sanitizedName = image.name.replace(/[^a-zA-Z0-9.-]/g, "_");
      const fileName = `${timestamp}-${sanitizedName}`;
      imagePath = `/uploads/past-executives/${fileName}`;

      // Save the new image file to local storage
      try {
        const uploadDir = join(
          process.cwd(),
          "public",
          "uploads",
          "past-executives"
        );
        const filePath = join(uploadDir, fileName);
        await writeFile(filePath, buffer);
      } catch (error) {
        return NextResponse.json(
          { success: false, error: "Failed to save new image" },
          { status: 500 }
        );
      }
    }

    const updateQuery = `
      UPDATE past_executives SET
        name = $1,
        position = $2,
        reign_period = $3,
        image = $4,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $5
      RETURNING *
    `;

    const updateParams = [name, position, reignPeriod, imagePath, id];

    const result = await pool.query(updateQuery, updateParams);
    const updatedPastExecutive = result.rows[0];

    return NextResponse.json({
      success: true,
      pastExecutive: updatedPastExecutive,
      message: "Past executive updated successfully",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to update past executive" },
      { status: 500 }
    );
  }
}

// DELETE - Delete past executive
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = parseInt(searchParams.get("id"));
    const deleteType = searchParams.get("type") || "both";

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Past executive ID is required" },
        { status: 400 }
      );
    }

    if (deleteType === "both") {
      // Permanently delete the past executive
      const result = await pool.query(
        "DELETE FROM past_executives WHERE id = $1 RETURNING id",
        [id]
      );

      if (result.rows.length === 0) {
        return NextResponse.json(
          { success: false, error: "Past executive not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        message:
          "Past executive permanently deleted from both dashboard and main website",
      });
    } else {
      // Soft delete - mark as deleted
      const result = await pool.query(
        "UPDATE past_executives SET dashboard_deleted = true, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING id",
        [id]
      );

      if (result.rows.length === 0) {
        return NextResponse.json(
          { success: false, error: "Past executive not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        message:
          "Past executive deleted from dashboard only (hidden from admin)",
      });
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to delete past executive" },
      { status: 500 }
    );
  }
}
