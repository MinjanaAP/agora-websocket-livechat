import axios from "axios";

const BASE_URL = "http://localhost:8000";

export const API = axios.create({
    baseURL: BASE_URL,
    timeout: 30000,
    headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
    },
});

export const fetchToken = async (body)=>{
    try {
        const response = await API.post("/generate-token",body);
        return response.data;
    } catch (error) {
        console.error("Failed to generate Agora Token", error);
    }
}

export const startBroadCast = async(channelName)=>{
    try {
        const response = await API.post('/create-broadcast',{
            channelName : channelName
        });
        return response.data;
    } catch (error) {
        console.error("Failed to create broadcast", error);
    }
}