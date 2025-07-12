import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

interface Entry {
  id: string;
  title: string;
  content: string;
  image_url?: string;
  image_url_2?: string;
  timestamp: number;
  image_rotation?: number;
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    console.log("Fetching entries from Supabase...");
    console.log("Supabase URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log(
      "Service Role Key exists:",
      !!process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { data, error } = await supabase
      .from("entries")
      .select("*")
      .order("timestamp", { ascending: false });

    console.log("Supabase response:", { data, error });

    if (error) {
      console.error("Error fetching entries:", error);
      return NextResponse.json(
        { error: "Failed to fetch entries", details: error.message },
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
    const { title, content, image_url, image_url_2 } = body;

    console.log("Saving entry:", { title, content, image_url, image_url_2 });

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
      image_url: image_url || null,
      image_url_2: image_url_2 || null,
      timestamp: Date.now(),
    };

    console.log("New entry object:", newEntry);

    const { data, error } = await supabase
      .from("entries")
      .insert([newEntry])
      .select()
      .single();

    console.log("Supabase insert response:", { data, error });

    if (error) {
      console.error("Error saving entry:", error);
      return NextResponse.json(
        { error: "Failed to save entry", details: error.message },
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

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, title, content, image_url, image_url_2 } = body;

    console.log("Updating entry:", {
      id,
      title,
      content,
      image_url,
      image_url_2,
    });

    if (!id || !title || !content) {
      return NextResponse.json(
        { error: "ID, title and content are required" },
        { status: 400 }
      );
    }

    const updateData = {
      title: title.trim(),
      content: content.trim(),
      image_url: image_url || null,
      image_url_2: image_url_2 || null,
    };

    console.log("Update data:", updateData);

    const { data, error } = await supabase
      .from("entries")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    console.log("Supabase update response:", { data, error });

    if (error) {
      console.error("Error updating entry:", error);
      return NextResponse.json(
        { error: "Failed to update entry", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error updating entry:", error);
    return NextResponse.json(
      { error: "Failed to update entry" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    console.log("Deleting entry with ID:", id);

    if (!id) {
      return NextResponse.json(
        { error: "Entry ID is required" },
        { status: 400 }
      );
    }

    const { error } = await supabase.from("entries").delete().eq("id", id);

    console.log("Supabase delete response:", { error });

    if (error) {
      console.error("Error deleting entry:", error);
      return NextResponse.json(
        { error: "Failed to delete entry", details: error.message },
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
