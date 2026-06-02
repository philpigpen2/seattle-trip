import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher(["/trip(.*)", "/api/(.*)"]);
const isSetupRoute = createRouteMatcher(["/api/disable-google(.*)", "/api/setup(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (isSetupRoute(req)) return NextResponse.next();
  if (isProtectedRoute(req)) {
    await auth.protect({
      unauthenticatedUrl: new URL("/sign-in", req.url).toString(),
    });
  }
  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
