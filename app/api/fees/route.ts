import { UserModel } from '@/lib/models/users';
// import { FeesModel } from '@/lib/models/fees';
import { connectDB } from "@/lib/db/connect"
import { NextRequest, NextResponse } from 'next/server';

// the url <websitename>/api/users will trigger this code

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    // send back the fees details based on the user type. if the user is a teacher, send back all the fees details. 
    // if the user is a student, send back only their fees details.

    const users = await FeesModel.find({})
    return NextResponse.json({ success: true, data: users })
  } catch (error) {
    console.error('Error fetching users:', error);
    return new Response(JSON.stringify({ success: false, message: 'Failed to fetch users' }), { status: 500 });
  }
}

export async function POST(req: NextRequest) {
    try {
        await connectDB()

        const body = await req.json()
        const name = String(body?.name || "").trim()
        if (!name) return NextResponse.json({ message: "name is required" }, { status: 400 })

        const doc = await UserModel.create({
            name,
            email: body.email,
            age: body.age,
            password: body.password,
        })

        return NextResponse.json({ id: String(doc._id), name: doc.name, email: doc.email });

    } catch (err: any) {

        return NextResponse.json({ message: "Server error", error: err?.message || String(err) }, { status: 500 });

    }
}
