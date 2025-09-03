import api from "../utils/api"; // Import the centralized Axios instance

export const vendorRegister = async (userData, dispatch, navigate) => {
    try {
        console.log('vendorRegister',userData);
        const response = await api.post("/vendor/register", userData, {
        headers: {
            "Content-Type": "multipart/form-data", // Required for file uploads
        },
        });
        return response.data;
    } catch (error) {
        console.error("Registration Error:", error.response?.data || error.message);
        throw new Error("Registration failed, "+error.response?.data.message || "Registration failed, "+error.message);
    }
};

export const vendorRequest = async (role) => {
    try {
        const response = await api.get(`/vendor/get-request?role=${encodeURIComponent(role)}`);
        return response.data; // Returns userId and role if valid
    } catch (error) {
        localStorage.removeItem("token");
        return false;
    }
};

export const vendorApprove = async (vendorId) => {
    try {
        const response = await api.put(`/vendor/approve/${vendorId}`);
        return response.data; // Returns userId and role if valid
    } catch (error) {
        localStorage.removeItem("token");
        return false;
    }
};

export const vendoDecline = async (declineData) => {
    try {
        const response = await api.put(`/vendor/decline/${declineData.user_id}`, {
            reason: declineData.decline_reason
        });
        return response.data;
    } catch (error) {
        console.error('Decline error:', error);
        localStorage.removeItem("token");
        return false;
    }
};
