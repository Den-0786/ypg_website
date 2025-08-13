import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import { join } from "path";
import pool from "@/lib/database.js";

// Helper function to handle image upload
async function handleImageUpload(image) {
  const bytes = await image.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Generate unique filename
  const timestamp = Date.now();
  const sanitizedName = image.name.replace(/[^a-zA-Z0-9.-]/g, "_");
  const fileName = `${timestamp}-${sanitizedName}`;
  const imagePath = `/uploads/ministries/${fileName}`;

  // Save the image file to local storage
  const uploadDir = join(process.cwd(), "public", "uploads", "ministries");
  const filePath = join(uploadDir, fileName);
  await writeFile(filePath, buffer);
  return imagePath;
}

// GET - Fetch ministries
export async function GET(request) {
  try {
    const result = await pool.query(
      "SELECT * FROM ministries ORDER BY created_at DESC"
    );

    return NextResponse.json({
      success: true,
      ministries: result.rows,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch ministries" },
      { status: 500 }
    );
  }
}

// POST - Create new ministry
export async function POST(request) {
  try {
    let ministryData;

    // Check if the request is FormData or JSON
    const contentType = request.headers.get("content-type");

    if (contentType && contentType.includes("multipart/form-data")) {
      // Handle FormData (for image uploads)
      const formData = await request.formData();
      ministryData = {
        name: formData.get("name"),
        description: formData.get("description"),
        leaderName: formData.get("leaderName"),
        leaderPhone: formData.get("leaderPhone"),
        color: formData.get("color"),
        image: formData.get("image"),
      };
    } else {
      // Handle JSON
      ministryData = await request.json();
    }

    // Validate required fields
    if (!ministryData.name || !ministryData.description) {
      return NextResponse.json(
        { success: false, error: "Name and description are required" },
        { status: 400 }
      );
    }

    // Handle image upload if provided
    let imagePath = null;
    if (ministryData.image && ministryData.image.size > 0) {
      try {
        imagePath = await handleImageUpload(ministryData.image);
      } catch (error) {
        return NextResponse.json(
          { success: false, error: "Failed to save image" },
          { status: 500 }
        );
      }
    }

    const insertQuery = `
      INSERT INTO ministries (
        name, description, leader_name, leader_phone, color, image
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;

    const insertParams = [
      ministryData.name,
      ministryData.description,
      ministryData.leaderName || "",
      ministryData.leaderPhone || "",
      ministryData.color || "from-blue-500 to-purple-500",
      imagePath,
    ];

    const result = await pool.query(insertQuery, insertParams);
    const newMinistry = result.rows[0];

    return NextResponse.json({
      success: true,
      ministry: newMinistry,
      message: "Ministry created successfully",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to create ministry" },
      { status: 500 }
    );
  }
}

// PUT - Update ministry
export async function PUT(request) {
  try {
    let ministryId;
    let updateData;

    // Check if the request is FormData or JSON
    const contentType = request.headers.get("content-type");

    if (contentType && contentType.includes("multipart/form-data")) {
      // Handle FormData (for image uploads)
      const formData = await request.formData();
      ministryId = parseInt(formData.get("id"));
      updateData = {
        name: formData.get("name"),
        description: formData.get("description"),
        leaderName: formData.get("leaderName"),
        leaderPhone: formData.get("leaderPhone"),
        color: formData.get("color"),
        image: formData.get("image"),
      };
    } else {
      // Handle JSON
      const body = await request.json();
      const { id, ...data } = body;
      ministryId = id;
      updateData = data;
    }

    if (!ministryId) {
      return NextResponse.json(
        { success: false, error: "Ministry ID is required" },
        { status: 400 }
      );
    }

    // Check if ministry exists
    const checkResult = await pool.query(
      "SELECT * FROM ministries WHERE id = $1",
      [ministryId]
    );

    if (checkResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: "Ministry not found" },
        { status: 404 }
      );
    }

    const existingMinistry = checkResult.rows[0];

    // Handle image upload if a new image is provided
    let imagePath = existingMinistry.image;
    if (updateData.image && updateData.image.size > 0) {
      try {
        imagePath = await handleImageUpload(updateData.image);
      } catch (error) {
        return NextResponse.json(
          { success: false, error: "Failed to save new image" },
          { status: 500 }
        );
      }
    }

    const updateQuery = `
      UPDATE ministries SET
        name = $1,
        description = $2,
        leader_name = $3,
        leader_phone = $4,
        color = $5,
        image = $6,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $7
      RETURNING *
    `;

    const updateParams = [
      updateData.name,
      updateData.description,
      updateData.leaderName || "",
      updateData.leaderPhone || "",
      updateData.color || "from-blue-500 to-purple-500",
      imagePath,
      ministryId,
    ];

    const result = await pool.query(updateQuery, updateParams);
    const updatedMinistry = result.rows[0];

    return NextResponse.json({
      success: true,
      ministry: updatedMinistry,
      message: "Ministry updated successfully",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to update ministry" },
      { status: 500 }
    );
  }
}

// DELETE - Delete ministry
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = parseInt(searchParams.get("id"));

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Ministry ID is required" },
        { status: 400 }
      );
    }

    const result = await pool.query(
      "DELETE FROM ministries WHERE id = $1 RETURNING id",
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: "Ministry not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Ministry deleted successfully",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to delete ministry" },
      { status: 500 }
    );
  }
}
