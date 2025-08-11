import { NextResponse } from "next/server";
import { writeFile, readFile, unlink } from "fs/promises";
import { join } from "path";

// Mock database - in production, this would be a real database
let councilMembers = [];

// Helper function to save council members to a file
async function saveCouncilMembers() {
  try {
    const filePath = join(process.cwd(), "council-members.json");
    await writeFile(filePath, JSON.stringify(councilMembers, null, 2));
  } catch (error) {
    console.error("Error saving council members:", error);
  }
}

async function loadCouncilMembers() {
  try {
    const filePath = join(process.cwd(), "council-members.json");
    const data = await readFile(filePath, "utf8");
    councilMembers = JSON.parse(data);
  } catch (error) {
    console.error("Error loading council members:", error);
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const deleted = searchParams.get("deleted") === "true";

    // Filter based on deleted status
    let filteredMembers = councilMembers;
    if (deleted) {
      filteredMembers = councilMembers.filter(
        (member) => member.dashboard_deleted
      );
    } else {
      filteredMembers = councilMembers.filter(
        (member) => !member.dashboard_deleted
      );
    }

    return NextResponse.json({
      success: true,
      councilMembers: filteredMembers,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch council members" },
      { status: 500 }
    );
  }
}

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
        await writeFile(join(process.cwd(), "public", imagePath), buffer);
        console.log(`Council image saved: ${imagePath}`);
      } catch (error) {
        console.error("Error saving council image:", error);
        return NextResponse.json(
          { success: false, error: "Failed to save image" },
          { status: 500 }
        );
      }
    }

    const newCouncilMember = {
      id:
        councilMembers.length > 0
          ? Math.max(...councilMembers.map((m) => m.id)) + 1
          : 1,
      name,
      position,
      congregation,
      phone: phone || "",
      email: email || "",
      description: description || "",
      image: imagePath,
    };

    councilMembers.push(newCouncilMember);

    await saveCouncilMembers();

    return NextResponse.json({
      success: true,
      councilMember: newCouncilMember,
      message: "Council member added successfully",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to add council member" },
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
    const congregation = formData.get("congregation");
    const phone = formData.get("phone");
    const email = formData.get("email");
    const description = formData.get("description");
    const image = formData.get("image");

    // Validate required fields
    if (!id || !name || !position || !congregation) {
      return NextResponse.json(
        {
          success: false,
          error: "ID, name, position, and congregation are required",
        },
        { status: 400 }
      );
    }

    const councilMemberIndex = councilMembers.findIndex(
      (member) => member.id === id
    );
    if (councilMemberIndex === -1) {
      return NextResponse.json(
        { success: false, error: "Council member not found" },
        { status: 404 }
      );
    }

    // Handle image upload if a new image is provided
    let imagePath = councilMembers[councilMemberIndex].image;
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
        await writeFile(join(process.cwd(), "public", imagePath), buffer);
        console.log(`New council image saved: ${imagePath}`);
      } catch (error) {
        console.error("Error saving new council image:", error);
        return NextResponse.json(
          { success: false, error: "Failed to save new image" },
          { status: 500 }
        );
      }

      // Keep old images - admin will manually delete when needed
      console.log(`New council member image saved: ${imagePath}`);
      console.log(
        `Old council member image kept: ${councilMembers[councilMemberIndex].image}`
      );
    }

    const updatedCouncilMember = {
      ...councilMembers[councilMemberIndex],
      name,
      position,
      congregation,
      phone: phone || "",
      email: email || "",
      description: description || "",
      image: imagePath,
    };

    councilMembers[councilMemberIndex] = updatedCouncilMember;

    await saveCouncilMembers();

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

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = parseInt(searchParams.get("id"));
    const deleteType = searchParams.get("type") || "both";

    const councilMemberIndex = councilMembers.findIndex(
      (member) => member.id === id
    );
    if (councilMemberIndex === -1) {
      return NextResponse.json(
        { success: false, error: "Council member not found" },
        { status: 404 }
      );
    }

    if (deleteType === "both") {
      // Delete the image file if it exists
      if (
        councilMembers[councilMemberIndex].image &&
        councilMembers[councilMemberIndex].image.startsWith("/uploads/council/")
      ) {
        try {
          await unlink(
            join(
              process.cwd(),
              "public",
              councilMembers[councilMemberIndex].image
            )
          );
          console.log(
            `Council member image deleted: ${councilMembers[councilMemberIndex].image}`
          );
        } catch (error) {
          console.error("Error deleting council member image:", error);
        }
      }
      councilMembers.splice(councilMemberIndex, 1);
      await saveCouncilMembers();
      return NextResponse.json({
        success: true,
        message:
          "Council member permanently deleted from both dashboard and main website",
      });
    } else {
      councilMembers[councilMemberIndex].dashboard_deleted = true;
      await saveCouncilMembers();
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

// Load council members on startup
loadCouncilMembers();
