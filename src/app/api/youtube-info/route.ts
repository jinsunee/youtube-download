import ytdl from "@distube/ytdl-core";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "URL is required" }, { status: 400 });
  }

  try {
    const info = await ytdl.getInfo(url);
    return NextResponse.json({
      title: info.videoDetails.title,
      description: info.videoDetails.description,
      thumbnailUrl: info.videoDetails.thumbnails[0].url,
    });
  } catch (error) {
    console.error("Error fetching video info:", error);
    return NextResponse.json(
      { error: "Failed to fetch video info" },
      { status: 500 }
    );
  }
}
