import { NextResponse } from "next/server";
import { writeFile, readFile, unlink } from "fs/promises";
import { join } from "path";

// Mock database - in production, this would be a real database
let pastExecutives = [];

// Helper function to sort past executives by year (newest first)
function sortPastExecutivesByYear(members) {
  return members.sort((a, b) => {
    // Extract the end year from reign period (e.g., "2019 - 2022" -> 2022)
    const aEndYear = parseInt(a.reignPeriod.split("-")[1]?.trim()) || 0;
    const bEndYear = parseInt(b.reignPeriod.split("-")[1]?.trim()) || 0;
    return bEndYear - aEndYear; // Newest first
  });
}

// Helper function to save past executives to a file
async function savePastExecutives() {
  try {
    const filePath = join(process.cwd(), "past-executives.json");
    await writeFile(filePath, JSON.stringify(pastExecutives, null, 2));
  } catch (error) {
    console.error("Error saving past executives:", error);
  }
}

// Helper function to load past executives from a file
async function loadPastExecutives() {
  try {
    const filePath = join(process.cwd(), "past-executives.json");
    const data = await readFile(filePath, "utf8");
    pastExecutives = JSON.parse(data);
  } catch (error) {
    console.error("Error loading past executives:", error);
  }
}

// Load past executives on startup
loadPastExecutives();

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const deleted = searchParams.get("deleted") === "true";

    // Filter based on deleted status
    let filteredExecutives = pastExecutives;
    if (deleted) {
      filteredExecutives = pastExecutives.filter(
        (executive) => executive.dashboard_deleted
      );
    } else {
      filteredExecutives = pastExecutives.filter(
        (executive) => !executive.dashboard_deleted
      );
    }

    // Sort past executives by year (newest first)
    const sortedExecutives = sortPastExecutivesByYear(filteredExecutives);

    return NextResponse.json({
      success: true,
      pastExecutives: sortedExecutives,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch past executives" },
      { status: 500 }
    );
  }
}

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
        await writeFile(join(process.cwd(), "public", imagePath), buffer);
        console.log(`Past executive image saved: ${imagePath}`);
      } catch (error) {
        console.error("Error saving past executive image:", error);
        return NextResponse.json(
          { success: false, error: "Failed to save image" },
          { status: 500 }
        );
      }
    }

    const newPastExecutive = {
      id:
        pastExecutives.length > 0
          ? Math.max(...pastExecutives.map((e) => e.id)) + 1
          : 1,
      name,
      position,
      reignPeriod,
      image: imagePath,
      created_at: new Date().toISOString(),
    };

    pastExecutives.push(newPastExecutive);
    await savePastExecutives();

    return NextResponse.json({
      success: true,
      pastExecutive: newPastExecutive,
      message: "Past executive added successfully",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to add past executive" },
      { status: 500 }
    );
  }
}

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

    const executiveIndex = pastExecutives.findIndex(
      (executive) => executive.id === id
    );
    if (executiveIndex === -1) {
      return NextResponse.json(
        { success: false, error: "Past executive not found" },
        { status: 404 }
      );
    }

    // Handle image upload if a new image is provided
    let imagePath = pastExecutives[executiveIndex].image;
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
        await writeFile(join(process.cwd(), "public", imagePath), buffer);
        console.log(`New past executive image saved: ${imagePath}`);
      } catch (error) {
        console.error("Error saving new past executive image:", error);
        return NextResponse.json(
          { success: false, error: "Failed to save new image" },
          { status: 500 }
        );
      }

      // Keep old images - admin will manually delete when needed
      console.log(`New past executive image saved: ${imagePath}`);
      console.log(
        `Old past executive image kept: ${pastExecutives[executiveIndex].image}`
      );
    }

    const updatedPastExecutive = {
      ...pastExecutives[executiveIndex],
      name,
      position,
      reignPeriod,
      image: imagePath,
    };

    pastExecutives[executiveIndex] = updatedPastExecutive;
    await savePastExecutives();

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

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = parseInt(searchParams.get("id"));
    const deleteType = searchParams.get("type") || "both";

    const executiveIndex = pastExecutives.findIndex(
      (executive) => executive.id === id
    );
    if (executiveIndex === -1) {
      return NextResponse.json(
        { success: false, error: "Past executive not found" },
        { status: 404 }
      );
    }

    if (deleteType === "both") {
      // Delete the image file if it exists
      if (
        pastExecutives[executiveIndex].image &&
        pastExecutives[executiveIndex].image.startsWith(
          "/uploads/past-executives/"
        )
      ) {
        try {
          await unlink(
            join(process.cwd(), "public", pastExecutives[executiveIndex].image)
          );
          console.log(
            `Past executive image deleted: ${pastExecutives[executiveIndex].image}`
          );
        } catch (error) {
          console.error("Error deleting past executive image:", error);
        }
      }

      pastExecutives.splice(executiveIndex, 1);
      await savePastExecutives();
      return NextResponse.json({
        success: true,
        message:
          "Past executive permanently deleted from both dashboard and main website",
      });
    } else {
      pastExecutives[executiveIndex].dashboard_deleted = true;
      await savePastExecutives();
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


