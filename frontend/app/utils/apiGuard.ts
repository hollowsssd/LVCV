import axios, { AxiosError } from "axios";

type ApiErrorResponse = {
    message?: string;
    code?: string;
    redirectTo?: string;
};

/**
 * Check if an axios error is a "NO_ROLE" error (user hasn't selected role yet)
 * Returns true if this error should redirect to select-role page
 */
export function isNoRoleError(error: unknown): boolean {
    const err = error as AxiosError<ApiErrorResponse>;
    return err.response?.status === 403 && err.response?.data?.code === "NO_ROLE";
}

/**
 * Handle API error - if it's a NO_ROLE error, redirect to select-role page
 * Returns true if redirected, false otherwise
 */
export function handleNoRoleError(error: unknown, router: { push: (path: string) => void }): boolean {
    if (isNoRoleError(error)) {
        router.push("/auth/select-role");
        return true;
    }
    return false;
}

/**
 * Wrapper for axios that auto-handles NO_ROLE errors
 */
export async function apiCall<T>(
    request: () => Promise<T>,
    router: { push: (path: string) => void }
): Promise<T> {
    try {
        return await request();
    } catch (error) {
        if (handleNoRoleError(error, router)) {
            throw new Error("REDIRECT_TO_SELECT_ROLE");
        }
        throw error;
    }
}
