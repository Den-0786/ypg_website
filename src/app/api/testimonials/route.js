import { NextResponse } from "next/server";
import { writeFile, readFile, unlink } from "fs/promises";
import { join } from "path";

// Mock database - in production, this would be a real database
let testimonials = [
  {
    id: 1,
    name: "Sarah Johnson",
    position: "Youth Leader",
    congregation: "Ahinsan Presbyterian Church",
    content:
      "The YPG has transformed my spiritual journey. The community and support here are incredible.",
    image: "/testimonials/sarah.jpg",
    rating: 5,
    is_featured: true,
    is_active: true,
    created_at: "2024-01-15T10:30:00Z",
  },
  {
    id: 2,
    name: "Michael Osei",
    position: "Student",
    congregation: "Kumasi Central Presbyterian",
    content:
      "Being part of YPG has helped me grow in faith and leadership. The events are always inspiring.",
    image: "/testimonials/michael.jpg",
    rating: 5,
    is_featured: true,
    is_active: true,
    created_at: "2024-02-20T14:15:00Z",
  },
  {
    id: 3,
    name: "Grace Addo",
    position: "Teacher",
    congregation: "Adum Presbyterian Church",
    content:
      "The ministry programs are well-organized and impactful. I've seen many lives changed.",
    image: "/testimonials/grace.jpg",
    rating: 4,
    is_featured: false,
    is_active: true,
    created_at: "2024-03-10T09:45:00Z",
  },
  {
    id: 4,
    name: "David Mensah",
    position: "Engineer",
    congregation: "Santasi Presbyterian Church",
    content:
      "The outreach programs have given me a new perspective on serving others. Highly recommended!",
    image: "/testimonials/david.jpg",
    rating: 5,
    is_featured: true,
    is_active: true,
    created_at: "2024-04-05T16:20:00Z",
  },
  {
    id: 5,
    name: "Abena Ofori",
    position: "Nurse",
    congregation: "Bantama Presbyterian Church",
    content:
      "The prayer meetings and Bible study sessions have strengthened my faith tremendously.",
    image: "/testimonials/abena.jpg",
    rating: 4,
    is_featured: false,
    is_active: true,
    created_at: "2024-05-12T11:30:00Z",
  },
];

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
    const body = await request.json();

    // Validate required fields
    if (!body.name || !body.content) {
      return NextResponse.json(
        {
          success: false,
          error: "Name and content are required",
        },
        { status: 400 }
      );
    }

    // Generate new ID
    const newId = Math.max(...testimonials.map((t) => t.id), 0) + 1;

    const newTestimonial = {
      id: newId,
      name: body.name,
      position: body.position || "",
      congregation: body.congregation || "",
      content: body.content,
      image: body.image || "",
      rating: body.rating || 5,
      is_featured: body.is_featured || false,
      is_active: body.is_active !== undefined ? body.is_active : true,
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
    const body = await request.json();

    if (!body.id) {
      return NextResponse.json(
        {
          success: false,
          error: "Testimonial ID is required",
        },
        { status: 400 }
      );
    }

    const index = testimonials.findIndex((t) => t.id === parseInt(body.id));
    if (index === -1) {
      return NextResponse.json(
        {
          success: false,
          error: "Testimonial not found",
        },
        { status: 404 }
      );
    }

    // Update testimonial
    testimonials[index] = {
      ...testimonials[index],
      name: body.name || testimonials[index].name,
      position:
        body.position !== undefined
          ? body.position
          : testimonials[index].position,
      congregation:
        body.congregation !== undefined
          ? body.congregation
          : testimonials[index].congregation,
      content: body.content || testimonials[index].content,
      image: body.image !== undefined ? body.image : testimonials[index].image,
      rating: body.rating || testimonials[index].rating,
      is_featured:
        body.is_featured !== undefined
          ? body.is_featured
          : testimonials[index].is_featured,
      is_active:
        body.is_active !== undefined
          ? body.is_active
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

