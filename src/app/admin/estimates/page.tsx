"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function EstimatesPage() {
  const router = useRouter();
  useEffect(() => { router.replace("/admin/quotes"); }, [router]);
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-600 mx-auto mb-3" />
        <p className="text-gray-500 text-sm">Redirecting to Quotes...</p>
      </div>
    </div>
  );
}
