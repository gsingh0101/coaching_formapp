import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "erweretet123kjretrdfff74543";

export function proxy(req: NextRequest) {

    const token = req.cookies.get("token")?.value;

    // Allow public routes
    const publicPaths = [
        "/login",
        "/api/login"
    ];

    if (publicPaths.includes(req.nextUrl.pathname)) {
        return NextResponse.next();
    }

    // Protect dashboard + root + anything you want
    if (!token) {
        return NextResponse.redirect(new URL("/login", req.url));
    }

    try {
        jwt.verify(token, JWT_SECRET);
        return NextResponse.next();
    } catch {
        return NextResponse.redirect(new URL("/login", req.url));
    }
}

export const config = {
    matcher: [
        "/",                    // homepage
        "/users/:path*",        // your pages
        "/api/users/:path*",    // protect user API
    ],
};
