import api from "../api/axios";

export const registerUser = async(data) => {
    const response = await api.post("/auth/signup", data);

    return response.data;
};

export const loginUser = async(data) => {
    const response = await api.post("/auth/login", data);
    
    return response.data;
};

export const getProfile = async () => {
    const response = await api.get("/auth/profile");
    return response.data;
};

export const updateProfile = async (data) => {
    const response = await api.put("/auth/profile", data);
    return response.data;
};

export const getUserPlans = async () => {
    const response = await api.get("/ai/plans");
    return response.data;
};

export const generatePlan = async () => {
    const response = await api.post("/ai/plans");
    return response.data;
};

export const regeneratePlan = async (planId) => {
    const response = await api.post(`/ai/plans/${planId}/regeneration`);
    return response.data;
};

export const getPlanById = async (planId) => {
    const response = await api.get(`/ai/plans/${planId}`);
    return response.data;
};

export const deletePlan = async (planId) => {
    const response = await api.delete(`/ai/plans/${planId}`);
    return response.data;
};

export const activatePlan = async (planId) => {
    const response = await api.patch(`/ai/plans/${planId}/activate`);
    return response.data;
};