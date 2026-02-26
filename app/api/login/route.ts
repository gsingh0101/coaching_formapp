import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { UserModel } from "@/lib/models/users";
import bcrypt from "bcryptjs";
import { signToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();

    const user = await UserModel.findOne({ email: body.email });
    if (!user) {
      return NextResponse.json({ message: "Invalid credentials - User not found" }, { status: 401 });
    }

    //const isMatch = await bcrypt.compare(body.password, user.password);
    const isMatch = body.password === user.password;
    if (!isMatch) {
      return NextResponse.json({ message: "Invalid credentials - Password incorrect" }, { status: 401 });
    }

    const token = signToken({ userId: user._id });

    const response = NextResponse.json({ success: true });

    // we set token COOKIE HERE
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: false, // true in production (https)
      path: "/",
      maxAge: 15 * 60 * 60 * 24, // how long with the token be valid? here it's 15 days
    });

    return response;

  } catch (error: any) {
    return NextResponse.json({ message: "Login failed", error: error.message }, { status: 500 });
  }
}