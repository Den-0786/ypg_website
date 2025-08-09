import { NextResponse } from "next/server";

// Mock Y-Store items data (in production, this would come from a database)
let storeItems = [
  {
    id: 1,
    name: "YPG T-Shirt",
    description: "Official YPG branded cotton t-shirt in various sizes",
    price: 45.0,
    originalPrice: 60.0,
    category: "Clothing",
    image: "/images/ystore/ypg-tshirt.jpg",
    images: [
      "/images/ystore/ypg-tshirt-1.jpg",
      "/images/ystore/ypg-tshirt-2.jpg",
      "/images/ystore/ypg-tshirt-3.jpg",
    ],
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Black", "White", "Navy Blue"],
    stock: 25,
    rating: 4.8,
    reviews: 12,
    featured: true,
    status: "active",
    tags: ["clothing", "apparel", "branded"],
    createdAt: "2024-01-15T10:00:00.000Z",
    updatedAt: "2024-01-15T10:00:00.000Z",
  },
  {
    id: 2,
    name: "YPG Water Bottle",
    description:
      "Stainless steel water bottle with YPG logo, keeps drinks hot/cold",
    price: 25.0,
    originalPrice: 35.0,
    category: "Accessories",
    image: "/images/ystore/ypg-bottle.jpg",
    images: [
      "/images/ystore/ypg-bottle-1.jpg",
      "/images/ystore/ypg-bottle-2.jpg",
    ],
    sizes: ["500ml", "750ml"],
    colors: ["Silver", "Black", "Blue"],
    stock: 40,
    rating: 4.9,
    reviews: 8,
    featured: true,
    status: "active",
    tags: ["accessories", "drinkware", "branded"],
    createdAt: "2024-01-10T14:30:00.000Z",
    updatedAt: "2024-01-10T14:30:00.000Z",
  },
  {
    id: 3,
    name: "YPG Notebook Set",
    description: "Set of 3 premium notebooks with YPG branding for Bible study",
    price: 18.0,
    originalPrice: 25.0,
    category: "Stationery",
    image: "/images/ystore/ypg-notebook.jpg",
    images: [
      "/images/ystore/ypg-notebook-1.jpg",
      "/images/ystore/ypg-notebook-2.jpg",
    ],
    sizes: ["A5", "A4"],
    colors: ["Brown", "Black", "Blue"],
    stock: 30,
    rating: 4.7,
    reviews: 15,
    featured: false,
    status: "active",
    tags: ["stationery", "notebooks", "study"],
    createdAt: "2024-01-08T16:45:00.000Z",
    updatedAt: "2024-01-08T16:45:00.000Z",
  },
  {
    id: 4,
    name: "YPG Cap",
    description: "Adjustable baseball cap with embroidered YPG logo",
    price: 20.0,
    originalPrice: 28.0,
    category: "Clothing",
    image: "/images/ystore/ypg-cap.jpg",
    images: ["/images/ystore/ypg-cap-1.jpg", "/images/ystore/ypg-cap-2.jpg"],
    sizes: ["One Size"],
    colors: ["Black", "Navy", "Red"],
    stock: 20,
    rating: 4.6,
    reviews: 6,
    featured: false,
    status: "active",
    tags: ["clothing", "accessories", "cap"],
    createdAt: "2024-01-05T12:20:00.000Z",
    updatedAt: "2024-01-05T12:20:00.000Z",
  },
  {
    id: 5,
    name: "YPG Devotional Book",
    description: "Daily devotional book written by YPG leadership team",
    price: 15.0,
    originalPrice: 20.0,
    category: "Books",
    image: "/images/ystore/ypg-devotional.jpg",
    images: [
      "/images/ystore/ypg-devotional-1.jpg",
      "/images/ystore/ypg-devotional-2.jpg",
    ],
    sizes: ["Standard"],
    colors: ["Multi-color"],
    stock: 50,
    rating: 5.0,
    reviews: 20,
    featured: true,
    status: "active",
    tags: ["books", "devotional", "spiritual"],
    createdAt: "2024-01-01T08:00:00.000Z",
    updatedAt: "2024-01-01T08:00:00.000Z",
  },
];

// GET - Fetch store items
export async function GET(request) {
  try {
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
    let imagePath = "/images/ystore/default-item.jpg";
    if (itemData.image && itemData.image.size > 0) {
      // In production, you would save to cloud storage
      imagePath = `/uploads/ystore/${Date.now()}-${itemData.image.name}`;
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
      rating: 0,
      reviews: 0,
      featured: itemData.featured || false,
      status: "active",
      tags: itemData.tags || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    storeItems.push(newItem);

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
    const contentType = request.headers.get("content-type");
    let updateData;

    if (contentType && contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      updateData = {
        id: parseInt(formData.get("id")),
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
      updateData = await request.json();
    }

    const { id, ...itemData } = updateData;

    const itemIndex = storeItems.findIndex((item) => item.id === id);
    if (itemIndex === -1) {
      return NextResponse.json(
        { success: false, error: "Store item not found" },
        { status: 404 }
      );
    }

    // Handle image upload if a new image is provided
    let imagePath = storeItems[itemIndex].image;
    if (itemData.image && itemData.image.size > 0) {
      imagePath = `/uploads/ystore/${Date.now()}-${itemData.image.name}`;
    }

    // Update the item
    storeItems[itemIndex] = {
      ...storeItems[itemIndex],
      ...itemData,
      image: imagePath,
      updatedAt: new Date().toISOString(),
    };

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


