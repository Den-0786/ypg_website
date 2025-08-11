import { NextResponse } from "next/server";
import { writeFile, readFile, unlink } from "fs/promises";
import { join } from "path";

// Mock database - in production, this would be a real database
let events = [];

// Helper function to handle image uploads
async function handleImageUpload(image, eventType) {
  if (!image || image.size === 0) return null;

  const bytes = await image.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Generate unique filename
  const timestamp = Date.now();
  const sanitizedName = image.name.replace(/[^a-zA-Z0-9.-]/g, "_");
  const fileName = `${timestamp}-${sanitizedName}`;
  const imagePath = `/uploads/events/${eventType}/${fileName}`;

  // Save the image file to local storage
  try {
    await writeFile(join(process.cwd(), "public", imagePath), buffer);

    return imagePath;
  } catch (error) {
    console.error("Error saving event image:", error);
    throw new Error("Failed to save image");
  }
}

// Helper function to check if event is past and update type
function updateEventType(event) {
  const eventDate = new Date(event.date);
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset time to start of day

  if (eventDate < today && event.type === "upcoming") {
    event.type = "past";
    event.status = "completed";
  }
  return event;
}

// Helper function to get events based on filters
function getFilteredEvents(filters = {}) {
  let filteredEvents = [...events];

  // Update event types based on current date
  filteredEvents = filteredEvents.map(updateEventType);

  // Apply filters
  if (filters.status && filters.status !== "all") {
    filteredEvents = filteredEvents.filter(
      (event) => event.status === filters.status
    );
  }

  if (filters.type && filters.type !== "all") {
    filteredEvents = filteredEvents.filter(
      (event) => event.type === filters.type
    );
  }

  // For main website, exclude deleted events
  if (filters.excludeDeleted !== false) {
    filteredEvents = filteredEvents.filter(
      (event) => event.status !== "deleted"
    );
  }

  return filteredEvents;
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const type = searchParams.get("type");
    const excludeDeleted = searchParams.get("excludeDeleted") !== "false";

    const filters = { status, type, excludeDeleted };
    const filteredEvents = getFilteredEvents(filters);

    return NextResponse.json({
      success: true,
      events: filteredEvents,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch events" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    let eventData;

    // Check if the request is FormData or JSON
    const contentType = request.headers.get("content-type");

    if (contentType && contentType.includes("multipart/form-data")) {
      // Handle FormData (for image uploads)
      const formData = await request.formData();
      eventData = {
        title: formData.get("title"),
        description: formData.get("description"),
        date: formData.get("date"),
        time: formData.get("time"),
        location: formData.get("location"),
        type: formData.get("type") || "upcoming",
        image: formData.get("image"),
      };
    } else {
      // Handle JSON
      eventData = await request.json();
    }

    // Validate required fields
    if (!eventData.title || !eventData.description || !eventData.date) {
      return NextResponse.json(
        { success: false, error: "Title, description, and date are required" },
        { status: 400 }
      );
    }

    // Handle image upload if provided
    let imagePath = null;
    if (eventData.image && eventData.image.size > 0) {
      try {
        imagePath = await handleImageUpload(
          eventData.image,
          eventData.type || "upcoming"
        );
      } catch (error) {
        return NextResponse.json(
          { success: false, error: "Failed to save image" },
          { status: 500 }
        );
      }
    }

    const newEvent = {
      id: events.length + 1,
      title: eventData.title,
      description: eventData.description,
      date: eventData.date,
      time: eventData.time || "",
      location: eventData.location || "",
      type: eventData.type || "upcoming",
      image: imagePath,
      created_at: new Date().toISOString(),
      attendees: 0,
      status: "active",
    };

    // Check if event is already past
    updateEventType(newEvent);

    events.push(newEvent);

    return NextResponse.json({
      success: true,
      event: newEvent,
      message: "Event created successfully",
    });
  } catch (error) {
    console.error("Error creating event:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create event" },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    let updateData;
    let eventId;

    // Check if the request is FormData or JSON
    const contentType = request.headers.get("content-type");

    if (contentType && contentType.includes("multipart/form-data")) {
      // Handle FormData (for image uploads)
      const formData = await request.formData();
      eventId = parseInt(formData.get("id"));
      updateData = {
        title: formData.get("title"),
        description: formData.get("description"),
        date: formData.get("date"),
        time: formData.get("time"),
        location: formData.get("location"),
        type: formData.get("type"),
        image: formData.get("image"),
      };
    } else {
      // Handle JSON
      const body = await request.json();
      const { id, ...data } = body;
      eventId = id;
      updateData = data;
    }

    if (!eventId) {
      return NextResponse.json(
        { success: false, error: "Event ID is required" },
        { status: 400 }
      );
    }

    const eventIndex = events.findIndex((event) => event.id === eventId);
    if (eventIndex === -1) {
      return NextResponse.json(
        { success: false, error: "Event not found" },
        { status: 404 }
      );
    }

    // Handle image upload if a new image is provided
    let imagePath = events[eventIndex].image;
    if (updateData.image && updateData.image.size > 0) {
      try {
        imagePath = await handleImageUpload(
          updateData.image,
          updateData.type || events[eventIndex].type
        );

        // Keep old images for events - admin can manually delete if needed
      } catch (error) {
        return NextResponse.json(
          { success: false, error: "Failed to save new image" },
          { status: 500 }
        );
      }
    }

    // Update the event
    events[eventIndex] = {
      ...events[eventIndex],
      ...updateData,
      image: imagePath,
    };

    // Update event type based on new date
    updateEventType(events[eventIndex]);

    return NextResponse.json({
      success: true,
      event: events[eventIndex],
      message: "Event updated successfully",
    });
  } catch (error) {
    console.error("Error updating event:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update event" },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = parseInt(searchParams.get("id"));
    const deleteType = searchParams.get("type") || "both";

    const eventIndex = events.findIndex((event) => event.id === id);
    if (eventIndex === -1) {
      return NextResponse.json(
        { success: false, error: "Event not found" },
        { status: 404 }
      );
    }

    if (deleteType === "both") {
      // Hard delete - remove from array completely
      events.splice(eventIndex, 1);
      return NextResponse.json({
        success: true,
        message:
          "Event permanently deleted from both dashboard and main website",
      });
    } else {
      // Soft delete - mark as dashboard_deleted
      events[eventIndex].dashboard_deleted = true;
      return NextResponse.json({
        success: true,
        message: "Event deleted from dashboard only (hidden from admin)",
      });
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to delete event" },
      { status: 500 }
    );
  }
}
