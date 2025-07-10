import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

interface Entry {
  id: string;
  title: string;
  content: string;
  timestamp: number;
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("entries")
      .select("*")
      .order("timestamp", { ascending: false });

    if (error) {
      console.error("Error fetching entries:", error);
      return NextResponse.json(
        { error: "Failed to fetch entries" },
        { status: 500 }
      );
    }

    return NextResponse.json(data || []);
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

    const { data, error } = await supabase
      .from("entries")
      .insert([newEntry])
      .select()
      .single();

    if (error) {
      console.error("Error saving entry:", error);
      return NextResponse.json(
        { error: "Failed to save entry" },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
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

    const { error } = await supabase.from("entries").delete().eq("id", id);

    if (error) {
      console.error("Error deleting entry:", error);
      return NextResponse.json(
        { error: "Failed to delete entry" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting entry:", error);
    return NextResponse.json(
      { error: "Failed to delete entry" },
      { status: 500 }
    );
  }
}
