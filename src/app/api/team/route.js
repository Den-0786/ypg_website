import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import { join } from "path";
import pool from "@/lib/database.js";

// GET - Fetch team members
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const position = searchParams.get("position");
    const limit = parseInt(searchParams.get("limit")) || 10;

    let query = "SELECT * FROM team_members WHERE dashboard_deleted = false";
    let params = [];
    let paramIndex = 1;

    if (position) {
      query += ` AND position = $${paramIndex}`;
      params.push(position);
      paramIndex++;
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramIndex}`;
    params.push(limit);

    const result = await pool.query(query, params);

    return NextResponse.json({
      success: true,
      team: result.rows,
      total: result.rows.length,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch team members" },
      { status: 500 }
    );
  }
}

// POST - Create new team member
export async function POST(request) {
  try {
    const contentType = request.headers.get("content-type");
    let memberData;

    if (contentType && contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      memberData = {
        name: formData.get("name"),
        position: formData.get("position"),
        department: formData.get("department"),
        bio: formData.get("bio"),
        image: formData.get("image"),
      };
    } else {
      memberData = await request.json();
    }

    // Validation
    const errors = {};
    if (!memberData.name?.trim()) errors.name = "Name is required";
    if (!memberData.position?.trim()) errors.position = "Position is required";

    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ success: false, errors }, { status: 400 });
    }

    // Handle image upload if provided
    let imagePath = "/placeholder-team.jpg";
    if (memberData.image && memberData.image.size > 0) {
      const bytes = await memberData.image.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const timestamp = Date.now();
      const sanitizedName = memberData.image.name.replace(
        /[^a-zA-Z0-9.-]/g,
        "_"
      );
      const fileName = `${timestamp}-${sanitizedName}`;
      imagePath = `/uploads/team/${fileName}`;

      try {
        const uploadDir = join(process.cwd(), "public", "uploads", "team");
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
      INSERT INTO team_members (
        name, position, department, bio, image
      ) VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;

    const insertParams = [
      memberData.name,
      memberData.position,
      memberData.department || "",
      memberData.bio || "",
      imagePath,
    ];

    const result = await pool.query(insertQuery, insertParams);
    const newMember = result.rows[0];

    return NextResponse.json({
      success: true,
      member: newMember,
      message: "Team member created successfully",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to create team member" },
      { status: 500 }
    );
  }
}

// PUT - Update team member
export async function PUT(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = parseInt(searchParams.get("id"));

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Member ID is required" },
        { status: 400 }
      );
    }

    const contentType = request.headers.get("content-type");
    let updateData;

    if (contentType && contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      updateData = {
        name: formData.get("name"),
        position: formData.get("position"),
        department: formData.get("department"),
        bio: formData.get("bio"),
        image: formData.get("image"),
      };
    } else {
      updateData = await request.json();
    }

    const checkResult = await pool.query(
      "SELECT * FROM team_members WHERE id = $1",
      [id]
    );

    if (checkResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: "Team member not found" },
        { status: 404 }
      );
    }

    const existingMember = checkResult.rows[0];

    // Handle image upload if a new image is provided
    let imagePath = existingMember.image;
    if (updateData.image && updateData.image.size > 0) {
      const bytes = await updateData.image.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const timestamp = Date.now();
      const sanitizedName = updateData.image.name.replace(
        /[^a-zA-Z0-9.-]/g,
        "_"
      );
      const fileName = `${timestamp}-${sanitizedName}`;
      imagePath = `/uploads/team/${fileName}`;

      try {
        const uploadDir = join(process.cwd(), "public", "uploads", "team");
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
      UPDATE team_members SET
        name = $1,
        position = $2,
        department = $3,
        bio = $4,
        image = $5,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $6
      RETURNING *
    `;

    const updateParams = [
      updateData.name,
      updateData.position,
      updateData.department || "",
      updateData.bio || "",
      imagePath,
      id,
    ];

    const result = await pool.query(updateQuery, updateParams);
    const updatedMember = result.rows[0];

    return NextResponse.json({
      success: true,
      member: updatedMember,
      message: "Team member updated successfully",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to update team member" },
      { status: 500 }
    );
  }
}

// DELETE - Delete team member
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = parseInt(searchParams.get("id"));
    const deleteType = searchParams.get("type") || "soft";

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Member ID is required" },
        { status: 400 }
      );
    }

    if (deleteType === "hard") {
      const result = await pool.query(
        "DELETE FROM team_members WHERE id = $1 RETURNING id",
        [id]
      );

      if (result.rows.length === 0) {
        return NextResponse.json(
          { success: false, error: "Team member not found" },
          { status: 404 }
        );
      }
    } else {
      const result = await pool.query(
        "UPDATE team_members SET dashboard_deleted = true, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING id",
        [id]
      );

      if (result.rows.length === 0) {
        return NextResponse.json(
          { success: false, error: "Team member not found" },
          { status: 404 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: `Team member ${deleteType === "hard" ? "permanently deleted" : "marked as deleted"}`,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to delete team member" },
      { status: 500 }
    );
  }
}
