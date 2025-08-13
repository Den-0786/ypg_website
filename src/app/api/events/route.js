import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import { join } from "path";
import pool from "@/lib/database.js";

// GET - Fetch events
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const limit = parseInt(searchParams.get("limit")) || 10;

    let query = "SELECT * FROM events WHERE dashboard_deleted = false";
    let params = [];
    let paramIndex = 1;

    if (type === "past") {
      // For past events, check if end_date is in the past, or if no end_date, check start_date
      query += ` AND (end_date < CURRENT_DATE OR (end_date IS NULL AND start_date < CURRENT_DATE))`;
    } else if (type === "upcoming") {
      // For upcoming events, check if start_date is in the future
      query += ` AND start_date >= CURRENT_DATE`;
    } else if (type) {
      query += ` AND type = $${paramIndex}`;
      params.push(type);
      paramIndex++;
    }

    query += ` ORDER BY start_date DESC, created_at DESC LIMIT $${paramIndex}`;
    params.push(limit);

    const result = await pool.query(query, params);

    return NextResponse.json({
      success: true,
      events: result.rows,
      total: result.rows.length,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch events" },
      { status: 500 }
    );
  }
}

// POST - Create new event
export async function POST(request) {
  try {
    const contentType = request.headers.get("content-type");
    let eventData;

    if (contentType && contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      eventData = {
        title: formData.get("title"),
        description: formData.get("description"),
        start_date: formData.get("start_date"),
        start_time: formData.get("start_time"),
        end_date: formData.get("end_date"),
        end_time: formData.get("end_time"),
        location: formData.get("location"),
        type: formData.get("type"),
        image: formData.get("image"),
      };
    } else {
      eventData = await request.json();
    }

    // Validation
    const errors = {};
    if (!eventData.title?.trim()) errors.title = "Title is required";
    if (!eventData.description?.trim())
      errors.description = "Description is required";
    if (!eventData.start_date?.trim())
      errors.start_date = "Start date is required";

    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ success: false, errors }, { status: 400 });
    }

    // Handle image upload if provided
    let imagePath = "/placeholder-event.jpg";
    if (eventData.image && eventData.image.size > 0) {
      const bytes = await eventData.image.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const timestamp = Date.now();
      const sanitizedName = eventData.image.name.replace(
        /[^a-zA-Z0-9.-]/g,
        "_"
      );
      const fileName = `${timestamp}-${sanitizedName}`;
      imagePath = `/uploads/events/${fileName}`;

      try {
        const uploadDir = join(process.cwd(), "public", "uploads", "events");
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
      INSERT INTO events (
        title, description, start_date, start_time, end_date, end_time, location, type, image, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;

    const insertParams = [
      eventData.title,
      eventData.description,
      eventData.start_date,
      eventData.start_time || null,
      eventData.end_date || null,
      eventData.end_time || null,
      eventData.location || "",
      eventData.type || "upcoming",
      imagePath,
      "active",
    ];

    const result = await pool.query(insertQuery, insertParams);
    const newEvent = result.rows[0];

    return NextResponse.json({
      success: true,
      event: newEvent,
      message: "Event created successfully",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to create event" },
      { status: 500 }
    );
  }
}

// PUT - Update event
export async function PUT(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = parseInt(searchParams.get("id"));

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Event ID is required" },
        { status: 400 }
      );
    }

    const contentType = request.headers.get("content-type");
    let updateData;

    if (contentType && contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      updateData = {
        title: formData.get("title"),
        description: formData.get("description"),
        start_date: formData.get("start_date"),
        start_time: formData.get("start_time"),
        end_date: formData.get("end_date"),
        end_time: formData.get("end_time"),
        location: formData.get("location"),
        type: formData.get("type"),
        image: formData.get("image"),
      };
    } else {
      updateData = await request.json();
    }

    const checkResult = await pool.query("SELECT * FROM events WHERE id = $1", [
      id,
    ]);

    if (checkResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: "Event not found" },
        { status: 404 }
      );
    }

    const existingEvent = checkResult.rows[0];

    // Handle image upload if a new image is provided
    let imagePath = existingEvent.image;
    if (updateData.image && updateData.image.size > 0) {
      const bytes = await updateData.image.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const timestamp = Date.now();
      const sanitizedName = updateData.image.name.replace(
        /[^a-zA-Z0-9.-]/g,
        "_"
      );
      const fileName = `${timestamp}-${sanitizedName}`;
      imagePath = `/uploads/events/${fileName}`;

      try {
        const uploadDir = join(process.cwd(), "public", "uploads", "events");
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
      UPDATE events SET
        title = $1,
        description = $2,
        start_date = $3,
        start_time = $4,
        end_date = $5,
        end_time = $6,
        location = $7,
        type = $8,
        image = $9,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $10
      RETURNING *
    `;

    const updateParams = [
      updateData.title,
      updateData.description,
      updateData.start_date,
      updateData.start_time || null,
      updateData.end_date || null,
      updateData.end_time || null,
      updateData.location || "",
      updateData.type || "upcoming",
      imagePath,
      id,
    ];

    const result = await pool.query(updateQuery, updateParams);
    const updatedEvent = result.rows[0];

    return NextResponse.json({
      success: true,
      event: updatedEvent,
      message: "Event updated successfully",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to update event" },
      { status: 500 }
    );
  }
}

// DELETE - Delete event
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = parseInt(searchParams.get("id"));
    const deleteType = searchParams.get("type") || "soft";

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Event ID is required" },
        { status: 400 }
      );
    }

    if (deleteType === "hard") {
      const result = await pool.query(
        "DELETE FROM events WHERE id = $1 RETURNING id",
        [id]
      );

      if (result.rows.length === 0) {
        return NextResponse.json(
          { success: false, error: "Event not found" },
          { status: 404 }
        );
      }
    } else {
      const result = await pool.query(
        "UPDATE events SET dashboard_deleted = true, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING id",
        [id]
      );

      if (result.rows.length === 0) {
        return NextResponse.json(
          { success: false, error: "Event not found" },
          { status: 404 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: `Event ${deleteType === "hard" ? "permanently deleted" : "marked as deleted"}`,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to delete event" },
      { status: 500 }
    );
  }
}
