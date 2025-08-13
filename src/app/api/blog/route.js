import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import { join } from "path";
import pool from "@/lib/database.js";

// GET - Fetch blog posts
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const limit = parseInt(searchParams.get("limit")) || 10;

    let query = "SELECT * FROM blog_posts WHERE dashboard_deleted = false";
    let params = [];
    let paramIndex = 1;

    if (category) {
      query += ` AND category = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }

    query += ` ORDER BY date DESC, created_at DESC LIMIT $${paramIndex}`;
    params.push(limit);

    const result = await pool.query(query, params);

    return NextResponse.json({
      success: true,
      posts: result.rows,
      total: result.rows.length,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch blog posts" },
      { status: 500 }
    );
  }
}

// POST - Create new blog post
export async function POST(request) {
  try {
    const contentType = request.headers.get("content-type");
    let postData;

    if (contentType && contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      postData = {
        title: formData.get("title"),
        excerpt: formData.get("excerpt"),
        content: formData.get("content"),
        author: formData.get("author"),
        category: formData.get("category"),
        date: formData.get("date"),
        image: formData.get("image"),
      };
    } else {
      postData = await request.json();
    }

    // Validation
    const errors = {};
    if (!postData.title?.trim()) errors.title = "Title is required";
    if (!postData.content?.trim()) errors.content = "Content is required";
    if (!postData.author?.trim()) errors.author = "Author is required";

    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ success: false, errors }, { status: 400 });
    }

    // Handle image upload if provided
    let imagePath = "/placeholder-blog.jpg";
    if (postData.image && postData.image.size > 0) {
      const bytes = await postData.image.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const timestamp = Date.now();
      const sanitizedName = postData.image.name.replace(/[^a-zA-Z0-9.-]/g, "_");
      const fileName = `${timestamp}-${sanitizedName}`;
      imagePath = `/uploads/blog/${fileName}`;

      try {
        const uploadDir = join(process.cwd(), "public", "uploads", "blog");
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
      INSERT INTO blog_posts (
        title, excerpt, content, author, category, date, image
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;

    const insertParams = [
      postData.title,
      postData.excerpt || "",
      postData.content,
      postData.author,
      postData.category || "General",
      postData.date || new Date().toISOString().split("T")[0],
      imagePath,
    ];

    const result = await pool.query(insertQuery, insertParams);
    const newPost = result.rows[0];

    return NextResponse.json({
      success: true,
      post: newPost,
      message: "Blog post created successfully",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to create blog post" },
      { status: 500 }
    );
  }
}

// PUT - Update blog post
export async function PUT(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = parseInt(searchParams.get("id"));

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Post ID is required" },
        { status: 400 }
      );
    }

    const contentType = request.headers.get("content-type");
    let updateData;

    if (contentType && contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      updateData = {
        title: formData.get("title"),
        excerpt: formData.get("excerpt"),
        content: formData.get("content"),
        author: formData.get("author"),
        category: formData.get("category"),
        date: formData.get("date"),
        image: formData.get("image"),
      };
    } else {
      updateData = await request.json();
    }

    const checkResult = await pool.query(
      "SELECT * FROM blog_posts WHERE id = $1",
      [id]
    );

    if (checkResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: "Blog post not found" },
        { status: 404 }
      );
    }

    const existingPost = checkResult.rows[0];

    // Handle image upload if a new image is provided
    let imagePath = existingPost.image;
    if (updateData.image && updateData.image.size > 0) {
      const bytes = await updateData.image.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const timestamp = Date.now();
      const sanitizedName = updateData.image.name.replace(
        /[^a-zA-Z0-9.-]/g,
        "_"
      );
      const fileName = `${timestamp}-${sanitizedName}`;
      imagePath = `/uploads/blog/${fileName}`;

      try {
        const uploadDir = join(process.cwd(), "public", "uploads", "blog");
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
      UPDATE blog_posts SET
        title = $1,
        excerpt = $2,
        content = $3,
        author = $4,
        category = $5,
        date = $6,
        image = $7,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $8
      RETURNING *
    `;

    const updateParams = [
      updateData.title,
      updateData.excerpt || "",
      updateData.content,
      updateData.author,
      updateData.category || "General",
      updateData.date || new Date().toISOString().split("T")[0],
      imagePath,
      id,
    ];

    const result = await pool.query(updateQuery, updateParams);
    const updatedPost = result.rows[0];

    return NextResponse.json({
      success: true,
      post: updatedPost,
      message: "Blog post updated successfully",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to update blog post" },
      { status: 500 }
    );
  }
}

// DELETE - Delete blog post
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = parseInt(searchParams.get("id"));
    const deleteType = searchParams.get("type") || "soft";

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Post ID is required" },
        { status: 400 }
      );
    }

    if (deleteType === "hard") {
      const result = await pool.query(
        "DELETE FROM blog_posts WHERE id = $1 RETURNING id",
        [id]
      );

      if (result.rows.length === 0) {
        return NextResponse.json(
          { success: false, error: "Blog post not found" },
          { status: 404 }
        );
      }
    } else {
      const result = await pool.query(
        "UPDATE blog_posts SET dashboard_deleted = true, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING id",
        [id]
      );

      if (result.rows.length === 0) {
        return NextResponse.json(
          { success: false, error: "Blog post not found" },
          { status: 404 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: `Blog post ${deleteType === "hard" ? "permanently deleted" : "marked as deleted"}`,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to delete blog post" },
      { status: 500 }
    );
  }
}
