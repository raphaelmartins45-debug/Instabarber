import { NextResponse } from "next/server";

// Fase 0: deixa passar tudo. A resolução do inquilino pelo host (L.4) e a proteção das camadas são da Fase 2.
export function middleware() {
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|marca/).*)"],
};
