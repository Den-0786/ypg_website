import { NextResponse } from "next/server";
import { readFile, writeFile } from "fs/promises";
import { join } from "path";

let donations = [];

// Load donations from file
const loadDonations = async () => {
  try {
    const filePath = join(process.cwd(), "donations.json");
    const data = await readFile(filePath, "utf8");
    donations = JSON.parse(data);
  } catch (error) {
    console.error("Error loading donations:", error);
    donations = [];
  }
};

// Save donations to file
const saveDonations = async () => {
  try {
    const filePath = join(process.cwd(), "donations.json");
    await writeFile(filePath, JSON.stringify(donations, null, 2));
  } catch (error) {
    console.error("Error saving donations:", error);
  }
};

// Initialize data on first load
if (donations.length === 0) {
  loadDonations();
}

export async function GET(request) {
  try {
    await loadDonations();
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
      (sum, donation) => sum + (donation.amount || 0),
      0
    );
    const totalCount = filteredDonations.length;

    // Calculate verified amounts only
    const verifiedAmount = filteredDonations
      .filter((donation) => donation.verification_status === "verified")
      .reduce((sum, donation) => sum + (donation.amount || 0), 0);

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
      id: Date.now().toString(),
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
    await saveDonations();

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
    await saveDonations();

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
    const id = searchParams.get("id");

    const donationIndex = donations.findIndex((donation) => donation.id === id);
    if (donationIndex === -1) {
      return NextResponse.json(
        { success: false, error: "Donation not found" },
        { status: 404 }
      );
    }

    donations.splice(donationIndex, 1);
    await saveDonations();

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
