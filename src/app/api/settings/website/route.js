import { NextResponse } from "next/server";

// Mock website settings data (in production, this would come from a database)
let websiteSettings = {
  id: 1,
  // General Settings
  websiteTitle: "PCG Ahinsan District YPG",
  contactEmail: "youth@presbyterian.org",
  phoneNumber: "+233 20 123 4567",
  address: "Ahinsan District, Kumasi, Ghana",
  description: "Presbyterian Church of Ghana Youth Ministry - Ahinsan District",

  // Social Media Links
  socialMedia: {
    facebook: "https://facebook.com/presbyterianyouth",
    instagram: "https://instagram.com/presbyterianyouth",
    twitter: "https://twitter.com/presbyterianyouth",
    youtube: "https://youtube.com/presbyterianyouth",
    linkedin: "https://linkedin.com/company/presbyterianyouth",
  },

  // Appearance Settings
  appearance: {
    theme: "light",
    language: "English",
    primaryColor: "#3B82F6",
    borderRadius: "medium",
  },

  // Privacy Settings
  privacy: {
    showMemberCount: true,
    allowPublicRegistration: true,
    requireApprovalForPosts: false,
    enableComments: true,
    showLastSeen: false,
  },

  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
};

// GET - Fetch website settings
export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      settings: websiteSettings,
    });
  } catch (error) {
    console.error("Error fetching website settings:", error);
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

    // Update settings
    const updates = {
      updatedAt: new Date().toISOString(),
    };

    // Update general settings
    if (websiteTitle !== undefined) updates.websiteTitle = websiteTitle;
    if (contactEmail !== undefined) updates.contactEmail = contactEmail;
    if (phoneNumber !== undefined) updates.phoneNumber = phoneNumber;
    if (address !== undefined) updates.address = address;
    if (description !== undefined) updates.description = description;

    // Update social media
    if (socialMedia) {
      updates.socialMedia = { ...websiteSettings.socialMedia, ...socialMedia };
    }

    // Update appearance
    if (appearance) {
      updates.appearance = { ...websiteSettings.appearance, ...appearance };
    }

    // Update privacy
    if (privacy) {
      updates.privacy = { ...websiteSettings.privacy, ...privacy };
    }

    // Apply updates
    websiteSettings = { ...websiteSettings, ...updates };

    return NextResponse.json({
      success: true,
      settings: websiteSettings,
      message: "Website settings updated successfully",
    });
  } catch (error) {
    console.error("Error updating website settings:", error);
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

    const updates = {
      updatedAt: new Date().toISOString(),
    };

    switch (section) {
      case "general":
        if (data.websiteTitle) updates.websiteTitle = data.websiteTitle;
        if (data.contactEmail) updates.contactEmail = data.contactEmail;
        if (data.phoneNumber) updates.phoneNumber = data.phoneNumber;
        if (data.address) updates.address = data.address;
        if (data.description) updates.description = data.description;
        break;

      case "socialMedia":
        updates.socialMedia = { ...websiteSettings.socialMedia, ...data };
        break;

      case "appearance":
        updates.appearance = { ...websiteSettings.appearance, ...data };
        break;

      case "privacy":
        updates.privacy = { ...websiteSettings.privacy, ...data };
        break;

      default:
        return NextResponse.json(
          { success: false, error: "Invalid section" },
          { status: 400 }
        );
    }

    // Apply updates
    websiteSettings = { ...websiteSettings, ...updates };

    return NextResponse.json({
      success: true,
      settings: websiteSettings,
      message: `${section} settings updated successfully`,
    });
  } catch (error) {
    console.error("Error updating website settings:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update website settings" },
      { status: 500 }
    );
  }
}
