import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import pool from "@/lib/database.js";

// GET - Fetch security settings (without sensitive data)
export async function GET() {
  try {
    const result = await pool.query(
      "SELECT setting_key, setting_value, setting_type FROM settings WHERE setting_key LIKE 'security_%'"
    );

    // Convert database rows to security object
    const security = {};
    result.rows.forEach((row) => {
      const key = row.setting_key.replace("security_", "");
      let value = row.setting_value;

      // Parse JSON values
      if (row.setting_type === "json") {
        try {
          value = JSON.parse(value);
        } catch (e) {
          value = {};
        }
      } else if (row.setting_type === "boolean") {
        value = value === "true";
      } else if (row.setting_type === "number") {
        value = parseFloat(value);
      }

      security[key] = value;
    });

    // Set defaults if no security settings exist
    const defaultSecurity = {
      twoFactorAuth: false,
      requirePinForActions: false,
      hasPin: false,
      lastPasswordChange: "2024-01-01T00:00:00.000Z",
      lastPinChange: null,
    };

    const mergedSecurity = { ...defaultSecurity, ...security };

    return NextResponse.json({
      success: true,
      security: mergedSecurity,
    });
  } catch (error) {
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
      const currentPinResult = await pool.query(
        "SELECT setting_value FROM settings WHERE setting_key = 'security_hasPin'"
      );
      const hasPin = currentPinResult.rows[0]?.setting_value === "true";

      if (hasPin && !currentPin) {
        errors.currentPin = "Current PIN is required";
      }
    }

    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ success: false, errors }, { status: 400 });
    }

    // Prepare security data to update
    const securityUpdates = [];

    // Update password if provided
    if (newPassword) {
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      securityUpdates.push(["hashedPassword", hashedPassword, "string"]);
      securityUpdates.push([
        "lastPasswordChange",
        new Date().toISOString(),
        "string",
      ]);
    }

    // Update PIN if provided (PIN is optional)
    if (newPin) {
      const hashedPin = await bcrypt.hash(newPin, 10);
      securityUpdates.push(["hashedPin", hashedPin, "string"]);
      securityUpdates.push(["hasPin", "true", "boolean"]);
      securityUpdates.push([
        "lastPinChange",
        new Date().toISOString(),
        "string",
      ]);
    }

    // Update boolean settings
    if (typeof twoFactorAuth === "boolean") {
      securityUpdates.push([
        "twoFactorAuth",
        twoFactorAuth.toString(),
        "boolean",
      ]);
    }

    if (typeof requirePinForActions === "boolean") {
      securityUpdates.push([
        "requirePinForActions",
        requirePinForActions.toString(),
        "boolean",
      ]);
    }

    // Update security settings in database
    for (const [key, value, type] of securityUpdates) {
      await pool.query(
        `
        INSERT INTO settings (setting_key, setting_value, setting_type) 
        VALUES ($1, $2, $3)
        ON CONFLICT (setting_key) 
        DO UPDATE SET setting_value = $2, setting_type = $3, updated_at = CURRENT_TIMESTAMP
      `,
        [`security_${key}`, value, type]
      );
    }

    // Return success response (without sensitive data)
    const responseData = {
      twoFactorAuth: twoFactorAuth !== undefined ? twoFactorAuth : false,
      requirePinForActions:
        requirePinForActions !== undefined ? requirePinForActions : false,
      hasPin: newPin ? true : false,
      lastPasswordChange: newPassword ? new Date().toISOString() : null,
      lastPinChange: newPin ? new Date().toISOString() : null,
    };

    return NextResponse.json({
      success: true,
      security: responseData,
      message: "Security settings updated successfully",
    });
  } catch (error) {
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
      // Get hashed password from database
      const passwordResult = await pool.query(
        "SELECT setting_value FROM settings WHERE setting_key = 'security_hashedPassword'"
      );

      if (passwordResult.rows.length > 0) {
        const hashedPassword = passwordResult.rows[0].setting_value;
        const isValid = await bcrypt.compare(password, hashedPassword);

        if (!isValid) {
          errors.password = "Incorrect password";
        }
      } else {
        // No password configured - require setup
        errors.password =
          "No password configured. Please set up admin credentials first.";
      }
    }

    if (action === "verify-pin" && pin) {
      // Get hashed PIN from database
      const pinResult = await pool.query(
        "SELECT setting_value FROM settings WHERE setting_key = 'security_hashedPin'"
      );

      if (pinResult.rows.length > 0) {
        const hashedPin = pinResult.rows[0].setting_value;
        const isValid = await bcrypt.compare(pin, hashedPin);

        if (!isValid) {
          errors.pin = "Incorrect PIN";
        }
      } else {
        // No PIN configured - require setup
        errors.pin = "No PIN configured. Please set up admin PIN first.";
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
    return NextResponse.json(
      { success: false, error: "Failed to verify credentials" },
      { status: 500 }
    );
  }
}
