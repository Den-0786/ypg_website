import { NextResponse } from "next/server";
import { writeFile, readFile, unlink } from "fs/promises";
import { join } from "path";

// Database - in production, this would be a real database
let teamMembers = [];

// Helper function to sort team members by hierarchy
function sortTeamMembersByHierarchy(members) {
  const hierarchyOrder = [
    "President",
    "President's Representative",
    "President's Rep",
    "Secretary",
    "Assistant Secretary",
    "Treasurer",
    "Financial Secretary",
    "Organizing Secretary",
    "Public Relations Officer",
    "Welfare Officer",
    "Member",
  ];

  return members.sort((a, b) => {
    const aIndex = hierarchyOrder.findIndex((role) =>
      a.role.toLowerCase().includes(role.toLowerCase())
    );
    const bIndex = hierarchyOrder.findIndex((role) =>
      b.role.toLowerCase().includes(role.toLowerCase())
    );

    // If both roles are found in hierarchy, sort by hierarchy order
    if (aIndex !== -1 && bIndex !== -1) {
      return aIndex - bIndex;
    }

    // If only one role is found, prioritize it
    if (aIndex !== -1) return -1;
    if (bIndex !== -1) return 1;

    // If neither role is in hierarchy, sort alphabetically
    return a.role.localeCompare(b.role);
  });
}

// Helper function to save team members to a file
async function saveTeamMembers() {
  try {
    const filePath = join(process.cwd(), "team-members.json");
    await writeFile(filePath, JSON.stringify(teamMembers, null, 2));
  } catch (error) {
    console.error("Error saving team members:", error);
  }
}

// Helper function to load team members from a file
async function loadTeamMembers() {
  try {
    const filePath = join(process.cwd(), "team-members.json");
    const data = await readFile(filePath, "utf8");
    teamMembers = JSON.parse(data);
  } catch (error) {
    console.error("Error loading team members:", error);
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const deleted = searchParams.get("deleted") === "true";

    // Filter based on deleted status
    let filteredMembers = teamMembers;
    if (deleted) {
      filteredMembers = teamMembers.filter(
        (member) => member.dashboard_deleted
      );
    } else {
      filteredMembers = teamMembers.filter(
        (member) => !member.dashboard_deleted
      );
    }

    // Sort team members by hierarchy order
    const sortedMembers = sortTeamMembersByHierarchy(filteredMembers);

    return NextResponse.json({
      success: true,
      teamMembers: sortedMembers,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch team members" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    const name = formData.get("name");
    const role = formData.get("role");
    const phone = formData.get("phone");
    const quote = formData.get("quote");
    const twitter = formData.get("twitter");
    const facebook = formData.get("facebook");
    const image = formData.get("image");

    // Validate required fields
    if (!name || !role) {
      return NextResponse.json(
        { success: false, error: "Name and role are required" },
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
      imagePath = `/uploads/team/${fileName}`;

      // Save the image file to local storage
      try {
        await writeFile(join(process.cwd(), "public", imagePath), buffer);
      } catch (error) {
        console.error("Error saving image:", error);
        return NextResponse.json(
          { success: false, error: "Failed to save image" },
          { status: 500 }
        );
      }
    }

    const newTeamMember = {
      id:
        teamMembers.length > 0
          ? Math.max(...teamMembers.map((m) => m.id)) + 1
          : 1,
      name,
      role,
      phone: phone || "",
      quote: quote || "",
      image: imagePath,
      social: {
        twitter: twitter || "#",
        facebook: facebook || "#",
      },
    };

    teamMembers.push(newTeamMember);

    // In a real application, you would save to a database
    // await saveTeamMembers();

    return NextResponse.json({
      success: true,
      teamMember: newTeamMember,
      message: "Team member added successfully",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to add team member" },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const formData = await request.formData();
    const id = parseInt(formData.get("id"));
    const name = formData.get("name");
    const role = formData.get("role");
    const phone = formData.get("phone");
    const quote = formData.get("quote");
    const twitter = formData.get("twitter");
    const facebook = formData.get("facebook");
    const image = formData.get("image");

    // Validate required fields
    if (!id || !name || !role) {
      return NextResponse.json(
        { success: false, error: "ID, name, and role are required" },
        { status: 400 }
      );
    }

    const teamMemberIndex = teamMembers.findIndex((member) => member.id === id);
    if (teamMemberIndex === -1) {
      return NextResponse.json(
        { success: false, error: "Team member not found" },
        { status: 404 }
      );
    }

    // Handle image upload if a new image is provided
    let imagePath = teamMembers[teamMemberIndex].image;
    if (image && image.size > 0) {
      const bytes = await image.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Generate unique filename
      const timestamp = Date.now();
      const sanitizedName = image.name.replace(/[^a-zA-Z0-9.-]/g, "_");
      const fileName = `${timestamp}-${sanitizedName}`;
      imagePath = `/uploads/team/${fileName}`;

      // Save the new image file to local storage
      try {
        await writeFile(join(process.cwd(), "public", imagePath), buffer);
      } catch (error) {
        console.error("Error saving new image:", error);
        return NextResponse.json(
          { success: false, error: "Failed to save new image" },
          { status: 500 }
        );
      }

      // Keep old images - admin will manually delete when needed
    }

    const updatedTeamMember = {
      ...teamMembers[teamMemberIndex],
      name,
      role,
      phone: phone || "",
      quote: quote || "",
      image: imagePath,
      social: {
        twitter: twitter || "#",
        facebook: facebook || "#",
      },
    };

    teamMembers[teamMemberIndex] = updatedTeamMember;

    // In a real application, you would save to a database
    // await saveTeamMembers();

    return NextResponse.json({
      success: true,
      teamMember: updatedTeamMember,
      message: "Team member updated successfully",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to update team member" },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = parseInt(searchParams.get("id"));
    const deleteType = searchParams.get("type") || "both";

    const teamMemberIndex = teamMembers.findIndex((member) => member.id === id);
    if (teamMemberIndex === -1) {
      return NextResponse.json(
        { success: false, error: "Team member not found" },
        { status: 404 }
      );
    }

    if (deleteType === "both") {
      teamMembers.splice(teamMemberIndex, 1);
      return NextResponse.json({
        success: true,
        message:
          "Team member permanently deleted from both dashboard and main website",
      });
    } else {
      teamMembers[teamMemberIndex].dashboard_deleted = true;
      return NextResponse.json({
        success: true,
        message: "Team member deleted from dashboard only (hidden from admin)",
      });
    }

    // In a real application, you would save to a database
    // await saveTeamMembers();
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to delete team member" },
      { status: 500 }
    );
  }
}
