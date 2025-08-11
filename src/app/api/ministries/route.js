import { NextResponse } from "next/server";
import { writeFile, readFile, unlink } from "fs/promises";
import { join } from "path";

// Mock database - in production, this would be a real database
let ministries = [];

// Helper function to handle image uploads
async function handleImageUpload(image) {
  if (!image || image.size === 0) return null;

  const bytes = await image.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Generate unique filename
  const timestamp = Date.now();
  const sanitizedName = image.name.replace(/[^a-zA-Z0-9.-]/g, "_");
  const fileName = `${timestamp}-${sanitizedName}`;
  const imagePath = `/uploads/ministries/${fileName}`;

  // Save the image file to local storage
  try {
    await writeFile(join(process.cwd(), "public", imagePath), buffer);
    console.log(`Ministry image saved: ${imagePath}`);
    return imagePath;
  } catch (error) {
    console.error("Error saving ministry image:", error);
    throw new Error("Failed to save image");
  }
}

export async function GET(request) {
  try {
    return NextResponse.json({
      success: true,
      ministries: ministries,
    });
  } catch (error) {
    console.error("Error in ministries GET:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch ministries" },
      { status: 500 }
    );
  }
}

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

    const newMinistry = {
      id: ministries.length + 1,
      name: ministryData.name,
      description: ministryData.description,
      leaderName: ministryData.leaderName || "",
      leaderPhone: ministryData.leaderPhone || "",
      color: ministryData.color || "from-blue-500 to-purple-500",
      image: imagePath,
      created_at: new Date().toISOString(),
    };

    ministries.push(newMinistry);

    return NextResponse.json({
      success: true,
      ministry: newMinistry,
      message: "Ministry added successfully",
    });
  } catch (error) {
    console.error("Error adding ministry:", error);
    return NextResponse.json(
      { success: false, error: "Failed to add ministry" },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    let updateData;
    let ministryId;

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

    const ministryIndex = ministries.findIndex(
      (ministry) => ministry.id === ministryId
    );
    if (ministryIndex === -1) {
      return NextResponse.json(
        { success: false, error: "Ministry not found" },
        { status: 404 }
      );
    }

    // Handle image upload if a new image is provided
    let imagePath = ministries[ministryIndex].image;
    if (updateData.image && updateData.image.size > 0) {
      try {
        imagePath = await handleImageUpload(updateData.image);

        // Keep old images for ministries - admin can manually delete if needed
        console.log(`New ministry image saved: ${imagePath}`);
        console.log(
          `Old ministry image kept: ${ministries[ministryIndex].image}`
        );
      } catch (error) {
        return NextResponse.json(
          { success: false, error: "Failed to save new image" },
          { status: 500 }
        );
      }
    }

    // Update the ministry
    ministries[ministryIndex] = {
      ...ministries[ministryIndex],
      ...updateData,
      image: imagePath,
    };

    return NextResponse.json({
      success: true,
      ministry: ministries[ministryIndex],
      message: "Ministry updated successfully",
    });
  } catch (error) {
    console.error("Error updating ministry:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update ministry" },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = parseInt(searchParams.get("id"));

    const ministryIndex = ministries.findIndex(
      (ministry) => ministry.id === id
    );
    if (ministryIndex === -1) {
      return NextResponse.json(
        { success: false, error: "Ministry not found" },
        { status: 404 }
      );
    }

    ministries.splice(ministryIndex, 1);

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
