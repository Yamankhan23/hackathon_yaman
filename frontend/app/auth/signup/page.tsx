"use client";

import { useState } from "react";
import axios from "axios";
import AuthCard from "../../components/AuthCard";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Signup() {
    const [data, setData] = useState({ name: "", email: "", password: "" });
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await axios.post("http://localhost:5000/auth/signup", data, {
            withCredentials: true,
        });
        router.push("/auth/login");
    };

    return (
        <AuthCard title="Create Account">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <input
                    className="border rounded-lg px-4 py-2 w-full"
                    placeholder="Name"
                    onChange={(e) => setData({ ...data, name: e.target.value })}
                />
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
                    Sign Up
                </button>
            </form>

            <p className="text-center text-sm mt-4">
                Already have an account?{" "}
                <Link href="/auth/login" className="text-blue-600 font-medium">
                    Login
                </Link>
            </p>
        </AuthCard>
    );
}
