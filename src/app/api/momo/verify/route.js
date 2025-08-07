import { NextResponse } from "next/server";

// Mock MoMo API verification - in production, this would integrate with actual MoMo API
export async function POST(request) {
  try {
    const { transactionId, amount, phoneNumber } = await request.json();

    // Validate required fields
    if (!transactionId || !amount || !phoneNumber) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: transactionId, amount, phoneNumber",
        },
        { status: 400 }
      );
    }

    // Mock verification logic
    // In production, this would make a real API call to MoMo
    const mockVerification = {
      transactionId: transactionId,
      status: "success", // success, failed, pending
      amount: amount,
      phoneNumber: phoneNumber,
      timestamp: new Date().toISOString(),
      reference: `REF_${transactionId}`,
      verified: true, // Mock verification result
    };

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Mock verification result (80% success rate for demo)
    const isVerified = Math.random() > 0.2;

    if (isVerified) {
      return NextResponse.json({
        success: true,
        verified: true,
        transaction: mockVerification,
        message: "Payment verified successfully",
      });
    } else {
      return NextResponse.json({
        success: false,
        verified: false,
        error: "Payment verification failed",
        message: "Transaction not found or amount mismatch",
      });
    }
  } catch (error) {
    console.error("Error in MoMo verification:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error during verification",
      },
      { status: 500 }
    );
  }
}

// GET endpoint for checking verification status
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const transactionId = searchParams.get("transactionId");

    if (!transactionId) {
      return NextResponse.json(
        {
          success: false,
          error: "Transaction ID is required",
        },
        { status: 400 }
      );
    }

    // Mock status check
    const mockStatus = {
      transactionId: transactionId,
      status: "completed", // pending, completed, failed
      verified: true,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      status: mockStatus,
    });
  } catch (error) {
    console.error("Error checking MoMo status:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}

