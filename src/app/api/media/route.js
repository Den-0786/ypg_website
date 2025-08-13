import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import { join } from "path";
import pool from "@/lib/database.js";

// GET - Fetch media items
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const category = searchParams.get("category");
    const limit = parseInt(searchParams.get("limit")) || 10;

    let query = "SELECT * FROM media WHERE dashboard_deleted = false";
    let params = [];
    let paramIndex = 1;

    if (type) {
      query += ` AND type = $${paramIndex}`;
      params.push(type);
      paramIndex++;
    }

    if (category) {
      query += ` AND category = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }

    query += " ORDER BY created_at DESC LIMIT $1";
    params.push(limit);

    const result = await pool.query(query, params);

    return NextResponse.json({
      success: true,
      media: result.rows,
      total: result.rows.length,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch media" },
      { status: 500 }
    );
  }
}

// POST - Create new media item
export async function POST(request) {
  try {
    const contentType = request.headers.get("content-type");
    let mediaData;

    if (contentType && contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      mediaData = {
        title: formData.get("title"),
        description: formData.get("description"),
        type: formData.get("type"),
        category: formData.get("category"),
        image: formData.get("image"),
        youtube_url: formData.get("youtube_url"),
        tiktok_url: formData.get("tiktok_url"),
      };
    } else {
      mediaData = await request.json();
    }

    // Validation
    const errors = {};
    if (!mediaData.title?.trim()) errors.title = "Title is required";
    if (!mediaData.type?.trim()) errors.type = "Type is required";

    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ success: false, errors }, { status: 400 });
    }

    // Handle image upload if provided
    let imagePath = "/placeholder-media.jpg";
    if (mediaData.image && mediaData.image.size > 0) {
      const bytes = await mediaData.image.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const timestamp = Date.now();
      const sanitizedName = mediaData.image.name.replace(
        /[^a-zA-Z0-9.-]/g,
        "_"
      );
      const fileName = `${timestamp}-${sanitizedName}`;
      imagePath = `/uploads/media/${fileName}`;

      try {
        const uploadDir = join(process.cwd(), "public", "uploads", "media");
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
      INSERT INTO media (
        title, description, type, category, image, youtube_url, tiktok_url
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;

    const insertParams = [
      mediaData.title,
      mediaData.description || "",
      mediaData.type,
      mediaData.category || "",
      imagePath,
      mediaData.youtube_url || "",
      mediaData.tiktok_url || "",
    ];

    const result = await pool.query(insertQuery, insertParams);
    const newMedia = result.rows[0];

    return NextResponse.json({
      success: true,
      media: newMedia,
      message: "Media item created successfully",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to create media item" },
      { status: 500 }
    );
  }
}

// PUT - Update media item
export async function PUT(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = parseInt(searchParams.get("id"));

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Media ID is required" },
        { status: 400 }
      );
    }

    const contentType = request.headers.get("content-type");
    let updateData;

    if (contentType && contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      updateData = {
        title: formData.get("title"),
        description: formData.get("description"),
        type: formData.get("type"),
        category: formData.get("category"),
        image: formData.get("image"),
        youtube_url: formData.get("youtube_url"),
        tiktok_url: formData.get("tiktok_url"),
      };
    } else {
      updateData = await request.json();
    }

    const checkResult = await pool.query("SELECT * FROM media WHERE id = $1", [
      id,
    ]);

    if (checkResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: "Media item not found" },
        { status: 404 }
      );
    }

    const existingMedia = checkResult.rows[0];

    // Handle image upload if a new image is provided
    let imagePath = existingMedia.image;
    if (updateData.image && updateData.image.size > 0) {
      const bytes = await updateData.image.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const timestamp = Date.now();
      const sanitizedName = updateData.image.name.replace(
        /[^a-zA-Z0-9.-]/g,
        "_"
      );
      const fileName = `${timestamp}-${sanitizedName}`;
      imagePath = `/uploads/media/${fileName}`;

      try {
        const uploadDir = join(process.cwd(), "public", "uploads", "media");
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
      UPDATE media SET
        title = $1,
        description = $2,
        type = $3,
        category = $4,
        image = $5,
        youtube_url = $6,
        tiktok_url = $7,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $8
      RETURNING *
    `;

    const updateParams = [
      updateData.title,
      updateData.description || "",
      updateData.type,
      updateData.category || "",
      imagePath,
      updateData.youtube_url || "",
      updateData.tiktok_url || "",
      id,
    ];

    const result = await pool.query(updateQuery, updateParams);
    const updatedMedia = result.rows[0];

    return NextResponse.json({
      success: true,
      media: updatedMedia,
      message: "Media item updated successfully",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to update media item" },
      { status: 500 }
    );
  }
}

// DELETE - Delete media item
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = parseInt(searchParams.get("id"));
    const deleteType = searchParams.get("type") || "soft";

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Media ID is required" },
        { status: 400 }
      );
    }

    if (deleteType === "hard") {
      const result = await pool.query(
        "DELETE FROM media WHERE id = $1 RETURNING id",
        [id]
      );

      if (result.rows.length === 0) {
        return NextResponse.json(
          { success: false, error: "Media item not found" },
          { status: 404 }
        );
      }
    } else {
      const result = await pool.query(
        "UPDATE media SET dashboard_deleted = true, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING id",
        [id]
      );

      if (result.rows.length === 0) {
        return NextResponse.json(
          { success: false, error: "Media item not found" },
          { status: 404 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: `Media item ${deleteType === "hard" ? "permanently deleted" : "marked as deleted"}`,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to delete media item" },
      { status: 500 }
    );
  }
}
