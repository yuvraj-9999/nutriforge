import api from "../api/axios";

export const getCoachHistory = async () => {
    const response = await api.get("/api/v2/coach/history");
    return response.data;
};

export const sendMessageToCoach = async (message) => {
    const response = await api.post("api/v2/coach/chat",{
        message
    });

    return response.data;
};