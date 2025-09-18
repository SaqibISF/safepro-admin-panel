import { MiddlewareConfig, NextRequest, NextResponse } from "next/server";
import { ACCESS_TOKEN_COOKIE_KEY } from "./lib/constants";

export const middleware = async (req: NextRequest) => {
  const { pathname } = req.nextUrl;

  const accessToken = req.cookies.get(ACCESS_TOKEN_COOKIE_KEY);

  if (pathname === "/login" && accessToken) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (pathname !== "/login" && !accessToken) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next({
    headers: { ...req.headers, "x-pathname": pathname },
  });
};

export const config: MiddlewareConfig = {
  matcher: [
    /*
     * Match all routes except:
     * - static files (/_next/, /favicon.ico, etc.)
     * - public APIs (/api/public)
     */
    "/((?!_next/static|_next/image|favicon.ico|api|logo.svg).*)",
  ],
};
