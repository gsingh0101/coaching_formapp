import { UserModel } from '@/lib/models/users';
import { connectDB } from "@/lib/db/connect"
import { NextRequest, NextResponse } from 'next/server';

// the url <websitename>/api/users/<id> will trigger this code
// the url <websitename>/api/users?id=userid will trigger this code

// teacher has the users list and can click on a user to see details. when they click on a user, it will trigger the GET function below with the user id in the url. the GET function will fetch the user details from the database and return it as json. the teacher can then see the user details on the frontend.
// http://localhost:3000/api/users/12345
// http://localhost:3000/api/users/4567


export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
//export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { id } = await params;
    console.log("Getting user with id:", id);

    // check the users's permissions here. if the user is not a teacher, return an error. if the user is a teacher, return the user details.
    // if the user is student and the id matches the user id in the database, return the user details. if not, return an error.

    const user = await UserModel.findById(id)
    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: user })
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
