import { kv } from "@vercel/kv";
import { NextRequest, NextResponse } from "next/server";

interface Entry {
  id: string;
  title: string;
  content: string;
  timestamp: number;
}

export async function GET() {
  try {
    const entries = await kv.get<Entry[]>("memoir-entries");
    return NextResponse.json(entries || []);
  } catch (error) {
    console.error("Error fetching entries:", error);
    return NextResponse.json(
      { error: "Failed to fetch entries" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, content } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: "Title and content are required" },
        { status: 400 }
      );
    }

    const newEntry: Entry = {
      id: Date.now().toString(),
      title: title.trim(),
      content: content.trim(),
      timestamp: Date.now(),
    };

    // Get existing entries
    const existingEntries = (await kv.get<Entry[]>("memoir-entries")) || [];

    // Add new entry to the beginning
    const updatedEntries = [newEntry, ...existingEntries];

    // Save back to database
    await kv.set("memoir-entries", updatedEntries);

    return NextResponse.json(newEntry);
  } catch (error) {
    console.error("Error saving entry:", error);
    return NextResponse.json(
      { error: "Failed to save entry" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Entry ID is required" },
        { status: 400 }
      );
    }

    // Get existing entries
    const existingEntries = (await kv.get<Entry[]>("memoir-entries")) || [];

    // Remove the entry with the specified ID
    const updatedEntries = existingEntries.filter(
      (entry: Entry) => entry.id !== id
    );

    // Save back to database
    await kv.set("memoir-entries", updatedEntries);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting entry:", error);
    return NextResponse.json(
      { error: "Failed to delete entry" },
      { status: 500 }
    );
  }
}
