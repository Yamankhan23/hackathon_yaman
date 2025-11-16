"use client";

import { useState } from "react";
import axios from "axios";
import AuthCard from "../../components/AuthCard";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Login() {
    const [data, setData] = useState({ email: "", password: "" });
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await axios.post("http://localhost:5000/auth/login", data, {
            withCredentials: true,
        });
        router.push("/dashboard");
    };

    return (
        <AuthCard title="Welcome Back">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <input
                    className="border rounded-lg px-4 py-2 w-full"
                    placeholder="Email"
                    onChange={(e) => setData({ ...data, email: e.target.value })}
                />
                <input
                    type="password"
                    className="border rounded-lg px-4 py-2 w-full"
                    placeholder="Password"
                    onChange={(e) => setData({ ...data, password: e.target.value })}
                />

                <button className="bg-black text-white py-2 rounded-lg hover:bg-gray-900 transition-all">
                    Login
                </button>
            </form>

            <p className="text-center text-sm mt-4">
                Don’t have an account?{" "}
                <Link href="/auth/signup" className="text-blue-600 font-medium">
                    Create one
                </Link>
            </p>
        </AuthCard>
    );
}
