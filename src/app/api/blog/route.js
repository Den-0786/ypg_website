import { NextResponse } from "next/server";
import { writeFile, readFile, unlink } from "fs/promises";
import { join } from "path";

// Database - in production, this would be a real database
let blogPosts = [];

// Helper function to handle image uploads
async function handleImageUpload(image, category) {
  if (!image || image.size === 0) return null;

  const bytes = await image.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Generate unique filename
  const timestamp = Date.now();
  const sanitizedName = image.name.replace(/[^a-zA-Z0-9.-]/g, "_");
  const fileName = `${timestamp}-${sanitizedName}`;
  const imagePath = `/uploads/${category}/${fileName}`;

  // Save the image file to local storage
  try {
    await writeFile(join(process.cwd(), "public", imagePath), buffer);

    return imagePath;
  } catch (error) {
    console.error("Error saving blog image:", error);
    throw new Error("Failed to save image");
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const forWebsite = searchParams.get("forWebsite");

    let filteredPosts = blogPosts;

    // If requesting for website, filter out soft-deleted posts
    if (forWebsite === "true") {
      filteredPosts = blogPosts.filter((post) => !post.dashboard_deleted);
    }

    return NextResponse.json({
      success: true,
      blog: filteredPosts,
    });
  } catch (error) {
    console.error("Error in blog GET:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch blog posts" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    let postData;

    // Check if the request is FormData or JSON
    const contentType = request.headers.get("content-type");

    if (contentType && contentType.includes("multipart/form-data")) {
      // Handle FormData
      const formData = await request.formData();
      postData = {
        title: formData.get("title"),
        excerpt: formData.get("excerpt"),
        content: formData.get("content"),
        author: formData.get("author"),
        category: formData.get("category"),
        date: formData.get("date"),
        image: formData.get("image")
          ? await handleImageUpload(formData.get("image"), "blog")
          : null,
      };
    } else {
      // Handle JSON
      postData = await request.json();
    }

    // Validate required fields
    if (
      !postData.title ||
      !postData.excerpt ||
      !postData.category ||
      !postData.date
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Missing required fields: title, excerpt, category, and date are required",
        },
        { status: 400 }
      );
    }

    const newPost = {
      id: blogPosts.length + 1,
      ...postData,
      created_at: new Date().toISOString(),
    };

    blogPosts.push(newPost);

    return NextResponse.json({
      success: true,
      post: newPost,
      message: "Blog post created successfully",
    });
  } catch (error) {
    console.error("Error in blog POST:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create blog post" },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    let updateData;

    // Check if the request is FormData or JSON
    const contentType = request.headers.get("content-type");

    if (contentType && contentType.includes("multipart/form-data")) {
      // Handle FormData
      const formData = await request.formData();
      updateData = {
        id: parseInt(formData.get("id")),
        title: formData.get("title"),
        excerpt: formData.get("excerpt"),
        content: formData.get("content"),
        author: formData.get("author"),
        category: formData.get("category"),
        date: formData.get("date"),
        image: formData.get("image")
          ? await handleImageUpload(formData.get("image"), "blog")
          : null,
      };
    } else {
      // Handle JSON
      updateData = await request.json();
    }

    const { id, ...postData } = updateData;

    const postIndex = blogPosts.findIndex((post) => post.id === id);
    if (postIndex === -1) {
      return NextResponse.json(
        { success: false, error: "Blog post not found" },
        { status: 404 }
      );
    }

    // Validate required fields
    if (
      !postData.title ||
      !postData.excerpt ||
      !postData.category ||
      !postData.date
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Missing required fields: title, excerpt, category, and date are required",
        },
        { status: 400 }
      );
    }

    blogPosts[postIndex] = {
      ...blogPosts[postIndex],
      ...postData,
      updated_at: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      post: blogPosts[postIndex],
      message: "Blog post updated successfully",
    });
  } catch (error) {
    console.error("Error in blog PUT:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update blog post" },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = parseInt(searchParams.get("id"));
    const deleteType = searchParams.get("type") || "both"; // Default to 'both' if not specified

    const postIndex = blogPosts.findIndex((post) => post.id === id);
    if (postIndex === -1) {
      return NextResponse.json(
        { success: false, error: "Blog post not found" },
        { status: 404 }
      );
    }

    if (deleteType === "dashboard") {
      // Soft delete - mark as deleted from dashboard only
      blogPosts[postIndex] = {
        ...blogPosts[postIndex],
        dashboard_deleted: true,
        deleted_at: new Date().toISOString(),
      };

      return NextResponse.json({
        success: true,
        message: "Blog post hidden from dashboard successfully",
      });
    } else {
      // Hard delete - remove completely from both dashboard and website
      blogPosts.splice(postIndex, 1);

      return NextResponse.json({
        success: true,
        message:
          "Blog post deleted from both dashboard and website successfully",
      });
    }
  } catch (error) {
    console.error("Error in blog DELETE:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete blog post" },
      { status: 500 }
    );
  }
}
