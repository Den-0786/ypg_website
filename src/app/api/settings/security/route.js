import { NextResponse } from "next/server";
import bcrypt from "bcryptjs"; // You'll need to install this: npm install bcryptjs

// Mock user security data (in production, this would come from a database)
let userSecurity = {
  id: 1,
  hashedPassword: "$2a$10$example.hashed.password.here", // This would be properly hashed
  hashedPin: null, // PIN is optional
  twoFactorAuth: false,
  requirePinForActions: false, // Made PIN optional
  lastPasswordChange: "2024-01-01T00:00:00.000Z",
  lastPinChange: null,
  updatedAt: "2024-01-01T00:00:00.000Z",
};

// GET - Fetch security settings (without sensitive data)
export async function GET() {
  try {
    const securityInfo = {
      twoFactorAuth: userSecurity.twoFactorAuth,
      requirePinForActions: userSecurity.requirePinForActions,
      hasPin: !!userSecurity.hashedPin,
      lastPasswordChange: userSecurity.lastPasswordChange,
      lastPinChange: userSecurity.lastPinChange,
    };

    return NextResponse.json({
      success: true,
      security: securityInfo,
    });
  } catch (error) {
    console.error("Error fetching security settings:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch security settings" },
      { status: 500 }
    );
  }
}

// PUT - Update security settings
export async function PUT(request) {
  try {
    const updateData = await request.json();
    const {
      currentPassword,
      newPassword,
      confirmPassword,
      currentPin,
      newPin,
      confirmPin,
      twoFactorAuth,
      requirePinForActions,
      securityMethod = "password", // Default to password
    } = updateData;

    const errors = {};

    // Password validation
    if (securityMethod === "password" && newPassword) {
      // Verify current password (in production, compare with hashed password)
      if (!currentPassword) {
        errors.currentPassword = "Current password is required";
      }

      // Validate new password
      if (newPassword.length < 8) {
        errors.newPassword = "Password must be at least 8 characters long";
      }

      if (newPassword !== confirmPassword) {
        errors.confirmPassword = "Passwords do not match";
      }

      // In production, you would verify the current password:
      // const isValidPassword = await bcrypt.compare(currentPassword, userSecurity.hashedPassword);
      // if (!isValidPassword) {
      //   errors.currentPassword = "Current password is incorrect";
      // }
    }

    // PIN validation (optional)
    if (securityMethod === "pin" && newPin) {
      const pinRegex = /^\d{4,6}$/;

      if (!pinRegex.test(newPin)) {
        errors.newPin = "PIN must be 4-6 digits";
      }

      if (newPin !== confirmPin) {
        errors.confirmPin = "PINs do not match";
      }

      // Verify current PIN if user has one
      if (userSecurity.hashedPin && !currentPin) {
        errors.currentPin = "Current PIN is required";
      }
    }

    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ success: false, errors }, { status: 400 });
    }

    // Update security settings
    const updates = {
      updatedAt: new Date().toISOString(),
    };

    // Update password if provided
    if (newPassword) {
      // In production, hash the password:
      // updates.hashedPassword = await bcrypt.hash(newPassword, 10);
      updates.hashedPassword = `hashed_${newPassword}`; // Mock for demo
      updates.lastPasswordChange = new Date().toISOString();
    }

    // Update PIN if provided (PIN is optional)
    if (newPin) {
      // In production, hash the PIN:
      // updates.hashedPin = await bcrypt.hash(newPin, 10);
      updates.hashedPin = `hashed_${newPin}`; // Mock for demo
      updates.lastPinChange = new Date().toISOString();
    }

    // Update boolean settings
    if (typeof twoFactorAuth === "boolean") {
      updates.twoFactorAuth = twoFactorAuth;
    }

    if (typeof requirePinForActions === "boolean") {
      updates.requirePinForActions = requirePinForActions;
    }

    // Apply updates
    userSecurity = { ...userSecurity, ...updates };

    // Return success response (without sensitive data)
    const responseData = {
      twoFactorAuth: userSecurity.twoFactorAuth,
      requirePinForActions: userSecurity.requirePinForActions,
      hasPin: !!userSecurity.hashedPin,
      lastPasswordChange: userSecurity.lastPasswordChange,
      lastPinChange: userSecurity.lastPinChange,
    };

    return NextResponse.json({
      success: true,
      security: responseData,
      message: "Security settings updated successfully",
    });
  } catch (error) {
    console.error("Error updating security settings:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update security settings" },
      { status: 500 }
    );
  }
}

// POST - Verify current credentials (for sensitive operations)
export async function POST(request) {
  try {
    const { password, pin, action } = await request.json();

    const errors = {};

    if (action === "verify-password" && password) {
      // In production, verify against hashed password:
      // const isValid = await bcrypt.compare(password, userSecurity.hashedPassword);
      const isValid = password === "admin123"; // Mock verification

      if (!isValid) {
        errors.password = "Incorrect password";
      }
    }

    if (action === "verify-pin" && pin) {
      // In production, verify against hashed PIN:
      // const isValid = await bcrypt.compare(pin, userSecurity.hashedPin);
      const isValid = userSecurity.hashedPin && pin === "1234"; // Mock verification

      if (!isValid) {
        errors.pin = "Incorrect PIN";
      }
    }

    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ success: false, errors }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: "Credentials verified successfully",
    });
  } catch (error) {
    console.error("Error verifying credentials:", error);
    return NextResponse.json(
      { success: false, error: "Failed to verify credentials" },
      { status: 500 }
    );
  }
}


