import { NextResponse } from "next/server";

// Mock contact messages data (in production, this would come from a database)
let contactMessages = [
  {
    id: 1,
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "+233 24 123 4567",
    subject: "Inquiry about Youth Ministry",
    message:
      "I'm interested in joining the youth ministry. Can you provide more information?",
    status: "new",
    createdAt: "2024-01-15T10:00:00.000Z",
    updatedAt: "2024-01-15T10:00:00.000Z",
  },
  {
    id: 2,
    name: "Sarah Smith",
    email: "sarah.smith@example.com",
    phone: "+233 20 987 6543",
    subject: "Event Inquiry",
    message: "When is the next youth event? I'd like to participate.",
    status: "responded",
    createdAt: "2024-01-10T14:30:00.000Z",
    updatedAt: "2024-01-12T09:15:00.000Z",
  },
];

// GET - Fetch contact messages (for admin)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const limit = parseInt(searchParams.get("limit")) || 50;

    let filteredMessages = contactMessages;

    if (status) {
      filteredMessages = filteredMessages.filter(
        (msg) => msg.status === status
      );
    }

    // Sort by newest first
    filteredMessages.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    // Apply limit
    if (limit > 0) {
      filteredMessages = filteredMessages.slice(0, limit);
    }

    return NextResponse.json({
      success: true,
      messages: filteredMessages,
      total: filteredMessages.length,
    });
  } catch (error) {
    console.error("Error fetching contact messages:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch contact messages" },
      { status: 500 }
    );
  }
}

// POST - Submit new contact message
export async function POST(request) {
  try {
    const messageData = await request.json();
    const { name, email, phone, subject, message } = messageData;

    // Validation
    const errors = {};
    if (!name?.trim()) errors.name = "Name is required";
    if (!email?.trim()) errors.email = "Email is required";
    if (!subject?.trim()) errors.subject = "Subject is required";
    if (!message?.trim()) errors.message = "Message is required";

    // Email validation
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "Please enter a valid email address";
    }

    // Phone validation (optional, but if provided should be valid)
    if (phone && !/^(\+233|0)[0-9]{9}$/.test(phone)) {
      errors.phone = "Please enter a valid Ghanaian phone number";
    }

    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ success: false, errors }, { status: 400 });
    }

    const newMessage = {
      id: Math.max(...contactMessages.map((msg) => msg.id), 0) + 1,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone?.trim() || null,
      subject: subject.trim(),
      message: message.trim(),
      status: "new",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    contactMessages.push(newMessage);

    // In production, you would also:
    // 1. Send email notification to admins
    // 2. Send auto-reply to user
    // 3. Log the submission

    return NextResponse.json({
      success: true,
      message: "Thank you for your message! We'll get back to you soon.",
      id: newMessage.id,
    });
  } catch (error) {
    console.error("Error submitting contact message:", error);
    return NextResponse.json(
      { success: false, error: "Failed to submit message. Please try again." },
      { status: 500 }
    );
  }
}

// PUT - Update contact message status (for admin)
export async function PUT(request) {
  try {
    const updateData = await request.json();
    const { id, status, adminNotes } = updateData;

    const messageIndex = contactMessages.findIndex((msg) => msg.id === id);
    if (messageIndex === -1) {
      return NextResponse.json(
        { success: false, error: "Message not found" },
        { status: 404 }
      );
    }

    // Valid statuses
    const validStatuses = [
      "new",
      "in_progress",
      "responded",
      "resolved",
      "archived",
    ];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, error: "Invalid status" },
        { status: 400 }
      );
    }

    // Update the message
    contactMessages[messageIndex] = {
      ...contactMessages[messageIndex],
      status: status || contactMessages[messageIndex].status,
      adminNotes: adminNotes || contactMessages[messageIndex].adminNotes,
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      message: contactMessages[messageIndex],
    });
  } catch (error) {
    console.error("Error updating contact message:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update message" },
      { status: 500 }
    );
  }
}

// DELETE - Delete contact message (for admin)
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = parseInt(searchParams.get("id"));

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Message ID is required" },
        { status: 400 }
      );
    }

    const messageIndex = contactMessages.findIndex((msg) => msg.id === id);
    if (messageIndex === -1) {
      return NextResponse.json(
        { success: false, error: "Message not found" },
        { status: 404 }
      );
    }

    contactMessages.splice(messageIndex, 1);

    return NextResponse.json({
      success: true,
      message: "Contact message deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting contact message:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete message" },
      { status: 500 }
    );
  }
}
