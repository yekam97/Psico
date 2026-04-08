import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
    function middleware(req) {
        const token = req.nextauth.token;
        const isAuth = !!token;
        const { pathname } = req.nextUrl;

        // Redirect if not authenticated and trying to access dashboard
        if (!isAuth && pathname.startsWith("/dashboard")) {
            return NextResponse.redirect(new URL("/login", req.url));
        }

        const role = token?.role as string;

        // Role-based protection
        if (pathname.startsWith("/dashboard/admin") && role !== "ADMIN") {
            return NextResponse.redirect(new URL("/dashboard", req.url));
        }

        if (pathname.startsWith("/dashboard/psychologist") && role !== "PSYCHOLOGIST") {
            return NextResponse.redirect(new URL("/dashboard", req.url));
        }

        if (pathname.startsWith("/dashboard/patient") && role !== "PATIENT") {
            return NextResponse.redirect(new URL("/dashboard", req.url));
        }

        // Default redirect for /dashboard to specific role dashboard
        if (pathname === "/dashboard") {
            if (role === "ADMIN") return NextResponse.redirect(new URL("/dashboard/admin", req.url));
            if (role === "PSYCHOLOGIST") return NextResponse.redirect(new URL("/dashboard/psychologist", req.url));
            if (role === "PATIENT") return NextResponse.redirect(new URL("/dashboard/patient", req.url));
        }

        return NextResponse.next();
    },
    {
        callbacks: {
            authorized: ({ token }) => !!token,
        },
    }
);

export const config = {
    matcher: ["/dashboard/:path*"],
};
