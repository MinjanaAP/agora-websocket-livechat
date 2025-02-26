import React, { useState, useEffect, useRef } from 'react';
import AgoraRTC from "agora-rtc-sdk-ng";
import axios from 'axios';
import { fetchToken } from './api/axios';

const APP_ID = "your_agora_app_id";

const LiveStream =()=>{
    const [channelName, SetChannelName]= useState("");
    const [token, setToken] = useState("");



    const FetchToken = async ()=>{
        const body = {
            channelName : channelName,
            role : "publisher"
        }
        try {
            const response = await fetchToken(body);
            if(response && response.status){
                setToken(response.data.token)
            }else{
                console.error("Error in response data");
            }
        } catch (error) {
            console.error("Failed to get Agora token.", error);
        }
    }
}