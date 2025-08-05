import { NextResponse } from 'next/server';

// Mock database - in production, this would be a real database
let donations = [
  {
    id: 1,
    donor: "Anonymous",
    email: "anonymous@example.com",
    amount: 500,
    currency: "USD",
    date: "2024-03-10",
    purpose: "Youth Ministry",
    payment_method: "online",
    status: "completed",
    transaction_id: "TXN_001",
    created_at: "2024-03-10T14:30:00Z"
  },
  {
    id: 2,
    donor: "John Doe",
    email: "john.doe@example.com",
    amount: 200,
    currency: "USD",
    date: "2024-03-08",
    purpose: "General Fund",
    payment_method: "online",
    status: "completed",
    transaction_id: "TXN_002",
    created_at: "2024-03-08T10:15:00Z"
  },
  {
    id: 3,
    donor: "Sarah Smith",
    email: "sarah.smith@example.com",
    amount: 150,
    currency: "USD",
    date: "2024-03-05",
    purpose: "Event Sponsorship",
    payment_method: "check",
    status: "pending",
    transaction_id: "TXN_003",
    created_at: "2024-03-05T16:45:00Z"
  }
];

export async function GET() {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const purpose = searchParams.get('purpose');
    
    let filteredDonations = donations;
    
    if (status) {
      filteredDonations = filteredDonations.filter(donation => donation.status === status);
    }
    
    if (purpose) {
      filteredDonations = filteredDonations.filter(donation => donation.purpose === purpose);
    }
    
    // Calculate totals
    const totalAmount = filteredDonations.reduce((sum, donation) => sum + donation.amount, 0);
    const totalCount = filteredDonations.length;
    
    return NextResponse.json({
      success: true,
      donations: filteredDonations,
      summary: {
        total_amount: totalAmount,
        total_count: totalCount,
        average_amount: totalCount > 0 ? Math.round(totalAmount / totalCount) : 0
      }
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch donations' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    
    const newDonation = {
      id: donations.length + 1,
      ...body,
      created_at: new Date().toISOString(),
      transaction_id: `TXN_${String(donations.length + 1).padStart(3, '0')}`,
      status: body.status || 'pending'
    };
    
    donations.push(newDonation);
    
    return NextResponse.json({
      success: true,
      donation: newDonation,
      message: 'Donation recorded successfully'
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to record donation' },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;
    
    const donationIndex = donations.findIndex(donation => donation.id === id);
    if (donationIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Donation not found' },
        { status: 404 }
      );
    }
    
    donations[donationIndex] = { ...donations[donationIndex], ...updateData };
    
    return NextResponse.json({
      success: true,
      donation: donations[donationIndex],
      message: 'Donation updated successfully'
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to update donation' },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = parseInt(searchParams.get('id'));
    
    const donationIndex = donations.findIndex(donation => donation.id === id);
    if (donationIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Donation not found' },
        { status: 404 }
      );
    }
    
    donations.splice(donationIndex, 1);
    
    return NextResponse.json({
      success: true,
      message: 'Donation deleted successfully'
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to delete donation' },
      { status: 500 }
    );
  }
} 