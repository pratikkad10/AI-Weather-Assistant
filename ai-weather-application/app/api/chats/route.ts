import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("sessionId");

  if (!sessionId) {
    return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });
  }

  try {
    const email = `anon_${sessionId}@local.app`;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return NextResponse.json({ chats: [] });

    const chats = await prisma.chat.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    return NextResponse.json({ chats });
  } catch (error) {
    console.error("Failed to fetch chats:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
