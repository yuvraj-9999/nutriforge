import api from "../api/axios";

export const registerUser = async (data) => {
    const response = await api.post("/api/v1/auth/signup", data);
    return response.data;
};

export const loginUser = async (data) => {
    const response = await api.post("/api/v1/auth/login", data);
    return response.data;
};

export const getProfile = async () => {
    const response = await api.get("/api/v1/auth/profile");
    return response.data;
};

export const updateProfile = async (data) => {
    const response = await api.put("/api/v1/auth/profile", data);
    return response.data;
};

export const getUserPlans = async () => {
    const response = await api.get("/api/v1/ai/plans");
    return response.data;
};

export const generatePlan = async () => {
    const response = await api.post("/api/v1/ai/plans");
    return response.data;
};

export const regeneratePlan = async (planId) => {
    const response = await api.post(
        `/api/v1/ai/plans/${planId}/regeneration`
    );
    return response.data;
};

export const getPlanById = async (planId) => {
    const response = await api.get(
        `/api/v1/ai/plans/${planId}`
    );
    return response.data;
};

export const deletePlan = async (planId) => {
    const response = await api.delete(
        `/api/v1/ai/plans/${planId}`
    );
    return response.data;
};

export const activatePlan = async (planId) => {
    const response = await api.patch(
        `/api/v1/ai/plans/${planId}/activate`
    );
    return response.data;
};

export const forgotPassword = async (email) => {
    const response = await api.post("/api/v1/auth/forgot-password",{
        email,
    });
    return response.data;
};

export const resetPassword = async (token, password) => {
    const response = await api.post(`/api/v1/auth/reset-password/${token}`, {password});
    return response.data;
};

export const verifyEmail = async (token) => {
    const response = await api.get(`/api/v1/auth/verify-email/${token}`);
    return response.data;
};