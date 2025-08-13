import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import { join } from "path";
import pool from "@/lib/database.js";

// GET - Fetch store items
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const featured = searchParams.get("featured");
    const status = searchParams.get("status") || "active";
    const forWebsite = searchParams.get("forWebsite") === "true";

    let query = `
      SELECT * FROM ystore_items 
      WHERE status = $1
    `;
    let params = [status];
    let paramIndex = 2;

    if (category) {
      query += ` AND LOWER(category) = LOWER($${paramIndex})`;
      params.push(category);
      paramIndex++;
    }

    if (featured === "true") {
      query += ` AND featured = true`;
    }

    query += ` ORDER BY created_at DESC`;

    const result = await pool.query(query, params);
    let filteredItems = result.rows;

    // For website, return only necessary fields
    if (forWebsite) {
      filteredItems = filteredItems.map((item) => ({
        id: item.id,
        name: item.name,
        description: item.description,
        price: parseFloat(item.price),
        originalPrice: parseFloat(item.original_price || item.price),
        category: item.category,
        image: item.image,
        rating: parseFloat(item.rating),
        reviews: item.reviews,
        featured: item.featured,
        pricingUnit: item.pricing_unit || "",
        contact: item.contact || "+233244123456",
        stock: item.stock > 0 ? "In Stock" : "Out of Stock",
      }));
    }

    return NextResponse.json({
      success: true,
      items: filteredItems,
      total: filteredItems.length,
    });
  } catch (error) {
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
        pricingUnit: formData.get("pricingUnit") || "",
        contact: formData.get("contact") || "+233244123456",
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
        return NextResponse.json(
          { success: false, error: "Failed to save image" },
          { status: 500 }
        );
      }
    }

    // Insert into database
    const insertQuery = `
      INSERT INTO ystore_items (
        name, description, price, original_price, category, image, 
        sizes, colors, stock, rating, reviews, featured, status, 
        tags, pricing_unit, contact
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      RETURNING *
    `;

    const insertParams = [
      itemData.name,
      itemData.description,
      itemData.price,
      itemData.originalPrice || itemData.price,
      itemData.category,
      imagePath,
      JSON.stringify(itemData.sizes || ["One Size"]),
      JSON.stringify(itemData.colors || ["Default"]),
      itemData.stock,
      itemData.rating || 4.5,
      itemData.reviews || 0,
      itemData.featured || false,
      "active",
      JSON.stringify(itemData.tags || []),
      itemData.pricingUnit || "",
      itemData.contact || "+233244123456",
    ];

    const result = await pool.query(insertQuery, insertParams);
    const newItem = result.rows[0];

    return NextResponse.json({
      success: true,
      item: newItem,
      message: "Store item created successfully",
    });
  } catch (error) {
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
        pricingUnit: formData.get("pricingUnit") || "",
        contact: formData.get("contact") || "+233244123456",
        image: formData.get("image"),
      };
    } else {
      updateData = await request.json();
    }

    // Check if item exists
    const checkResult = await pool.query(
      "SELECT * FROM ystore_items WHERE id = $1",
      [id]
    );

    if (checkResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: "Store item not found" },
        { status: 404 }
      );
    }

    const existingItem = checkResult.rows[0];

    // Handle image upload if a new image is provided
    let imagePath = existingItem.image;
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
        return NextResponse.json(
          { success: false, error: "Failed to save new image" },
          { status: 500 }
        );
      }
    }

    // Update in database
    const updateQuery = `
      UPDATE ystore_items SET
        name = $1,
        description = $2,
        price = $3,
        original_price = $4,
        category = $5,
        image = $6,
        sizes = $7,
        colors = $8,
        stock = $9,
        featured = $10,
        tags = $11,
        pricing_unit = $12,
        contact = $13,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $14
      RETURNING *
    `;

    const updateParams = [
      updateData.name,
      updateData.description,
      updateData.price,
      updateData.originalPrice || updateData.price,
      updateData.category,
      imagePath,
      JSON.stringify(updateData.sizes || ["One Size"]),
      JSON.stringify(updateData.colors || ["Default"]),
      updateData.stock,
      updateData.featured || false,
      JSON.stringify(updateData.tags || []),
      updateData.pricingUnit || "",
      updateData.contact || "+233244123456",
      id,
    ];

    const result = await pool.query(updateQuery, updateParams);
    const updatedItem = result.rows[0];

    return NextResponse.json({
      success: true,
      item: updatedItem,
      message: "Store item updated successfully",
    });
  } catch (error) {
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

    if (deleteType === "hard") {
      // Permanently delete the item
      const result = await pool.query(
        "DELETE FROM ystore_items WHERE id = $1 RETURNING id",
        [id]
      );

      if (result.rows.length === 0) {
        return NextResponse.json(
          { success: false, error: "Store item not found" },
          { status: 404 }
        );
      }
    } else {
      // Soft delete - mark as deleted
      const result = await pool.query(
        "UPDATE ystore_items SET status = 'deleted', updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING id",
        [id]
      );

      if (result.rows.length === 0) {
        return NextResponse.json(
          { success: false, error: "Store item not found" },
          { status: 404 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: `Store item ${deleteType === "hard" ? "permanently deleted" : "marked as deleted"}`,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to delete store item" },
      { status: 500 }
    );
  }
}
