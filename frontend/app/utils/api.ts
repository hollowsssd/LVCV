import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") || "http://localhost:8080";

// Create axios instance with base URL
const api = axios.create({
    baseURL: API_BASE,
});

// Response interceptor to handle NO_ROLE errors globally
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Check if this is a NO_ROLE error
        if (
            error.response?.status === 403 &&
            error.response?.data?.code === "NO_ROLE"
        ) {
            // Redirect to select-role page
            if (typeof window !== "undefined") {
                window.location.href = "/auth/select-role";
            }
            return Promise.reject(new Error("REDIRECT_TO_SELECT_ROLE"));
        }
        return Promise.reject(error);
    }
);

export default api;
