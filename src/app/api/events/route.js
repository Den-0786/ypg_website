import { NextResponse } from 'next/server';

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
    image: "/images/events/conference-2024.jpg",
    created_at: "2024-01-15T10:00:00Z"
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
    image: "/images/events/bible-study.jpg",
    created_at: "2024-01-10T14:30:00Z"
  }
];

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      events: events
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch events' },
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
      status: 'active'
    };
    
    events.push(newEvent);
    
    return NextResponse.json({
      success: true,
      event: newEvent,
      message: 'Event created successfully'
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to create event' },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;
    
    const eventIndex = events.findIndex(event => event.id === id);
    if (eventIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Event not found' },
        { status: 404 }
      );
    }
    
    events[eventIndex] = { ...events[eventIndex], ...updateData };
    
    return NextResponse.json({
      success: true,
      event: events[eventIndex],
      message: 'Event updated successfully'
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to update event' },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = parseInt(searchParams.get('id'));
    
    const eventIndex = events.findIndex(event => event.id === id);
    if (eventIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Event not found' },
        { status: 404 }
      );
    }
    
    events.splice(eventIndex, 1);
    
    return NextResponse.json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to delete event' },
      { status: 500 }
    );
  }
} 