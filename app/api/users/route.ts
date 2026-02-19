import { UserModel } from '@/lib/models/users';
import { connectDB } from "@/lib/db/connect"
import { NextRequest, NextResponse } from 'next/server';

// the url <websitename>/api/users/<id> will trigger this code
// the url <websitename>/api/users?id=userid will trigger this code

export async function GET(req: NextRequest) {
  try {
    await connectDB()

    const users = await UserModel.find({})
    return NextResponse.json({ success: true, data: users })
  } catch (error) {
    console.error('Error fetching users:', error);
    return new Response(JSON.stringify({ success: false, message: 'Failed to fetch users' }), { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {

    // connect to database
    await connectDB(); // it will throw in case of error

    const body = await req.json()
    const name = String(body?.name || "Unknown name").trim()
    if (!name) return NextResponse.json({ message: "name is required" }, { status: 400 });

    // WRITE A CODE TO FIND THE EMAIL IN THE DATABASE, IF FOUND THEN RETURN ERROR RESPONSE WITH MESSAGE "Email already exists"
    const existingUser = await UserModel.findOne({ email: body.email });
    if (existingUser) {
      return NextResponse.json({ message: "Email already exists" }, { status: 400 });
    }

    const doc = await UserModel.create({
      name,
      email: body.email,
      dob: body.dob,
      password: body.password,
    });

    return NextResponse.json({ id: String(doc._id), name: doc.name, email: doc.email, dob: doc.dob });

  } catch (err: any) {

    return NextResponse.json({ message: "Server error", error: err?.message || String(err) }, { status: 500 });

  }
}
