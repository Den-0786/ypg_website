import { NextResponse } from "next/server";

// Mock database - in production, this would be a real database
let ministries = [
  {
    id: 1,
    name: "Y-Singers 🎤",
    description: "Youth choir focused on gospel music and worship leading.",
    leaderName: "Sarah Addo",
    leaderPhone: "+233 24 123 4567",
    color: "from-purple-500 to-pink-500",
  },
  {
    id: 2,
    name: "Y-Jama Troop 🪘",
    description:
      "Cultural dance and traditional praise group showcasing Ghanaian heritage.",
    leaderName: "Kwame Mensah",
    leaderPhone: "+233 20 987 6543",
    color: "from-amber-500 to-orange-500",
  },
  {
    id: 3,
    name: "Choreography Group 💃",
    description: "Creative expression of worship through dance and movement.",
    leaderName: "Grace Osei",
    leaderPhone: "+233 26 555 1234",
    color: "from-blue-500 to-teal-500",
  },
  {
    id: 4,
    name: "Evangelism & Prayer Team 🙏",
    description:
      "Leads outreach, prayer meetings, and spiritual growth programs.",
    leaderName: "Daniel Kofi",
    leaderPhone: "+233 27 888 9999",
    color: "from-green-500 to-emerald-500",
  },
  {
    id: 5,
    name: "Y-Media 🎥",
    description:
      "Manages visual content, social media, and church media coverage.",
    leaderName: "Michael Asante",
    leaderPhone: "+233 25 777 6666",
    color: "from-red-500 to-rose-500",
  },
  {
    id: 6,
    name: "Dancing Group 🕺",
    description:
      "Contemporary dance ministry expressing joy and praise through movement.",
    leaderName: "Abena Poku",
    leaderPhone: "+233 23 444 3333",
    color: "from-indigo-500 to-purple-600",
  },
  {
    id: 7,
    name: "Ushering Wing 👥",
    description:
      "Welcomes and guides worshippers, maintains order during services.",
    leaderName: "John Owusu",
    leaderPhone: "+233 28 222 1111",
    color: "from-emerald-500 to-green-600",
  },
  {
    id: 8,
    name: "Youth Bible Study 📖",
    description:
      "Deep dive into scripture, theological discussions, and spiritual growth.",
    leaderName: "Esther Boateng",
    leaderPhone: "+233 29 333 4444",
    color: "from-orange-500 to-red-500",
  },
];

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
    const body = await request.json();

    const newMinistry = {
      id: ministries.length + 1,
      ...body,
      created_at: new Date().toISOString(),
    };

    ministries.push(newMinistry);

    return NextResponse.json({
      success: true,
      ministry: newMinistry,
      message: "Ministry added successfully",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to add ministry" },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    const ministryIndex = ministries.findIndex(
      (ministry) => ministry.id === id
    );
    if (ministryIndex === -1) {
      return NextResponse.json(
        { success: false, error: "Ministry not found" },
        { status: 404 }
      );
    }

    ministries[ministryIndex] = { ...ministries[ministryIndex], ...updateData };

    return NextResponse.json({
      success: true,
      ministry: ministries[ministryIndex],
      message: "Ministry updated successfully",
    });
  } catch (error) {
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
