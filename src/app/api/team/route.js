import { NextResponse } from "next/server";
import { writeFile, readFile, unlink } from "fs/promises";
import { join } from "path";

// Mock database - in production, this would be a real database
let teamMembers = [
  {
    id: 1,
    name: "Dennis Opoku A",
    role: "President",
    image: "/hero.jpg",
    phone: "xxxxxxxxxxx",
    quote: "Leading with vision and purpose.",
    social: { twitter: "#", facebook: "#" },
  },
  {
    id: 2,
    name: "Priscilla Amoako",
    role: "Secretary",
    image: "/rita.jpg",
    phone: "xxxxxxxxxxx",
    quote: "Serving with excellence.",
    social: { twitter: "#", facebook: "#" },
  },
  {
    id: 3,
    name: "Samuel Owusu",
    role: "Organizer",
    image: "/jy.jpeg",
    phone: "xxxxxxxxxxx",
    quote: "Organizing for impact.",
    social: { twitter: "#", facebook: "#" },
  },
  {
    id: 4,
    name: "Irene A. Sarkodie",
    role: "Assistant Secretary",
    image: "/mission.jpg",
    phone: "xxxxxxxxxxx",
    quote: "Interceding faithfully.",
    social: { twitter: "#", facebook: "#" },
  },
  {
    id: 5,
    name: "Grace Nyarko",
    role: "Prayer Secretary",
    image: "/images.jpeg",
    phone: "xxxxxxxxxxx",
    quote: "Interceding faithfully.",
    social: { twitter: "#", facebook: "#" },
  },
  {
    id: 6,
    name: "Kwabena Asante",
    role: "Treasurer",
    image: "/images (1).jpeg",
    phone: "xxxxxxxxxxx",
    quote: "Stewardship with integrity.",
    social: { twitter: "#", facebook: "#" },
  },
  {
    id: 7,
    name: "Lydia Boateng",
    role: "Music Director",
    image: "/cloth and hymn.jpeg",
    phone: "xxxxxxxxxxx",
    quote: "Leading worship with passion.",
    social: { twitter: "#", facebook: "#" },
  },
  {
    id: 8,
    name: "John Mensah",
    role: "Vice President",
    image: "/style.jpeg",
    phone: "xxxxxxxxxxx",
    quote: "Supporting with strength and grace.",
    social: { twitter: "#", facebook: "#" },
  },
];

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

    return NextResponse.json({
      success: true,
      teamMembers: filteredMembers,
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

      // In a real application, you would save the image to a storage service
      // For now, we'll just use a placeholder
      imagePath = `/uploads/team/${Date.now()}-${image.name}`;

      // Save the image file (in a real app, you'd use a proper storage solution)
      // await writeFile(join(process.cwd(), 'public', imagePath), buffer);
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

      // In a real application, you would save the image to a storage service
      // For now, we'll just use a placeholder
      imagePath = `/uploads/team/${Date.now()}-${image.name}`;

      // Save the image file (in a real app, you'd use a proper storage solution)
      // await writeFile(join(process.cwd(), 'public', imagePath), buffer);

      // Delete the old image if it exists (in a real app)
      // if (teamMembers[teamMemberIndex].image) {
      //   try {
      //     await unlink(join(process.cwd(), 'public', teamMembers[teamMemberIndex].image));
      //   } catch (error) {
      //     console.error('Error deleting old image:', error);
      //   }
      // }
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
