import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import { join } from "path";
import pool from "@/lib/database.js";
import bcrypt from "bcryptjs";

// Check if IP is locked out
async function checkLockout(ip) {
  try {
    const result = await pool.query(
      "SELECT * FROM login_attempts WHERE ip_address = $1 AND is_locked = true AND lockout_until > NOW()",
      [ip]
    );

    if (result.rows.length > 0) {
      const lockout = result.rows[0];
      const remainingTime = Math.ceil(
        (new Date(lockout.lockout_until) - new Date()) / 1000 / 60
      );
      return {
        locked: true,
        remainingMinutes: remainingTime,
        message: `Too many failed attempts. Please try again in ${remainingTime} minutes.`,
      };
    }
    return { locked: false };
  } catch (error) {
    return { locked: false };
  }
}

// Record failed attempt and check if should lockout
async function recordFailedAttempt(ip) {
  try {
    // Create login_attempts table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS login_attempts (
        id SERIAL PRIMARY KEY,
        ip_address VARCHAR(45) NOT NULL,
        attempt_count INTEGER DEFAULT 1,
        last_attempt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        is_locked BOOLEAN DEFAULT FALSE,
        lockout_until TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Get current attempts for this IP
    const currentResult = await pool.query(
      "SELECT * FROM login_attempts WHERE ip_address = $1",
      [ip]
    );

    if (currentResult.rows.length === 0) {
      // First failed attempt
      await pool.query(
        "INSERT INTO login_attempts (ip_address, attempt_count) VALUES ($1, 1)",
        [ip]
      );
      return { shouldLockout: false };
    }

    const attempt = currentResult.rows[0];
    const newAttemptCount = attempt.attempt_count + 1;
    const now = new Date();

    // Determine lockout duration based on attempt count
    let lockoutDuration = 0;
    if (newAttemptCount === 3) {
      lockoutDuration = 5; // 5 minutes
    } else if (newAttemptCount === 5) {
      lockoutDuration = 10; // 10 minutes
    } else if (newAttemptCount >= 9) {
      lockoutDuration = 1440; // 24 hours
    }

    if (lockoutDuration > 0) {
      const lockoutUntil = new Date(
        now.getTime() + lockoutDuration * 60 * 1000
      );
      await pool.query(
        "UPDATE login_attempts SET attempt_count = $1, last_attempt = NOW(), is_locked = true, lockout_until = $2 WHERE ip_address = $3",
        [newAttemptCount, lockoutUntil, ip]
      );
      return {
        shouldLockout: true,
        message: `Too many failed attempts. Please try again in ${lockoutDuration} minutes.`,
      };
    } else {
      await pool.query(
        "UPDATE login_attempts SET attempt_count = $1, last_attempt = NOW() WHERE ip_address = $2",
        [newAttemptCount, ip]
      );
      return { shouldLockout: false };
    }
  } catch (error) {
    return { shouldLockout: false };
  }
}

// Reset attempts on successful login
async function resetAttempts(ip) {
  try {
    await pool.query("DELETE FROM login_attempts WHERE ip_address = $1", [ip]);
  } catch (error) {
    // Ignore errors
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    // Get client IP
    const forwarded = request.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0] : "unknown";

    // Check if IP is locked out
    const lockoutCheck = await checkLockout(ip);
    if (lockoutCheck.locked) {
      return NextResponse.json(
        { success: false, error: lockoutCheck.message },
        { status: 429 }
      );
    }

    // Validate input
    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: "Username and password are required" },
        { status: 400 }
      );
    }

    // Get credentials from database
    const result = await pool.query(
      "SELECT username, password FROM admin_credentials WHERE id = 1"
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: "Admin credentials not configured" },
        { status: 500 }
      );
    }

    const adminCredentials = result.rows[0];

    // Check username
    if (username !== adminCredentials.username) {
      const lockoutResult = await recordFailedAttempt(ip);
      if (lockoutResult.shouldLockout) {
        return NextResponse.json(
          { success: false, error: lockoutResult.message },
          { status: 429 }
        );
      }
      return NextResponse.json(
        { success: false, error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(
      password,
      adminCredentials.password
    );
    if (!isPasswordValid) {
      const lockoutResult = await recordFailedAttempt(ip);
      if (lockoutResult.shouldLockout) {
        return NextResponse.json(
          { success: false, error: lockoutResult.message },
          { status: 429 }
        );
      }
      return NextResponse.json(
        { success: false, error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Successful login - reset attempts
    await resetAttempts(ip);

    return NextResponse.json({
      success: true,
      user: {
        username: username,
        loginTime: new Date().toISOString(),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
