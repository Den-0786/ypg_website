import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import { join } from "path";
import pool from "@/lib/database.js";

// GET - Fetch testimonials
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit")) || 10;

    const query = `
      SELECT * FROM testimonials 
      WHERE dashboard_deleted = false 
      ORDER BY created_at DESC 
      LIMIT $1
    `;

    const result = await pool.query(query, [limit]);

    return NextResponse.json({
      success: true,
      testimonials: result.rows,
      total: result.rows.length,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch testimonials" },
      { status: 500 }
    );
  }
}

// POST - Create new testimonial
export async function POST(request) {
  try {
    const contentType = request.headers.get("content-type");
    let testimonialData;

    if (contentType && contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      testimonialData = {
        name: formData.get("name"),
        role: formData.get("role"),
        content: formData.get("content"),
        rating: parseInt(formData.get("rating")) || 5,
        image: formData.get("image"),
      };
    } else {
      testimonialData = await request.json();
    }

    // Validation
    const errors = {};
    if (!testimonialData.name?.trim()) errors.name = "Name is required";
    if (!testimonialData.content?.trim())
      errors.content = "Content is required";

    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ success: false, errors }, { status: 400 });
    }

    // Handle image upload if provided
    let imagePath = "/placeholder-testimonial.jpg";
    if (testimonialData.image && testimonialData.image.size > 0) {
      const bytes = await testimonialData.image.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const timestamp = Date.now();
      const sanitizedName = testimonialData.image.name.replace(
        /[^a-zA-Z0-9.-]/g,
        "_"
      );
      const fileName = `${timestamp}-${sanitizedName}`;
      imagePath = `/uploads/testimonials/${fileName}`;

      try {
        const uploadDir = join(
          process.cwd(),
          "public",
          "uploads",
          "testimonials"
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
      INSERT INTO testimonials (
        name, role, content, image, rating
      ) VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;

    const insertParams = [
      testimonialData.name,
      testimonialData.role || "",
      testimonialData.content,
      imagePath,
      testimonialData.rating || 5,
    ];

    const result = await pool.query(insertQuery, insertParams);
    const newTestimonial = result.rows[0];

    return NextResponse.json({
      success: true,
      testimonial: newTestimonial,
      message: "Testimonial created successfully",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to create testimonial" },
      { status: 500 }
    );
  }
}

// PUT - Update testimonial
export async function PUT(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = parseInt(searchParams.get("id"));

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Testimonial ID is required" },
        { status: 400 }
      );
    }

    const contentType = request.headers.get("content-type");
    let updateData;

    if (contentType && contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      updateData = {
        name: formData.get("name"),
        role: formData.get("role"),
        content: formData.get("content"),
        rating: parseInt(formData.get("rating")) || 5,
        image: formData.get("image"),
      };
    } else {
      updateData = await request.json();
    }

    const checkResult = await pool.query(
      "SELECT * FROM testimonials WHERE id = $1",
      [id]
    );

    if (checkResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: "Testimonial not found" },
        { status: 404 }
      );
    }

    const existingTestimonial = checkResult.rows[0];

    // Handle image upload if a new image is provided
    let imagePath = existingTestimonial.image;
    if (updateData.image && updateData.image.size > 0) {
      const bytes = await updateData.image.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const timestamp = Date.now();
      const sanitizedName = updateData.image.name.replace(
        /[^a-zA-Z0-9.-]/g,
        "_"
      );
      const fileName = `${timestamp}-${sanitizedName}`;
      imagePath = `/uploads/testimonials/${fileName}`;

      try {
        const uploadDir = join(
          process.cwd(),
          "public",
          "uploads",
          "testimonials"
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
      UPDATE testimonials SET
        name = $1,
        role = $2,
        content = $3,
        image = $4,
        rating = $5,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $6
      RETURNING *
    `;

    const updateParams = [
      updateData.name,
      updateData.role || "",
      updateData.content,
      imagePath,
      updateData.rating || 5,
      id,
    ];

    const result = await pool.query(updateQuery, updateParams);
    const updatedTestimonial = result.rows[0];

    return NextResponse.json({
      success: true,
      testimonial: updatedTestimonial,
      message: "Testimonial updated successfully",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to update testimonial" },
      { status: 500 }
    );
  }
}

// DELETE - Delete testimonial
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = parseInt(searchParams.get("id"));
    const deleteType = searchParams.get("type") || "soft";

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Testimonial ID is required" },
        { status: 400 }
      );
    }

    if (deleteType === "hard") {
      const result = await pool.query(
        "DELETE FROM testimonials WHERE id = $1 RETURNING id",
        [id]
      );

      if (result.rows.length === 0) {
        return NextResponse.json(
          { success: false, error: "Testimonial not found" },
          { status: 404 }
        );
      }
    } else {
      const result = await pool.query(
        "UPDATE testimonials SET dashboard_deleted = true, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING id",
        [id]
      );

      if (result.rows.length === 0) {
        return NextResponse.json(
          { success: false, error: "Testimonial not found" },
          { status: 404 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: `Testimonial ${deleteType === "hard" ? "permanently deleted" : "marked as deleted"}`,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to delete testimonial" },
      { status: 500 }
    );
  }
}
