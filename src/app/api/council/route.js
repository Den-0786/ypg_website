import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import { join } from "path";
import pool from "@/lib/database.js";

// GET - Fetch council members
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const deleted = searchParams.get("deleted") === "true";

    let query = "SELECT * FROM council_members";
    let params = [];

    if (deleted) {
      query += " WHERE dashboard_deleted = true";
    } else {
      query += " WHERE dashboard_deleted = false";
    }

    query += " ORDER BY created_at DESC";

    const result = await pool.query(query, params);

    return NextResponse.json({
      success: true,
      councilMembers: result.rows,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch council members" },
      { status: 500 }
    );
  }
}

// POST - Create new council member
export async function POST(request) {
  try {
    const formData = await request.formData();
    const name = formData.get("name");
    const position = formData.get("position");
    const congregation = formData.get("congregation");
    const phone = formData.get("phone");
    const email = formData.get("email");
    const description = formData.get("description");
    const image = formData.get("image");

    // Validate required fields
    if (!name || !position || !congregation) {
      return NextResponse.json(
        {
          success: false,
          error: "Name, position, and congregation are required",
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
      imagePath = `/uploads/council/${fileName}`;

      // Save the image file to local storage
      try {
        const uploadDir = join(process.cwd(), "public", "uploads", "council");
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
      INSERT INTO council_members (
        name, position, congregation, phone, email, description, image
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;

    const insertParams = [
      name,
      position,
      congregation,
      phone || "",
      email || "",
      description || "",
      imagePath,
    ];

    const result = await pool.query(insertQuery, insertParams);
    const newCouncilMember = result.rows[0];

    return NextResponse.json({
      success: true,
      councilMember: newCouncilMember,
      message: "Council member created successfully",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to create council member" },
      { status: 500 }
    );
  }
}

// PUT - Update council member
export async function PUT(request) {
  try {
    const formData = await request.formData();
    const id = parseInt(formData.get("id"));
    const name = formData.get("name");
    const position = formData.get("position");
    const congregation = formData.get("congregation");
    const phone = formData.get("phone");
    const email = formData.get("email");
    const description = formData.get("description");
    const image = formData.get("image");

    if (!id || !name || !position || !congregation) {
      return NextResponse.json(
        {
          success: false,
          error: "ID, name, position, and congregation are required",
        },
        { status: 400 }
      );
    }

    // Check if council member exists
    const checkResult = await pool.query(
      "SELECT * FROM council_members WHERE id = $1",
      [id]
    );

    if (checkResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: "Council member not found" },
        { status: 404 }
      );
    }

    const existingMember = checkResult.rows[0];

    // Handle image upload if a new image is provided
    let imagePath = existingMember.image;
    if (image && image.size > 0) {
      const bytes = await image.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Generate unique filename
      const timestamp = Date.now();
      const sanitizedName = image.name.replace(/[^a-zA-Z0-9.-]/g, "_");
      const fileName = `${timestamp}-${sanitizedName}`;
      imagePath = `/uploads/council/${fileName}`;

      // Save the new image file to local storage
      try {
        const uploadDir = join(process.cwd(), "public", "uploads", "council");
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
      UPDATE council_members SET
        name = $1,
        position = $2,
        congregation = $3,
        phone = $4,
        email = $5,
        description = $6,
        image = $7,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $8
      RETURNING *
    `;

    const updateParams = [
      name,
      position,
      congregation,
      phone || "",
      email || "",
      description || "",
      imagePath,
      id,
    ];

    const result = await pool.query(updateQuery, updateParams);
    const updatedCouncilMember = result.rows[0];

    return NextResponse.json({
      success: true,
      councilMember: updatedCouncilMember,
      message: "Council member updated successfully",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to update council member" },
      { status: 500 }
    );
  }
}

// DELETE - Delete council member
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = parseInt(searchParams.get("id"));
    const deleteType = searchParams.get("type") || "both";

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Council member ID is required" },
        { status: 400 }
      );
    }

    if (deleteType === "both") {
      // Permanently delete the council member
      const result = await pool.query(
        "DELETE FROM council_members WHERE id = $1 RETURNING id",
        [id]
      );

      if (result.rows.length === 0) {
        return NextResponse.json(
          { success: false, error: "Council member not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        message:
          "Council member permanently deleted from both dashboard and main website",
      });
    } else {
      // Soft delete - mark as deleted
      const result = await pool.query(
        "UPDATE council_members SET dashboard_deleted = true, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING id",
        [id]
      );

      if (result.rows.length === 0) {
        return NextResponse.json(
          { success: false, error: "Council member not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        message:
          "Council member deleted from dashboard only (hidden from admin)",
      });
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to delete council member" },
      { status: 500 }
    );
  }
}
