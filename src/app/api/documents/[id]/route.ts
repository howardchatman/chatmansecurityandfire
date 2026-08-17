import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { verifyAuth } from "@/lib/auth";

// Delete an uploaded document: admin and manager always; anyone else only
// what they themselves uploaded. A tech deleting their own mistaken upload is
// routine; a tech deleting someone else's signed form is not.

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await verifyAuth(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const { data: doc, error: findError } = await supabaseAdmin
    .from("uploaded_documents")
    .select("id, file_path, uploaded_by, file_name")
    .eq("id", id)
    .single();

  if (findError || !doc) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  const mayDelete = ["admin", "manager"].includes(user.role) || doc.uploaded_by === user.id;
  if (!mayDelete) {
    return NextResponse.json(
      { error: "Only the person who uploaded a document (or an admin) can delete it" },
      { status: 403 }
    );
  }

  // Row first, then the object — if the object removal fails the file is
  // orphaned but invisible, which is recoverable; the reverse (row without
  // file) leaves a listing that 404s.
  const { error: delError } = await supabaseAdmin.from("uploaded_documents").delete().eq("id", id);
  if (delError) {
    return NextResponse.json({ error: delError.message }, { status: 500 });
  }
  await supabaseAdmin.storage.from("tech-documents").remove([doc.file_path]);

  return NextResponse.json({ success: true });
}
