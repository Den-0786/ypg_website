import { NextResponse } from "next/server";

// Mock database - in production, this would be a real database
let donations = [
  {
    id: 1,
    donor: "Anonymous",
    email: "anonymous@example.com",
    phone: "+1234567890",
    amount: 500,
    currency: "USD",
    date: "2024-03-10",
    purpose: "Youth Ministry",
    payment_method: "momo",
    status: "confirmed", // pending, confirmed, failed, cancelled
    verification_status: "verified", // pending, verified, rejected
    transaction_id: "TXN_001",
    receipt_code: "RC_001",
    momo_transaction_id: "MTN_123456789",
    admin_verified_by: "admin",
    admin_verified_at: "2024-03-10T14:30:00Z",
    created_at: "2024-03-10T14:30:00Z",
  },
  {
    id: 2,
    donor: "John Doe",
    email: "john.doe@example.com",
    phone: "+1234567891",
    amount: 200,
    currency: "USD",
    date: "2024-03-08",
    purpose: "General Fund",
    payment_method: "cash",
    status: "confirmed",
    verification_status: "verified",
    transaction_id: "TXN_002",
    receipt_code: "RC_002",
    cash_receipt_number: "CR_001",
    admin_verified_by: "admin",
    admin_verified_at: "2024-03-08T10:15:00Z",
    created_at: "2024-03-08T10:15:00Z",
  },
  {
    id: 3,
    donor: "Sarah Smith",
    email: "sarah.smith@example.com",
    phone: "+1234567892",
    amount: 150,
    currency: "USD",
    date: "2024-03-05",
    purpose: "Event Sponsorship",
    payment_method: "bank",
    status: "confirmed",
    verification_status: "verified",
    transaction_id: "TXN_003",
    receipt_code: "RC_003",
    bank_reference: "BR_001",
    admin_verified_by: "admin",
    admin_verified_at: "2024-03-05T16:45:00Z",
    created_at: "2024-03-05T16:45:00Z",
  },
  {
    id: 4,
    donor: "Michael Johnson",
    email: "michael.j@example.com",
    phone: "+1234567893",
    amount: 300,
    currency: "USD",
    date: "2024-03-12",
    purpose: "Building Fund",
    payment_method: "momo",
    status: "pending",
    verification_status: "pending",
    transaction_id: "TXN_004",
    receipt_code: "RC_004",
    momo_transaction_id: null,
    admin_verified_by: null,
    admin_verified_at: null,
    created_at: "2024-03-12T09:20:00Z",
  },
  {
    id: 5,
    donor: "Emily Davis",
    email: "emily.d@example.com",
    phone: "+1234567894",
    amount: 75,
    currency: "USD",
    date: "2024-03-11",
    purpose: "General Fund",
    payment_method: "cash",
    status: "pending",
    verification_status: "pending",
    transaction_id: "TXN_005",
    receipt_code: "RC_005",
    cash_receipt_number: null,
    admin_verified_by: null,
    admin_verified_at: null,
    created_at: "2024-03-11T15:45:00Z",
  },
];

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const purpose = searchParams.get("purpose");
    const verification_status = searchParams.get("verification_status");
    const payment_method = searchParams.get("payment_method");

    let filteredDonations = donations;

    if (status) {
      filteredDonations = filteredDonations.filter(
        (donation) => donation.status === status
      );
    }

    if (purpose) {
      filteredDonations = filteredDonations.filter(
        (donation) => donation.purpose === purpose
      );
    }

    if (verification_status) {
      filteredDonations = filteredDonations.filter(
        (donation) => donation.verification_status === verification_status
      );
    }

    if (payment_method) {
      filteredDonations = filteredDonations.filter(
        (donation) => donation.payment_method === payment_method
      );
    }

    // Calculate totals
    const totalAmount = filteredDonations.reduce(
      (sum, donation) => sum + donation.amount,
      0
    );
    const totalCount = filteredDonations.length;

    // Calculate verified amounts only
    const verifiedAmount = filteredDonations
      .filter((donation) => donation.verification_status === "verified")
      .reduce((sum, donation) => sum + donation.amount, 0);

    return NextResponse.json({
      success: true,
      donations: filteredDonations,
      summary: {
        total_amount: totalAmount,
        total_count: totalCount,
        verified_amount: verifiedAmount,
        verified_count: filteredDonations.filter(
          (d) => d.verification_status === "verified"
        ).length,
        average_amount:
          totalCount > 0 ? Math.round(totalAmount / totalCount) : 0,
      },
    });
  } catch (error) {
    console.error("Error in donations GET:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch donations" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();

    // Generate unique receipt code
    const receiptCode = `RC_${String(donations.length + 1).padStart(3, "0")}`;

    const newDonation = {
      id: donations.length + 1,
      ...body,
      status: "pending", // Always start as pending
      verification_status: "pending", // Always start as pending
      transaction_id: `TXN_${String(donations.length + 1).padStart(3, "0")}`,
      receipt_code: receiptCode,
      momo_transaction_id: null,
      cash_receipt_number: null,
      bank_reference: null,
      admin_verified_by: null,
      admin_verified_at: null,
      created_at: new Date().toISOString(),
    };

    donations.push(newDonation);

    return NextResponse.json({
      success: true,
      donation: newDonation,
      message:
        "Donation submitted successfully. Please complete payment verification.",
      receipt_code: receiptCode,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to record donation" },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    const donationIndex = donations.findIndex((donation) => donation.id === id);
    if (donationIndex === -1) {
      return NextResponse.json(
        { success: false, error: "Donation not found" },
        { status: 404 }
      );
    }

    // If verifying a donation, update verification details
    if (updateData.verification_status === "verified") {
      updateData.admin_verified_by = "admin"; // In real app, get from session
      updateData.admin_verified_at = new Date().toISOString();
      updateData.status = "confirmed";
    }

    donations[donationIndex] = { ...donations[donationIndex], ...updateData };

    return NextResponse.json({
      success: true,
      donation: donations[donationIndex],
      message: "Donation updated successfully",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to update donation" },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = parseInt(searchParams.get("id"));

    const donationIndex = donations.findIndex((donation) => donation.id === id);
    if (donationIndex === -1) {
      return NextResponse.json(
        { success: false, error: "Donation not found" },
        { status: 404 }
      );
    }

    donations.splice(donationIndex, 1);

    return NextResponse.json({
      success: true,
      message: "Donation deleted successfully",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to delete donation" },
      { status: 500 }
    );
  }
}
