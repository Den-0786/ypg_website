import { NextResponse } from "next/server";
import pool from "@/lib/database.js";

// GET - Fetch analytics data
export async function GET(request) {
  try {
    // First check if table exists
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'analytics'
      );
    `);

    if (!tableCheck.rows[0].exists) {
      // Create table if it doesn't exist
      await pool.query(`
        CREATE TABLE IF NOT EXISTS analytics (
          id SERIAL PRIMARY KEY,
          event_type VARCHAR(50) NOT NULL,
          page VARCHAR(255),
          user_agent TEXT,
          ip_address VARCHAR(45),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Create indexes
      await pool.query(
        "CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON analytics(event_type);"
      );
      await pool.query(
        "CREATE INDEX IF NOT EXISTS idx_analytics_date ON analytics(created_at);"
      );
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "all";

    let data = {};

    // Get basic analytics data
    const basicStats = await pool.query(
      `
      SELECT 
        COUNT(*) as total_events,
        COUNT(CASE WHEN event_type = 'page_view' THEN 1 END) as page_views,
        COUNT(CASE WHEN event_type = 'donation' THEN 1 END) as donations,
        COUNT(CASE WHEN event_type = 'contact' THEN 1 END) as contacts
      FROM analytics
      WHERE created_at >= CASE 
        WHEN $1 = 'today' THEN CURRENT_DATE
        WHEN $1 = 'week' THEN CURRENT_DATE - INTERVAL '7 days'
        WHEN $1 = 'month' THEN CURRENT_DATE - INTERVAL '30 days'
        ELSE '1970-01-01'
      END
    `,
      [period]
    );

    // Get top pages
    const topPages = await pool.query(
      `
      SELECT page, COUNT(*) as views
      FROM analytics 
      WHERE event_type = 'page_view'
      AND created_at >= CASE 
        WHEN $1 = 'today' THEN CURRENT_DATE
        WHEN $1 = 'week' THEN CURRENT_DATE - INTERVAL '7 days'
        WHEN $1 = 'month' THEN CURRENT_DATE - INTERVAL '30 days'
        ELSE '1970-01-01'
      END
      GROUP BY page 
      ORDER BY views DESC 
      LIMIT 10
    `,
      [period]
    );

    // Get user agents (browser/device stats)
    const userAgents = await pool.query(
      `
      SELECT 
        CASE 
          WHEN user_agent LIKE '%Chrome%' THEN 'Chrome'
          WHEN user_agent LIKE '%Firefox%' THEN 'Firefox'
          WHEN user_agent LIKE '%Safari%' THEN 'Safari'
          WHEN user_agent LIKE '%Edge%' THEN 'Edge'
          ELSE 'Other'
        END as browser,
        COUNT(*) as count
      FROM analytics 
      WHERE created_at >= CASE 
        WHEN $1 = 'today' THEN CURRENT_DATE
        WHEN $1 = 'week' THEN CURRENT_DATE - INTERVAL '7 days'
        WHEN $1 = 'month' THEN CURRENT_DATE - INTERVAL '30 days'
        ELSE '1970-01-01'
      END
      GROUP BY browser
      ORDER BY count DESC
    `,
      [period]
    );

    data = {
      period,
      stats: basicStats.rows[0] || {
        total_events: 0,
        page_views: 0,
        donations: 0,
        contacts: 0,
      },
      topPages: topPages.rows,
      browsers: userAgents.rows,
    };

    return NextResponse.json({
      success: true,
      analytics: data,
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json(
      { success: false, error: `Failed to fetch analytics: ${error.message}` },
      { status: 500 }
    );
  }
}

// POST - Track analytics event
export async function POST(request) {
  try {
    // First check if table exists
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'analytics'
      );
    `);

    if (!tableCheck.rows[0].exists) {
      // Create table if it doesn't exist
      await pool.query(`
        CREATE TABLE IF NOT EXISTS analytics (
          id SERIAL PRIMARY KEY,
          event_type VARCHAR(50) NOT NULL,
          page VARCHAR(255),
          user_agent TEXT,
          ip_address VARCHAR(45),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Create indexes
      await pool.query(
        "CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON analytics(event_type);"
      );
      await pool.query(
        "CREATE INDEX IF NOT EXISTS idx_analytics_date ON analytics(created_at);"
      );
    }

    const body = await request.json();

    const { event_type, page, user_agent, ip_address } = body;

    const trackingEvent = {
      event_type: event_type || "page_view",
      page: page || "/",
      user_agent: user_agent || "",
      ip_address: ip_address || "",
      timestamp: new Date().toISOString(),
    };

    // Insert tracking event into database
    const insertQuery = `
      INSERT INTO analytics (
        event_type, page, user_agent, ip_address
      ) VALUES ($1, $2, $3, $4)
      RETURNING *
    `;

    const insertParams = [
      trackingEvent.event_type,
      trackingEvent.page,
      trackingEvent.user_agent,
      trackingEvent.ip_address,
    ];

    await pool.query(insertQuery, insertParams);

    return NextResponse.json({
      success: true,
      message: "Event tracked successfully",
    });
  } catch (error) {
    console.error("Error tracking analytics event:", error);
    return NextResponse.json(
      { success: false, error: `Failed to track event: ${error.message}` },
      { status: 500 }
    );
  }
}
