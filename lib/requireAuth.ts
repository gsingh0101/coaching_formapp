import { cookies } from "next/headers";
import { verifyToken } from "./auth";

export async function requireAuth() {

    //const cookieStore = cookies(); // ❌ now returns Promise
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
        throw new Error("Unauthorized");
    }

    const decoded = verifyToken(token);
    return decoded;
}