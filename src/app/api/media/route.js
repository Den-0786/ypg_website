import { NextResponse } from 'next/server';

// Mock database - in production, this would be a real database
let media = [
  {
    id: 1,
    title: "Youth Conference Highlights",
    description: "Highlights from our annual youth conference",
    type: "video",
    url: "/videos/conference-highlights.mp4",
    thumbnail: "/images/thumbnails/conference-thumb.jpg",
    category: "events",
    created_at: "2024-01-15T10:00:00Z",
    file_size: "15.2 MB",
    duration: "3:45"
  },
  {
    id: 2,
    title: "Gallery Photo 1",
    description: "Youth group photo from last month",
    type: "image",
    url: "/images/gallery/youth-group-1.jpg",
    thumbnail: "/images/gallery/youth-group-1.jpg",
    category: "gallery",
    created_at: "2024-01-10T14:30:00Z",
    file_size: "2.1 MB",
    dimensions: "1920x1080"
  },
  {
    id: 3,
    title: "Bible Study Session",
    description: "Recording of our weekly bible study",
    type: "video",
    url: "/videos/bible-study-session.mp4",
    thumbnail: "/images/thumbnails/bible-study-thumb.jpg",
    category: "spiritual",
    created_at: "2024-01-08T18:00:00Z",
    file_size: "25.8 MB",
    duration: "45:20"
  }
];

export async function GET() {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const type = searchParams.get('type');
    
    let filteredMedia = media;
    
    if (category) {
      filteredMedia = filteredMedia.filter(item => item.category === category);
    }
    
    if (type) {
      filteredMedia = filteredMedia.filter(item => item.type === type);
    }
    
    return NextResponse.json({
      success: true,
      media: filteredMedia
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch media' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    
    const newMedia = {
      id: media.length + 1,
      ...body,
      created_at: new Date().toISOString()
    };
    
    media.push(newMedia);
    
    return NextResponse.json({
      success: true,
      media: newMedia,
      message: 'Media uploaded successfully'
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to upload media' },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;
    
    const mediaIndex = media.findIndex(item => item.id === id);
    if (mediaIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Media not found' },
        { status: 404 }
      );
    }
    
    media[mediaIndex] = { ...media[mediaIndex], ...updateData };
    
    return NextResponse.json({
      success: true,
      media: media[mediaIndex],
      message: 'Media updated successfully'
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to update media' },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = parseInt(searchParams.get('id'));
    
    const mediaIndex = media.findIndex(item => item.id === id);
    if (mediaIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Media not found' },
        { status: 404 }
      );
    }
    
    media.splice(mediaIndex, 1);
    
    return NextResponse.json({
      success: true,
      message: 'Media deleted successfully'
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to delete media' },
      { status: 500 }
    );
  }
} 