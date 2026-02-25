import { UserModel } from '@/lib/models/users';
import { connectDB } from "@/lib/db/connect"
import { NextRequest, NextResponse } from 'next/server';


// ✅ GET (All or Single)
// if id is passed return that user
// if no id is passed return the applicable users
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (id) {
      const user = await UserModel.findById(id);
      if (!user) {
        return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
      }
      return NextResponse.json({ success: true, data: user });
    }

    // return all users
    const users = await UserModel.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: users });

  } catch (error) {
    return NextResponse.json({ success: false, message: "Failed to fetch users" }, { status: 500 });
  }
}


// ✅ POST (Create)
export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();
    const name = String(body?.name || "").trim();

    if (!name) {
      return NextResponse.json({ message: "Name is required" }, { status: 400 });
    }

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

    return NextResponse.json({
      success: true,
      id: String(doc._id),
      name: doc.name,
      email: doc.email,
      dob: doc.dob
    });

  } catch (err: any) {
    return NextResponse.json({ message: "Server error", error: err?.message }, { status: 500 });
  }
}


// ✅ PATCH (Update)
export async function PATCH(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ message: "User ID required" }, { status: 400 });
    }

    const body = await req.json();

    // Check email uniqueness (if email changed)
    if (body.email) {
      const existingUser = await UserModel.findOne({
        email: body.email,
        _id: { $ne: id }
      });

      if (existingUser) {
        return NextResponse.json({ message: "Email already exists" }, { status: 400 });
      }
    }

    const updatedUser = await UserModel.findByIdAndUpdate(
      id,
      {
        name: body.name,
        email: body.email,
        dob: body.dob,
        password: body.password,
      },
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updatedUser });

  } catch (error: any) {

    return NextResponse.json({ message: "Update failed", error: error.message }, { status: 500 });

  }
}


// ✅ DELETE
export async function DELETE(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ message: "User ID required" }, { status: 400 });
    }

    const deletedUser = await UserModel.findByIdAndDelete(id);

    if (!deletedUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "User deleted successfully" });

  } catch (error: any) {
    return NextResponse.json({ message: "Delete failed", error: error.message }, { status: 500 });
  }
}
