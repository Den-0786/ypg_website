import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { transactionId, amount, phoneNumber } = await request.json();

    if (!transactionId || !amount || !phoneNumber) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: transactionId, amount, phoneNumber",
        },
        { status: 400 }
      );
    }

    const mockVerification = {
      transactionId: transactionId,
      status: "success",
      amount: amount,
      phoneNumber: phoneNumber,
      timestamp: new Date().toISOString(),
      reference: `REF_${transactionId}`,
      verified: true,
    };

    await new Promise((resolve) => setTimeout(resolve, 1000));

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
    // Error in MoMo verification
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

    // Status check
    const mockStatus = {
      transactionId: transactionId,
      status: "completed",
      verified: true,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      status: mockStatus,
    });
  } catch (error) {
    // Error checking MoMo status
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}
