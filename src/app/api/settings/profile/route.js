import { NextResponse } from "next/server";

// Mock user profile data (in production, this would come from a database)
let userProfile = {
  id: 1,
  fullName: "Admin User",
  email: "admin@ypg.com",
  phone: "+233 20 123 4567",
  role: "System Administrator",
  avatar: null,
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
};

// GET - Fetch user profile
export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      profile: userProfile,
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
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

    // Handle avatar upload if provided
    let avatarPath = userProfile.avatar;
    if (updateData.avatar && updateData.avatar.size > 0) {
      // In production, you would save to cloud storage
      avatarPath = `/uploads/avatars/${Date.now()}-${updateData.avatar.name}`;
    }

    // Update profile
    userProfile = {
      ...userProfile,
      fullName: updateData.fullName,
      email: updateData.email,
      phone: updateData.phone,
      role: updateData.role || userProfile.role,
      avatar: avatarPath,
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      profile: userProfile,
      message: "Profile updated successfully",
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update profile" },
      { status: 500 }
    );
  }
}


