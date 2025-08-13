import { NextResponse } from "next/server";
import pool from "@/lib/database.js";

// GET - Fetch website settings
export async function GET() {
  try {
    const result = await pool.query(
      "SELECT setting_key, setting_value, setting_type FROM settings WHERE setting_key LIKE 'website_%'"
    );

    // Convert database rows to settings object
    const settings = {};
    result.rows.forEach((row) => {
      const key = row.setting_key.replace("website_", "");
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

      settings[key] = value;
    });

    // Set defaults if no settings exist
    const defaultSettings = {
      websiteTitle: "PCG Ahinsan District YPG",
      contactEmail: "youth@presbyterian.org",
      phoneNumber: "+233 20 123 4567",
      address: "Ahinsan District, Kumasi, Ghana",
      description:
        "Presbyterian Church of Ghana Ahinsan District YPG - Ahinsan District",
      socialMedia: {
        facebook: "https://facebook.com/presbyterianyouth",
        instagram: "https://instagram.com/presbyterianyouth",
        twitter: "https://twitter.com/presbyterianyouth",
        youtube: "https://youtube.com/presbyterianyouth",
        linkedin: "https://linkedin.com/company/presbyterianyouth",
      },
      appearance: {
        theme: "light",
        language: "English",
        primaryColor: "#3B82F6",
        borderRadius: "medium",
      },
      privacy: {
        showMemberCount: true,
        allowPublicRegistration: true,
        requireApprovalForPosts: false,
        enableComments: true,
        showLastSeen: false,
      },
    };

    const mergedSettings = { ...defaultSettings, ...settings };

    return NextResponse.json({
      success: true,
      settings: mergedSettings,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch website settings" },
      { status: 500 }
    );
  }
}

// PUT - Update website settings
export async function PUT(request) {
  try {
    const updateData = await request.json();
    const {
      websiteTitle,
      contactEmail,
      phoneNumber,
      address,
      description,
      socialMedia,
      appearance,
      privacy,
    } = updateData;

    const errors = {};

    // Validate general settings
    if (websiteTitle !== undefined) {
      if (!websiteTitle.trim()) {
        errors.websiteTitle = "Website title is required";
      }
    }

    if (contactEmail !== undefined) {
      if (!contactEmail.trim()) {
        errors.contactEmail = "Contact email is required";
      } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(contactEmail)) {
          errors.contactEmail = "Please enter a valid email address";
        }
      }
    }

    if (phoneNumber !== undefined) {
      if (!phoneNumber.trim()) {
        errors.phoneNumber = "Phone number is required";
      } else {
        const phoneRegex = /^(\+233|0)[0-9]{9}$/;
        if (!phoneRegex.test(phoneNumber)) {
          errors.phoneNumber = "Please enter a valid Ghanaian phone number";
        }
      }
    }

    // Validate social media URLs
    if (socialMedia) {
      const urlRegex = /^https?:\/\/.+\..+/;
      Object.entries(socialMedia).forEach(([platform, url]) => {
        if (url && !urlRegex.test(url)) {
          errors[`socialMedia.${platform}`] =
            `Please enter a valid URL for ${platform}`;
        }
      });
    }

    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ success: false, errors }, { status: 400 });
    }

    // Prepare settings to update
    const settingsToUpdate = [];

    if (websiteTitle !== undefined)
      settingsToUpdate.push(["websiteTitle", websiteTitle, "string"]);
    if (contactEmail !== undefined)
      settingsToUpdate.push(["contactEmail", contactEmail, "string"]);
    if (phoneNumber !== undefined)
      settingsToUpdate.push(["phoneNumber", phoneNumber, "string"]);
    if (address !== undefined)
      settingsToUpdate.push(["address", address, "string"]);
    if (description !== undefined)
      settingsToUpdate.push(["description", description, "string"]);
    if (socialMedia !== undefined)
      settingsToUpdate.push([
        "socialMedia",
        JSON.stringify(socialMedia),
        "json",
      ]);
    if (appearance !== undefined)
      settingsToUpdate.push(["appearance", JSON.stringify(appearance), "json"]);
    if (privacy !== undefined)
      settingsToUpdate.push(["privacy", JSON.stringify(privacy), "json"]);

    // Update settings in database
    for (const [key, value, type] of settingsToUpdate) {
      await pool.query(
        `
        INSERT INTO settings (setting_key, setting_value, setting_type) 
        VALUES ($1, $2, $3)
        ON CONFLICT (setting_key) 
        DO UPDATE SET setting_value = $2, setting_type = $3, updated_at = CURRENT_TIMESTAMP
      `,
        [`website_${key}`, value, type]
      );
    }

    return NextResponse.json({
      success: true,
      message: "Website settings updated successfully",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to update website settings" },
      { status: 500 }
    );
  }
}

// PATCH - Update specific setting section
export async function PATCH(request) {
  try {
    const { section, data } = await request.json();

    if (!section || !data) {
      return NextResponse.json(
        { success: false, error: "Section and data are required" },
        { status: 400 }
      );
    }

    let settingKey, settingValue, settingType;

    switch (section) {
      case "general":
        settingKey = "website_general";
        settingValue = JSON.stringify(data);
        settingType = "json";
        break;

      case "socialMedia":
        settingKey = "website_socialMedia";
        settingValue = JSON.stringify(data);
        settingType = "json";
        break;

      case "appearance":
        settingKey = "website_appearance";
        settingValue = JSON.stringify(data);
        settingType = "json";
        break;

      case "privacy":
        settingKey = "website_privacy";
        settingValue = JSON.stringify(data);
        settingType = "json";
        break;

      default:
        return NextResponse.json(
          { success: false, error: "Invalid section" },
          { status: 400 }
        );
    }

    // Update setting in database
    await pool.query(
      `
      INSERT INTO settings (setting_key, setting_value, setting_type) 
      VALUES ($1, $2, $3)
      ON CONFLICT (setting_key) 
      DO UPDATE SET setting_value = $2, setting_type = $3, updated_at = CURRENT_TIMESTAMP
    `,
      [settingKey, settingValue, settingType]
    );

    return NextResponse.json({
      success: true,
      message: `${section} settings updated successfully`,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to update website settings" },
      { status: 500 }
    );
  }
}
