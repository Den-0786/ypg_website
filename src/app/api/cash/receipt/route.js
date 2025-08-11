import { NextResponse } from "next/server";
import { readFile, writeFile } from "fs/promises";
import { join } from "path";

let cashReceipts = [];

// Load cash receipts from file
const loadCashReceipts = async () => {
  try {
    const filePath = join(process.cwd(), "cash-receipts.json");
    const data = await readFile(filePath, "utf8");
    cashReceipts = JSON.parse(data);
  } catch (error) {
    console.error("Error loading cash receipts:", error);
    cashReceipts = [];
  }
};

// Save cash receipts to file
const saveCashReceipts = async () => {
  try {
    const filePath = join(process.cwd(), "cash-receipts.json");
    await writeFile(filePath, JSON.stringify(cashReceipts, null, 2));
  } catch (error) {
    console.error("Error saving cash receipts:", error);
  }
};

// Initialize data on first load
if (cashReceipts.length === 0) {
  loadCashReceipts();
}

export async function POST(request) {
  try {
    const { donorName, amount, issuedBy } = await request.json();

    // Validate required fields
    if (!donorName || !amount || !issuedBy) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: donorName, amount, issuedBy",
        },
        { status: 400 }
      );
    }

    // Generate unique receipt number
    const receiptNumber = `CR_${String(cashReceipts.length + 1).padStart(3, "0")}`;

    const newReceipt = {
      receiptNumber: receiptNumber,
      donorName: donorName,
      amount: parseFloat(amount),
      date: new Date().toISOString().split("T")[0],
      issuedBy: issuedBy,
      verified: false,
      timestamp: new Date().toISOString(),
    };

    cashReceipts.push(newReceipt);
    await saveCashReceipts();

    return NextResponse.json({
      success: true,
      receipt: newReceipt,
      message: "Cash receipt generated successfully",
    });
  } catch (error) {
    console.error("Error generating cash receipt:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}

// GET endpoint for verifying cash receipts
export async function GET(request) {
  try {
    await loadCashReceipts();
    const { searchParams } = new URL(request.url);
    const receiptNumber = searchParams.get("receiptNumber");

    if (!receiptNumber) {
      return NextResponse.json(
        {
          success: false,
          error: "Receipt number is required",
        },
        { status: 400 }
      );
    }

    const receipt = cashReceipts.find((r) => r.receiptNumber === receiptNumber);

    if (!receipt) {
      return NextResponse.json({
        success: false,
        verified: false,
        error: "Receipt not found",
      });
    }

    return NextResponse.json({
      success: true,
      verified: receipt.verified,
      receipt: receipt,
    });
  } catch (error) {
    console.error("Error verifying cash receipt:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}

// PUT endpoint for updating receipt verification status
export async function PUT(request) {
  try {
    const { receiptNumber, verified, verifiedBy } = await request.json();

    if (!receiptNumber) {
      return NextResponse.json(
        {
          success: false,
          error: "Receipt number is required",
        },
        { status: 400 }
      );
    }

    const receiptIndex = cashReceipts.findIndex(
      (r) => r.receiptNumber === receiptNumber
    );

    if (receiptIndex === -1) {
      return NextResponse.json({
        success: false,
        error: "Receipt not found",
      });
    }

    cashReceipts[receiptIndex] = {
      ...cashReceipts[receiptIndex],
      verified: verified,
      verifiedBy: verifiedBy,
      verifiedAt: new Date().toISOString(),
    };

    await saveCashReceipts();

    return NextResponse.json({
      success: true,
      receipt: cashReceipts[receiptIndex],
      message: "Receipt verification status updated",
    });
  } catch (error) {
    console.error("Error updating receipt:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}
