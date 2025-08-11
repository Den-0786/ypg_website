import { NextResponse } from "next/server";
import { writeFile, readFile, access } from "fs/promises";
import { join } from "path";

// File path for persistent storage
const DATA_FILE_PATH = join(process.cwd(), "data", "ystore-items.json");

// Y-Store items data (in production, this would come from a database)
let storeItems = [];

// Load data from file
async function loadStoreItems() {
  try {
    await access(DATA_FILE_PATH);
    const data = await readFile(DATA_FILE_PATH, "utf8");
    const parsed = JSON.parse(data);
    if (Array.isArray(parsed)) {
      storeItems = parsed;
    } else {
      console.warn(
        "Invalid data format in ystore-items.json, starting with empty array"
      );
      storeItems = [];
    }
  } catch (error) {
    // File doesn't exist or is invalid, start with empty array
    console.log("No existing ystore data found, starting with empty array");
    storeItems = [];
  }
}

// Save data to file
async function saveStoreItems() {
  try {
    // Ensure data directory exists
    const dataDir = join(process.cwd(), "data");
    try {
      await access(dataDir);
    } catch {
      // Create data directory if it doesn't exist
      const { mkdir } = await import("fs/promises");
      await mkdir(dataDir, { recursive: true });
    }

    await writeFile(DATA_FILE_PATH, JSON.stringify(storeItems, null, 2));
  } catch (error) {
    console.error("Error saving store items:", error);
  }
}

// GET - Fetch store items
export async function GET(request) {
  try {
    // Load data from file
    await loadStoreItems();

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const featured = searchParams.get("featured");
    const status = searchParams.get("status") || "active";
    const forWebsite = searchParams.get("forWebsite") === "true";

    let filteredItems = storeItems.filter((item) => item.status === status);

    if (category) {
      filteredItems = filteredItems.filter(
        (item) => item.category.toLowerCase() === category.toLowerCase()
      );
    }

    if (featured === "true") {
      filteredItems = filteredItems.filter((item) => item.featured);
    }

    // For website, return only necessary fields
    if (forWebsite) {
      filteredItems = filteredItems.map((item) => ({
        id: item.id,
        name: item.name,
        description: item.description,
        price: item.price,
        originalPrice: item.originalPrice,
        category: item.category,
        image: item.image,
        rating: item.rating,
        reviews: item.reviews,
        featured: item.featured,
        pricingUnit: item.pricingUnit || "",
        contact: item.contact || "+233244123456", // Include contact number
        stock: item.stock > 0 ? "In Stock" : "Out of Stock",
      }));
    }

    return NextResponse.json({
      success: true,
      items: filteredItems,
      total: filteredItems.length,
    });
  } catch (error) {
    console.error("Error fetching store items:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch store items" },
      { status: 500 }
    );
  }
}

// POST - Create new store item
export async function POST(request) {
  try {
    const contentType = request.headers.get("content-type");
    let itemData;

    if (contentType && contentType.includes("multipart/form-data")) {
      // Handle FormData (for image uploads)
      const formData = await request.formData();
      itemData = {
        name: formData.get("name"),
        description: formData.get("description"),
        price: parseFloat(formData.get("price")),
        originalPrice: parseFloat(formData.get("originalPrice")),
        category: formData.get("category"),
        sizes: JSON.parse(formData.get("sizes") || "[]"),
        colors: JSON.parse(formData.get("colors") || "[]"),
        stock: parseInt(formData.get("stock")),
        featured: formData.get("featured") === "true",
        tags: JSON.parse(formData.get("tags") || "[]"),
        image: formData.get("image"),
      };
    } else {
      // Handle JSON
      itemData = await request.json();
    }

    // Validation
    const errors = {};
    if (!itemData.name?.trim()) errors.name = "Name is required";
    if (!itemData.description?.trim())
      errors.description = "Description is required";
    if (!itemData.price || itemData.price <= 0)
      errors.price = "Valid price is required";
    if (!itemData.category?.trim()) errors.category = "Category is required";
    if (!itemData.stock || itemData.stock < 0)
      errors.stock = "Valid stock quantity is required";

    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ success: false, errors }, { status: 400 });
    }

    // Handle image upload if provided
    let imagePath = "/placeholder-item.jpg";
    if (itemData.image && itemData.image.size > 0) {
      const bytes = await itemData.image.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Generate unique filename
      const timestamp = Date.now();
      const sanitizedName = itemData.image.name.replace(/[^a-zA-Z0-9.-]/g, "_");
      const fileName = `${timestamp}-${sanitizedName}`;
      imagePath = `/uploads/ystore/${fileName}`;

      // Save the image file to local storage
      try {
        const uploadDir = join(process.cwd(), "public", "uploads", "ystore");
        const filePath = join(uploadDir, fileName);
        await writeFile(filePath, buffer);
      } catch (error) {
        console.error("Error saving YStore image:", error);
        return NextResponse.json(
          { success: false, error: "Failed to save image" },
          { status: 500 }
        );
      }
    }

    const newItem = {
      id: Math.max(...storeItems.map((item) => item.id), 0) + 1,
      name: itemData.name,
      description: itemData.description,
      price: itemData.price,
      originalPrice: itemData.originalPrice || itemData.price,
      category: itemData.category,
      image: imagePath,
      images: [imagePath],
      sizes: itemData.sizes || ["One Size"],
      colors: itemData.colors || ["Default"],
      stock: itemData.stock,
      rating: itemData.rating || 4.5,
      reviews: itemData.reviews || 0,
      featured: itemData.featured || false,
      status: "active",
      tags: itemData.tags || [],
      pricingUnit: itemData.pricingUnit || "",
      contact: itemData.contact || "+233244123456", // Default contact number
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Check for duplicate IDs before adding
    const existingIds = storeItems.map((item) => item.id);
    if (existingIds.includes(newItem.id)) {
      // Generate a new unique ID
      newItem.id = Math.max(...existingIds) + 1;
    }

    storeItems.push(newItem);

    // Save to file
    await saveStoreItems();

    return NextResponse.json({
      success: true,
      item: newItem,
      message: "Store item created successfully",
    });
  } catch (error) {
    console.error("Error creating store item:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create store item" },
      { status: 500 }
    );
  }
}

// PUT - Update store item
export async function PUT(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = parseInt(searchParams.get("id"));

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Item ID is required" },
        { status: 400 }
      );
    }

    const contentType = request.headers.get("content-type");
    let updateData;

    if (contentType && contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      updateData = {
        name: formData.get("name"),
        description: formData.get("description"),
        price: parseFloat(formData.get("price")),
        originalPrice: parseFloat(formData.get("originalPrice")),
        category: formData.get("category"),
        sizes: JSON.parse(formData.get("sizes") || "[]"),
        colors: JSON.parse(formData.get("colors") || "[]"),
        stock: parseInt(formData.get("stock")),
        featured: formData.get("featured") === "true",
        tags: JSON.parse(formData.get("tags") || "[]"),
        contact: formData.get("contact") || "+233244123456",
        image: formData.get("image"),
      };
    } else {
      updateData = await request.json();
    }

    const itemIndex = storeItems.findIndex((item) => item.id === id);
    if (itemIndex === -1) {
      return NextResponse.json(
        { success: false, error: "Store item not found" },
        { status: 404 }
      );
    }

    // Handle image upload if a new image is provided
    let imagePath = storeItems[itemIndex].image;
    if (updateData.image && updateData.image.size > 0) {
      const bytes = await updateData.image.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Generate unique filename
      const timestamp = Date.now();
      const sanitizedName = updateData.image.name.replace(
        /[^a-zA-Z0-9.-]/g,
        "_"
      );
      const fileName = `${timestamp}-${sanitizedName}`;
      imagePath = `/uploads/ystore/${fileName}`;

      // Save the new image file to local storage
      try {
        const uploadDir = join(process.cwd(), "public", "uploads", "ystore");
        const filePath = join(uploadDir, fileName);
        await writeFile(filePath, buffer);
      } catch (error) {
        console.error("Error saving new YStore image:", error);
        return NextResponse.json(
          { success: false, error: "Failed to save new image" },
          { status: 500 }
        );
      }

      // Keep old images for YStore items - admin can manually delete if needed
    }

    // Update the item
    storeItems[itemIndex] = {
      ...storeItems[itemIndex],
      ...updateData,
      image: imagePath,
      updatedAt: new Date().toISOString(),
    };

    // Save to file
    await saveStoreItems();

    return NextResponse.json({
      success: true,
      item: storeItems[itemIndex],
      message: "Store item updated successfully",
    });
  } catch (error) {
    console.error("Error updating store item:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update store item" },
      { status: 500 }
    );
  }
}

// DELETE - Delete store item
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = parseInt(searchParams.get("id"));
    const deleteType = searchParams.get("type") || "soft"; // soft or hard

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Item ID is required" },
        { status: 400 }
      );
    }

    const itemIndex = storeItems.findIndex((item) => item.id === id);
    if (itemIndex === -1) {
      return NextResponse.json(
        { success: false, error: "Store item not found" },
        { status: 404 }
      );
    }

    if (deleteType === "hard") {
      // Permanently delete the item
      storeItems.splice(itemIndex, 1);
    } else {
      // Soft delete - mark as deleted
      storeItems[itemIndex].status = "deleted";
      storeItems[itemIndex].updatedAt = new Date().toISOString();
    }

    // Save to file
    await saveStoreItems();

    return NextResponse.json({
      success: true,
      message: `Store item ${deleteType === "hard" ? "permanently deleted" : "marked as deleted"}`,
    });
  } catch (error) {
    console.error("Error deleting store item:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete store item" },
      { status: 500 }
    );
  }
}
