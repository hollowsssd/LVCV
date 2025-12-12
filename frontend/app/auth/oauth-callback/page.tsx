"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Cookies from "js-cookie";

export default function OAuthCallbackPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const token = searchParams.get("token");
        const role = searchParams.get("role");
        const email = searchParams.get("email");
        const needsRole = searchParams.get("needsRole");
        const error = searchParams.get("error");

        if (error) {
            router.push(`/auth/login?error=${error}`);
            return;
        }

        if (token && email) {
            const cookieOptions: Cookies.CookieAttributes = {
                expires: 7,
                path: "/",
                sameSite: "lax",
            };

            // Always save token and email
            Cookies.set("token", token, cookieOptions);
            Cookies.set("email", email, cookieOptions);

            // Check if user needs to select role
            if (needsRole === "true") {
                // Redirect to select role page
                router.push("/auth/select-role");
            } else if (role) {
                // User already has role, save and redirect to dashboard
                Cookies.set("role", role, cookieOptions);

                const redirectPath =
                    role === "candidate"
                        ? "/candidate/dashboard"
                        : role === "employer"
                            ? "/employer/dashboard"
                            : "/admin/dashboard";

                router.push(redirectPath);
            } else {
                router.push("/auth/login?error=missing_role");
            }
        } else {
            router.push("/auth/login?error=missing_data");
        }
    }, [router, searchParams]);

    return (
        <div className="min-h-[70vh] flex items-center justify-center">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 dark:border-slate-100 mx-auto"></div>
                <p className="mt-4 text-slate-600 dark:text-slate-400">
                    Đang xử lý đăng nhập...
                </p>
            </div>
        </div>
    );
}
