import { NextResponse } from "next/server";

// Mock database - in production, this would be a real database
let events = [
  {
    id: 1,
    title: "Youth Conference 2024",
    description: "Annual youth conference with workshops and activities",
    date: "2024-03-15",
    time: "09:00",
    location: "Main Church Hall",
    type: "upcoming",
    attendees: 150,
    status: "active",
    image: "/hero/youth.jpeg",
    created_at: "2024-01-15T10:00:00Z",
  },
  {
    id: 2,
    title: "Bible Study Workshop",
    description: "Interactive bible study session for youth",
    date: "2024-02-20",
    time: "18:00",
    location: "Youth Center",
    type: "past",
    attendees: 75,
    status: "completed",
    image: "/hero/database.jpeg",
    created_at: "2024-01-10T14:30:00Z",
  },
];

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
    const body = await request.json();

    const newEvent = {
      id: events.length + 1,
      ...body,
      created_at: new Date().toISOString(),
      attendees: 0,
      status: "active",
      type: "upcoming",
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
    return NextResponse.json(
      { success: false, error: "Failed to create event" },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    const eventIndex = events.findIndex((event) => event.id === id);
    if (eventIndex === -1) {
      return NextResponse.json(
        { success: false, error: "Event not found" },
        { status: 404 }
      );
    }

    events[eventIndex] = { ...events[eventIndex], ...updateData };

    // Update event type based on new date
    updateEventType(events[eventIndex]);

    return NextResponse.json({
      success: true,
      event: events[eventIndex],
      message: "Event updated successfully",
    });
  } catch (error) {
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
