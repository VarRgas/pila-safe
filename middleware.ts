import type { NextRequest } from "next/server";
import { updateSession } from "@/shared/lib/supabase-middleware";

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: ["/", "/login", "/cadastro", "/lancamentos"],
};
