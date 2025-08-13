import { NextResponse } from "next/server";
import pool from "@/lib/database.js";

// GET - Fetch user profile
export async function GET() {
  try {
    const result = await pool.query(
      "SELECT setting_key, setting_value, setting_type FROM settings WHERE setting_key LIKE 'profile_%'"
    );

    // Convert database rows to profile object
    const profile = {};
    result.rows.forEach((row) => {
      const key = row.setting_key.replace("profile_", "");
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

      profile[key] = value;
    });

    // Set defaults if no profile exists
    const defaultProfile = {
      fullName: "Admin User",
      email: "admin@ypg.com",
      phone: "+233 20 123 4567",
      role: "System Administrator",
      avatar: null,
    };

    const mergedProfile = { ...defaultProfile, ...profile };

    return NextResponse.json({
      success: true,
      profile: mergedProfile,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

// PUT - Update user profile
export async function PUT(request) {
  try {
    const contentType = request.headers.get("content-type");
    let updateData;

    if (contentType && contentType.includes("multipart/form-data")) {
      // Handle FormData (for avatar uploads)
      const formData = await request.formData();
      updateData = {
        fullName: formData.get("fullName"),
        email: formData.get("email"),
        phone: formData.get("phone"),
        role: formData.get("role"),
        avatar: formData.get("avatar"),
      };
    } else {
      // Handle JSON
      updateData = await request.json();
    }

    // Validation
    const errors = {};

    if (!updateData.fullName?.trim()) {
      errors.fullName = "Full name is required";
    }

    if (!updateData.email?.trim()) {
      errors.email = "Email is required";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(updateData.email)) {
        errors.email = "Please enter a valid email address";
      }
    }

    if (!updateData.phone?.trim()) {
      errors.phone = "Phone number is required";
    } else {
      const phoneRegex = /^(\+233|0)[0-9]{9}$/;
      if (!phoneRegex.test(updateData.phone)) {
        errors.phone = "Please enter a valid Ghanaian phone number";
      }
    }

    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ success: false, errors }, { status: 400 });
    }

    // Handle avatar data (could be base64 string or file)
    let avatarData = null;
    if (updateData.avatar) {
      if (
        typeof updateData.avatar === "string" &&
        updateData.avatar.startsWith("data:image/")
      ) {
        // Base64 image data
        avatarData = updateData.avatar;
      } else if (updateData.avatar.size > 0) {
        // File upload - in production, you would save to cloud storage
        avatarData = `/uploads/avatars/${Date.now()}-${updateData.avatar.name}`;
      }
    }

    // Prepare profile data to update
    const profileData = {
      fullName: updateData.fullName,
      email: updateData.email,
      phone: updateData.phone,
      role: updateData.role || "System Administrator",
      avatar: avatarData,
    };

    // Update profile in database
    for (const [key, value] of Object.entries(profileData)) {
      if (value !== undefined) {
        let settingType = "string";
        let settingValue = value;

        // Handle avatar as JSON if it's base64 data
        if (
          key === "avatar" &&
          typeof value === "string" &&
          value.startsWith("data:image/")
        ) {
          settingType = "json";
          settingValue = JSON.stringify(value);
        }

        await pool.query(
          `
          INSERT INTO settings (setting_key, setting_value, setting_type) 
          VALUES ($1, $2, $3)
          ON CONFLICT (setting_key) 
          DO UPDATE SET setting_value = $2, setting_type = $3, updated_at = CURRENT_TIMESTAMP
        `,
          [`profile_${key}`, settingValue, settingType]
        );
      }
    }

    return NextResponse.json({
      success: true,
      profile: profileData,
      message: "Profile updated successfully",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
