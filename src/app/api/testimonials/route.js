import { NextResponse } from "next/server";
import { writeFile, readFile, unlink } from "fs/promises";
import { join } from "path";

// Mock database - in production, this would be a real database
let testimonials = [];

// Helper function to handle image uploads
async function handleImageUpload(image) {
  if (!image || image.size === 0) return null;

  const bytes = await image.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Generate unique filename
  const timestamp = Date.now();
  const sanitizedName = image.name.replace(/[^a-zA-Z0-9.-]/g, "_");
  const fileName = `${timestamp}-${sanitizedName}`;
  const imagePath = `/uploads/testimonials/${fileName}`;

  // Save the image file to local storage
  try {
    await writeFile(join(process.cwd(), "public", imagePath), buffer);
    console.log(`Testimonial image saved: ${imagePath}`);
    return imagePath;
  } catch (error) {
    console.error("Error saving testimonial image:", error);
    throw new Error("Failed to save image");
  }
}

// Helper function to save testimonials to a file
async function saveTestimonials() {
  try {
    const filePath = join(process.cwd(), "testimonials.json");
    await writeFile(filePath, JSON.stringify(testimonials, null, 2));
  } catch (error) {
    console.error("Error saving testimonials:", error);
  }
}

// Helper function to load testimonials from a file
async function loadTestimonials() {
  try {
    const filePath = join(process.cwd(), "testimonials.json");
    const data = await readFile(filePath, "utf8");
    testimonials = JSON.parse(data);
  } catch (error) {
    console.error("Error loading testimonials:", error);
  }
}

// Load testimonials on startup
loadTestimonials();

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const type = searchParams.get("type");
    const featured = searchParams.get("featured");
    const active = searchParams.get("active");

    // Handle soft delete recovery
    if (type === "recover" && id) {
      const testimonial = testimonials.find(
        (t) => t.id === parseInt(id) && t.deleted_at
      );
      if (testimonial) {
        delete testimonial.deleted_at;
        await saveTestimonials();
        return NextResponse.json({
          success: true,
          message: "Testimonial recovered successfully",
          testimonial,
        });
      }
      return NextResponse.json(
        {
          success: false,
          error: "Testimonial not found or not deleted",
        },
        { status: 404 }
      );
    }

    // Handle permanent delete
    if (type === "permanent" && id) {
      const index = testimonials.findIndex((t) => t.id === parseInt(id));
      if (index !== -1) {
        testimonials.splice(index, 1);
        await saveTestimonials();
        return NextResponse.json({
          success: true,
          message: "Testimonial permanently deleted",
        });
      }
      return NextResponse.json(
        {
          success: false,
          error: "Testimonial not found",
        },
        { status: 404 }
      );
    }

    // Handle soft delete
    if (type === "delete" && id) {
      const testimonial = testimonials.find((t) => t.id === parseInt(id));
      if (testimonial) {
        testimonial.deleted_at = new Date().toISOString();
        await saveTestimonials();
        return NextResponse.json({
          success: true,
          message: "Testimonial moved to trash",
        });
      }
      return NextResponse.json(
        {
          success: false,
          error: "Testimonial not found",
        },
        { status: 404 }
      );
    }

    // Get single testimonial by ID
    if (id) {
      const testimonial = testimonials.find(
        (t) => t.id === parseInt(id) && !t.deleted_at
      );
      if (testimonial) {
        return NextResponse.json({
          success: true,
          testimonial,
        });
      }
      return NextResponse.json(
        {
          success: false,
          error: "Testimonial not found",
        },
        { status: 404 }
      );
    }

    // Filter testimonials
    let filteredTestimonials = testimonials.filter((t) => !t.deleted_at);

    if (featured === "true") {
      filteredTestimonials = filteredTestimonials.filter((t) => t.is_featured);
    }

    if (active === "true") {
      filteredTestimonials = filteredTestimonials.filter((t) => t.is_active);
    }

    // Sort by creation date (newest first)
    filteredTestimonials.sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at)
    );

    return NextResponse.json({
      success: true,
      testimonials: filteredTestimonials,
    });
  } catch (error) {
    console.error("Error in GET /api/testimonials:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    let testimonialData;

    // Check if the request is FormData or JSON
    const contentType = request.headers.get("content-type");

    if (contentType && contentType.includes("multipart/form-data")) {
      // Handle FormData (for image uploads)
      const formData = await request.formData();
      testimonialData = {
        name: formData.get("name"),
        position: formData.get("position"),
        congregation: formData.get("congregation"),
        content: formData.get("content"),
        rating: parseInt(formData.get("rating")) || 5,
        is_featured: formData.get("is_featured") === "true",
        is_active: formData.get("is_active") !== "false",
        image: formData.get("image"),
      };
    } else {
      // Handle JSON
      testimonialData = await request.json();
    }

    // Validate required fields
    if (!testimonialData.name || !testimonialData.content) {
      return NextResponse.json(
        {
          success: false,
          error: "Name and content are required",
        },
        { status: 400 }
      );
    }

    // Handle image upload if provided
    let imagePath = null;
    if (testimonialData.image && testimonialData.image.size > 0) {
      try {
        imagePath = await handleImageUpload(testimonialData.image);
      } catch (error) {
        return NextResponse.json(
          { success: false, error: "Failed to save image" },
          { status: 500 }
        );
      }
    }

    // Generate new ID
    const newId = Math.max(...testimonials.map((t) => t.id), 0) + 1;

    const newTestimonial = {
      id: newId,
      name: testimonialData.name,
      position: testimonialData.position || "",
      congregation: testimonialData.congregation || "",
      content: testimonialData.content,
      image: imagePath,
      rating: testimonialData.rating || 5,
      is_featured: testimonialData.is_featured || false,
      is_active:
        testimonialData.is_active !== undefined
          ? testimonialData.is_active
          : true,
      created_at: new Date().toISOString(),
    };

    testimonials.push(newTestimonial);
    await saveTestimonials();

    return NextResponse.json(
      {
        success: true,
        message: "Testimonial created successfully",
        testimonial: newTestimonial,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error in POST /api/testimonials:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    let updateData;
    let testimonialId;

    // Check if the request is FormData or JSON
    const contentType = request.headers.get("content-type");

    if (contentType && contentType.includes("multipart/form-data")) {
      // Handle FormData (for image uploads)
      const formData = await request.formData();
      testimonialId = parseInt(formData.get("id"));
      updateData = {
        name: formData.get("name"),
        position: formData.get("position"),
        congregation: formData.get("congregation"),
        content: formData.get("content"),
        rating: parseInt(formData.get("rating")) || 5,
        is_featured: formData.get("is_featured") === "true",
        is_active: formData.get("is_active") !== "false",
        image: formData.get("image"),
      };
    } else {
      // Handle JSON
      const body = await request.json();
      testimonialId = body.id;
      updateData = body;
    }

    if (!testimonialId) {
      return NextResponse.json(
        {
          success: false,
          error: "Testimonial ID is required",
        },
        { status: 400 }
      );
    }

    const index = testimonials.findIndex((t) => t.id === testimonialId);
    if (index === -1) {
      return NextResponse.json(
        {
          success: false,
          error: "Testimonial not found",
        },
        { status: 404 }
      );
    }

    // Handle image upload if a new image is provided
    let imagePath = testimonials[index].image;
    if (updateData.image && updateData.image.size > 0) {
      try {
        imagePath = await handleImageUpload(updateData.image);

        // Keep old images for testimonials - admin can manually delete if needed
        console.log(`New testimonial image saved: ${imagePath}`);
        console.log(`Old testimonial image kept: ${testimonials[index].image}`);
      } catch (error) {
        return NextResponse.json(
          { success: false, error: "Failed to save new image" },
          { status: 500 }
        );
      }
    }

    // Update testimonial
    testimonials[index] = {
      ...testimonials[index],
      name: updateData.name || testimonials[index].name,
      position:
        updateData.position !== undefined
          ? updateData.position
          : testimonials[index].position,
      congregation:
        updateData.congregation !== undefined
          ? updateData.congregation
          : testimonials[index].congregation,
      content: updateData.content || testimonials[index].content,
      image: imagePath,
      rating: updateData.rating || testimonials[index].rating,
      is_featured:
        updateData.is_featured !== undefined
          ? updateData.is_featured
          : testimonials[index].is_featured,
      is_active:
        updateData.is_active !== undefined
          ? updateData.is_active
          : testimonials[index].is_active,
    };

    await saveTestimonials();

    return NextResponse.json({
      success: true,
      message: "Testimonial updated successfully",
      testimonial: testimonials[index],
    });
  } catch (error) {
    console.error("Error in PUT /api/testimonials:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const type = searchParams.get("type");

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "Testimonial ID is required",
        },
        { status: 400 }
      );
    }

    const testimonial = testimonials.find((t) => t.id === parseInt(id));
    if (!testimonial) {
      return NextResponse.json(
        {
          success: false,
          error: "Testimonial not found",
        },
        { status: 404 }
      );
    }

    if (type === "permanent") {
      // Permanent delete
      const index = testimonials.findIndex((t) => t.id === parseInt(id));
      testimonials.splice(index, 1);
      await saveTestimonials();

      return NextResponse.json({
        success: true,
        message: "Testimonial permanently deleted",
      });
    } else {
      // Soft delete
      testimonial.deleted_at = new Date().toISOString();
      await saveTestimonials();

      return NextResponse.json({
        success: true,
        message: "Testimonial moved to trash",
      });
    }
  } catch (error) {
    console.error("Error in DELETE /api/testimonials:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}
