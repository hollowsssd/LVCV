import axios from "axios";

export const getProfile = async (token: string) => {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") || "http://localhost:8080";
    try {
        const res = await axios.get(`${API_BASE_URL}/api/users/profile`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        if (res.status !== 200) {
            return false;
        }
        return res.data;
    } catch (error) {
        console.log('error featching  ', error);
        return null;
    }


};