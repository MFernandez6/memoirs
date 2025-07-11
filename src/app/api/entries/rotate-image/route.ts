import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Entry ID is required" },
        { status: 400 }
      );
    }

    // Get the current entry
    const { data: currentEntry, error: fetchError } = await supabase
      .from("entries")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !currentEntry) {
      return NextResponse.json({ error: "Entry not found" }, { status: 404 });
    }

    // Get current rotation (default to 0 if not set)
    const currentRotation = currentEntry.image_rotation || 0;
    const newRotation = (currentRotation + 90) % 360;

    // Update the entry with new rotation
    const { data: updatedEntry, error: updateError } = await supabase
      .from("entries")
      .update({ image_rotation: newRotation })
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating entry rotation:", updateError);
      return NextResponse.json(
        { error: "Failed to rotate image", details: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json(updatedEntry);
  } catch (error) {
    console.error("Error rotating image:", error);
    return NextResponse.json(
      { error: "Failed to rotate image" },
      { status: 500 }
    );
  }
}
