// Test script to verify profile data saving and loading
import pool from "@/lib/database.js";

async function testProfile() {
  try {
    console.log("Testing profile data...");
    
    // Test saving profile data
    const testProfile = {
      fullName: "Test Admin",
      email: "test@ypg.com", 
      phone: "+233 20 123 4567",
      role: "Test Administrator",
      avatar: null
    };

    console.log("Saving test profile data...");
    for (const [key, value] of Object.entries(testProfile)) {
      if (value !== undefined) {
        await pool.query(
          `
          INSERT INTO settings (setting_key, setting_value, setting_type) 
          VALUES ($1, $2, $3)
          ON CONFLICT (setting_key) 
          DO UPDATE SET setting_value = $2, setting_type = $3, updated_at = CURRENT_TIMESTAMP
        `,
          [`profile_${key}`, value, "string"]
        );
      }
    }
    console.log("✅ Profile data saved successfully");

    // Test loading profile data
    console.log("Loading profile data...");
    const result = await pool.query(
      "SELECT setting_key, setting_value, setting_type FROM settings WHERE setting_key LIKE 'profile_%'"
    );

    const profile = {};
    result.rows.forEach((row) => {
      const key = row.setting_key.replace("profile_", "");
      let value = row.setting_value;

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

    console.log("✅ Profile data loaded successfully");
    console.log("Profile data:", profile);

    await pool.end();
  } catch (error) {
    console.error("❌ Error:", error);
    await pool.end();
  }
}

testProfile();







