import React, { useState, useEffect, useRef } from 'react';
import AgoraRTC from "agora-rtc-sdk-ng";
import axios from 'axios';
import { fetchToken } from './api/axios';

const APP_ID = "your_agora_app_id";

const LiveStream =()=>{
    const [channelName, SetChannelName]= useState("");
    const [joined, setJoined] = useState(false);
    const [token, setToken] = useState("");
    const client = useRef(AgoraRTC.createClient({ mode: "live", codec: "vp8" }));
    const localTracks = useRef([]);

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

    const joinChannel  =async ()=>{
        await FetchToken();
        client.current.setClientRole("host");

        await client.current.join(APP_ID, channelName, token, null);

        const localTrack = await AgoraRTC.createMicrophoneAndCameraTracks();
        localTracks.current = localTrack;

        localTrack[1].play("local-player");
        await client.current.publish(localTrack);

        setJoined(true);
    }

    return (
        <div>
            <input
                type="text"
                placeholder="Enter Channel Name"
                value={channelName}
                onChange={(e) => setChannelName(e.target.value)}
            />
            <button onClick={joinChannel} disabled={joined}>Join</button>
            <div id="local-player" style={{ width: "400px", height: "300px", background: "#000" }}></div>
        </div>
    );
}