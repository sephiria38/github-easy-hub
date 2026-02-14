import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const owner = searchParams.get("owner");
  const repo = searchParams.get("repo");
  const branch = searchParams.get("branch") || "main";
  const token = request.headers.get("Authorization");

  if (!owner || !repo) {
    return NextResponse.json(
      { error: "owner and repo are required" },
      { status: 400 }
    );
  }

  if (!token) {
    return NextResponse.json(
      { error: "Authorization header is required" },
      { status: 401 }
    );
  }

  try {
    const response = await fetch(
      `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/zipball/${encodeURIComponent(branch)}`,
      {
        headers: {
          Authorization: token,
          Accept: "application/vnd.github+json",
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `GitHub API Error: ${response.status} - ${errorText}` },
        { status: response.status }
      );
    }

    const blob = await response.arrayBuffer();
    const sanitizedRepo = repo.replace(/[^a-zA-Z0-9._-]/g, "_");
    const sanitizedBranch = branch.replace(/[^a-zA-Z0-9._-]/g, "_");

    return new NextResponse(blob, {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${sanitizedRepo}-${sanitizedBranch}.zip"`,
      },
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Download failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
