import ytdl from "@distube/ytdl-core";
import { NextResponse } from "next/server";

function sanitizeFilename(filename: string): string {
  return filename.replace(/[^a-z0-9]/gi, "_").toLowerCase();
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "URL is required" }, { status: 400 });
  }

  try {
    const info = await ytdl.getInfo(url);
    const format = ytdl.chooseFormat(info.formats, {
      quality: "highest",
      filter: "audioandvideo",
    });

    if (!format) {
      return NextResponse.json(
        { error: "No suitable format found" },
        { status: 400 }
      );
    }

    const stream = ytdl(url, {
      format: format,
      quality: "highest",
      filter: "audioandvideo",
    });

    // 파일 이름 생성 및 인코딩
    const sanitizedFilename = sanitizeFilename(info.videoDetails.title);
    const encodedFilename = encodeURIComponent(sanitizedFilename);

    // 스트리밍 응답 설정
    const response = new NextResponse(stream as any);

    response.headers.set("Content-Type", "video/mp4");
    response.headers.set(
      "Content-Disposition",
      `attachment; filename="${encodedFilename}.mp4"; filename*=UTF-8''${encodedFilename}.mp4`
    );

    // 비디오 정보 로깅
    console.log("Video Title:", info.videoDetails.title);
    console.log("Author:", info.videoDetails.author.name);
    console.log("Video Length:", info.videoDetails.lengthSeconds, "seconds");

    return response;
  } catch (error) {
    console.error("Download error:", error);
    return NextResponse.json(
      { error: "Failed to download video" },
      { status: 500 }
    );
  }
}
