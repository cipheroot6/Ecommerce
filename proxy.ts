import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// define which routes need a logged-in user
const isProtectedRoute = createRouteMatcher([
  "/companions(.+)", // /companions is public but  /companions/* is protected
  "/my-journey(.*)",
  "/subscription(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect(); // redirects to /sign-in if not logged in
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
