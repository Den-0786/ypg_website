import { NextResponse } from "next/server";
import { writeFile, readFile, unlink } from "fs/promises";
import { join } from "path";

// Mock database - in production, this would be a real database
let councilMembers = [
  {
    id: 1,
    name: "Rev. Emmanuel Asante",
    position: "Branch President",
    congregation: "Kumasi Central",
    image: "/hero.jpg",
    phone: "0244123456",
    email: "emmanuel.asante@ypg.com",
    description: "Leading with wisdom and spiritual guidance.",
  },
  {
    id: 2,
    name: "Sister Grace Osei",
    position: "Branch Secretary",
    congregation: "Kumasi Central",
    image: "/rita.jpg",
    phone: "0244234567",
    email: "grace.osei@ypg.com",
    description: "Serving with dedication and excellence.",
  },
  {
    id: 3,
    name: "Elder Samuel Boateng",
    position: "Branch President",
    congregation: "Accra North",
    image: "/jy.jpeg",
    phone: "0244345678",
    email: "samuel.boateng@ypg.com",
    description: "Committed to youth development and spiritual growth.",
  },
  {
    id: 4,
    name: "Sister Mary Adjei",
    position: "Branch Secretary",
    congregation: "Accra North",
    image: "/mission.jpg",
    phone: "0244456789",
    email: "mary.adjei@ypg.com",
    description: "Organizing with passion and commitment.",
  },
];

// Helper function to save council members to a file
async function saveCouncilMembers() {
  try {
    const filePath = join(process.cwd(), "data", "council-members.json");
    await writeFile(filePath, JSON.stringify(councilMembers, null, 2));
  } catch (error) {
    console.error("Error saving council members:", error);
  }
}

async function loadCouncilMembers() {
  try {
    const filePath = join(process.cwd(), "data", "council-members.json");
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

      // In a real application, you would save the image to a storage service
      // For now, we'll just use a placeholder
      imagePath = `/uploads/council/${Date.now()}-${image.name}`;

      // Save the image file (in a real app, you'd use a proper storage solution)
      // await writeFile(join(process.cwd(), 'public', imagePath), buffer);
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

    // In a real application, you would save to a database
    // await saveCouncilMembers();

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

      // In a real application, you would save the image to a storage service
      // For now, we'll just use a placeholder
      imagePath = `/uploads/council/${Date.now()}-${image.name}`;

      // Save the image file (in a real app, you'd use a proper storage solution)
      // await writeFile(join(process.cwd(), 'public', imagePath), buffer);
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

    // In a real application, you would save to a database
    // await saveCouncilMembers();

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
      councilMembers.splice(councilMemberIndex, 1);
      return NextResponse.json({
        success: true,
        message:
          "Council member permanently deleted from both dashboard and main website",
      });
    } else {
      councilMembers[councilMemberIndex].dashboard_deleted = true;
      return NextResponse.json({
        success: true,
        message:
          "Council member deleted from dashboard only (hidden from admin)",
      });
    }

    // In a real application, you would save to a database
    // await saveCouncilMembers();
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to delete council member" },
      { status: 500 }
    );
  }
}


