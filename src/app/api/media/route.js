import { NextResponse } from "next/server";
import { writeFile, readFile, unlink } from "fs/promises";
import { join } from "path";

// Database - in production, this would be a real database
let media = [];

// Helper function to handle image uploads
async function handleImageUpload(image, category) {
  if (!image || image.size === 0) return null;

  const bytes = await image.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Generate unique filename
  const timestamp = Date.now();
  const sanitizedName = image.name.replace(/[^a-zA-Z0-9.-]/g, "_");
  const fileName = `${timestamp}-${sanitizedName}`;
  const imagePath = `/uploads/gallery/${fileName}`;

  // Save the image file to local storage
  try {
    await writeFile(join(process.cwd(), "public", imagePath), buffer);

    return imagePath;
  } catch (error) {
    console.error("Error saving gallery image:", error);
    throw new Error("Failed to save image");
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const type = searchParams.get("type");

    let filteredMedia = media;

    if (category) {
      filteredMedia = filteredMedia.filter(
        (item) => item.category === category
      );
    }

    if (type) {
      filteredMedia = filteredMedia.filter((item) => item.type === type);
    }

    return NextResponse.json({
      success: true,
      media: filteredMedia,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch media" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    let mediaData;

    // Check if the request is FormData or JSON
    const contentType = request.headers.get("content-type");

    if (contentType && contentType.includes("multipart/form-data")) {
      // Handle FormData (for image uploads)
      const formData = await request.formData();
      mediaData = {
        title: formData.get("title"),
        description: formData.get("description"),
        category: formData.get("category"),
        type: formData.get("type") || "image",
        image: formData.get("image"),
      };
    } else {
      // Handle JSON
      mediaData = await request.json();
    }

    // Validate required fields
    if (!mediaData.title || !mediaData.category) {
      return NextResponse.json(
        { success: false, error: "Title and category are required" },
        { status: 400 }
      );
    }

    // Handle image upload if provided
    let imagePath = null;
    if (mediaData.image && mediaData.image.size > 0) {
      try {
        imagePath = await handleImageUpload(
          mediaData.image,
          mediaData.category
        );
      } catch (error) {
        return NextResponse.json(
          { success: false, error: "Failed to save image" },
          { status: 500 }
        );
      }
    }

    const newMedia = {
      id: media.length + 1,
      title: mediaData.title,
      description: mediaData.description || "",
      category: mediaData.category,
      type: mediaData.type || "image",
      image: imagePath,
      created_at: new Date().toISOString(),
    };

    media.push(newMedia);

    return NextResponse.json({
      success: true,
      media: newMedia,
      message: "Media uploaded successfully",
    });
  } catch (error) {
    console.error("Error uploading media:", error);
    return NextResponse.json(
      { success: false, error: "Failed to upload media" },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    let updateData;
    let mediaId;

    // Check if the request is FormData or JSON
    const contentType = request.headers.get("content-type");

    if (contentType && contentType.includes("multipart/form-data")) {
      // Handle FormData (for image uploads)
      const formData = await request.formData();
      mediaId = parseInt(formData.get("id"));
      updateData = {
        title: formData.get("title"),
        description: formData.get("description"),
        category: formData.get("category"),
        type: formData.get("type"),
        image: formData.get("image"),
      };
    } else {
      // Handle JSON
      const body = await request.json();
      const { id, ...data } = body;
      mediaId = id;
      updateData = data;
    }

    if (!mediaId) {
      return NextResponse.json(
        { success: false, error: "Media ID is required" },
        { status: 400 }
      );
    }

    const mediaIndex = media.findIndex((item) => item.id === mediaId);
    if (mediaIndex === -1) {
      return NextResponse.json(
        { success: false, error: "Media not found" },
        { status: 404 }
      );
    }

    // Handle image upload if a new image is provided
    let imagePath = media[mediaIndex].image;
    if (updateData.image && updateData.image.size > 0) {
      try {
        imagePath = await handleImageUpload(
          updateData.image,
          updateData.category || media[mediaIndex].category
        );

        // Keep old images for gallery items - admin can manually delete if needed
      } catch (error) {
        return NextResponse.json(
          { success: false, error: "Failed to save new image" },
          { status: 500 }
        );
      }
    }

    // Update the media
    media[mediaIndex] = {
      ...media[mediaIndex],
      ...updateData,
      image: imagePath,
    };

    return NextResponse.json({
      success: true,
      media: media[mediaIndex],
      message: "Media updated successfully",
    });
  } catch (error) {
    console.error("Error updating media:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update media" },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = parseInt(searchParams.get("id"));

    const mediaIndex = media.findIndex((item) => item.id === id);
    if (mediaIndex === -1) {
      return NextResponse.json(
        { success: false, error: "Media not found" },
        { status: 404 }
      );
    }

    media.splice(mediaIndex, 1);

    return NextResponse.json({
      success: true,
      message: "Media deleted successfully",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to delete media" },
      { status: 500 }
    );
  }
}
