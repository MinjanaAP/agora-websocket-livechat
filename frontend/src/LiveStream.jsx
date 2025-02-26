import React, { useState, useEffect, useRef } from 'react';
import AgoraRTC from "agora-rtc-sdk-ng";
import axios from 'axios';
import { fetchToken } from './api/axios';

const APP_ID = "824d82b21f9e4d778c8920670cc6827d";

const LiveStream =()=>{
    const [channelName, setChannelName]= useState("");
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
            // alert(JSON.stringify(response,null,2));
            if(response && response.status){
                return response.token;
            }else{
                console.error("Error in response data");
            }
        } catch (error) {
            console.error("Failed to get Agora token.", error);
        }
    }

    const joinChannel  =async ()=>{
        const newToken = await FetchToken();

        if(!newToken){
            console.error("Token retrieval failed.");
            return;
        }

        setToken(newToken);
        client.current.setClientRole("host");

        await client.current.join(APP_ID, channelName, newToken, null);

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
};

export default LiveStream;