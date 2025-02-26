import React, { useState, useEffect, useRef } from 'react';
import AgoraRTC from "agora-rtc-sdk-ng";
import axios from 'axios';
import { fetchToken, startBroadCast } from './api/axios';

const APP_ID = "824d82b21f9e4d778c8920670cc6827d";

const LiveStream =()=>{
    const [channelName, setChannelName]= useState("");
    const [isJoined, setIsJoined] = useState(false);
    const [token, setToken] = useState("");
    const [isBroadcaster, setIsBroadcaster] = useState(false);
    const [micOn, setMicOn] = useState(true);
    const [cameraOn, setCameraOn] = useState(true);

    const client = useRef(AgoraRTC.createClient({ mode: "live", codec: "vp8" }));
    const localTracks = useRef([]);

    //? FETCH Agora token
    const FetchToken = async (role)=>{
        const body = {
            channelName : channelName,
            role : role
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

    //? Start Live Broadcast
    const StartBroadcast = async () => {
        try {
            await startBroadCast(channelName);
        } catch (error) {
            console.error("Failed to create Broadcast", error);
        }
        setIsBroadcaster(true);
    };

    //? JOIN Live streams
    const joinChannel  =async ()=>{
        const role = isBroadcaster ? "publisher" : "subscriber";
        const newToken = await FetchToken(role);

        if(!newToken){
            console.error("Token retrieval failed.");
            return;
        }

        setToken(newToken);

        client.current.setClientRole(isBroadcaster ? "host" : "audience");
        await client.current.join(APP_ID, channelName, newToken, null);

        if(isBroadcaster){
            const tracks = await AgoraRTC.createMicrophoneAndCameraTracks();
            localTracks.current = tracks;
            
            setTimeout(() => {
                if (document.getElementById("local-player")) {
                    tracks[1].play("local-player");
                } else {
                    console.error("local-player div not found!");
                }
            }, 500); 

            await client.current.publish(tracks);
            setIsJoined(true);
        }
        setIsJoined(true);
    }

    //? TOGGLE mic
    const toggleMic = async ()=>{
        if (localTracks.current[0]) {
            micOn ? await localTracks.current[0].setEnabled(false) : await localTracks.current[0].setEnabled(true);
            setMicOn(!micOn);
        }
    }

    // Toggle Camera
    const toggleCamera = async () => {
        if (localTracks.current[1]) {
            cameraOn ? await localTracks.current[1].setEnabled(false) : await localTracks.current[1].setEnabled(true);
            setCameraOn(!cameraOn);
        }
    };

    return (
        <div>
            {!isJoined && (
                <>
                    <input
                        type="text"
                        placeholder="Enter Channel Name"
                        value={channelName}
                        onChange={(e) => setChannelName(e.target.value)}
                    />
                    <button onClick={StartBroadcast}>Start Broadcast</button>
                    <button onClick={() => setIsBroadcaster(false)}>Join as Viewer</button>
                </>
            )}

            {isJoined && (
                <div>
                    <div id="local-player" style={{ width: "400px", height: "300px", background: "#000" }}></div>
                    {isBroadcaster && (
                        <div>
                            <button onClick={toggleMic}>{micOn ? "Turn Mic OFF" : "Turn Mic ON"}</button>
                            <button onClick={toggleCamera}>{cameraOn ? "Turn Camera OFF" : "Turn Camera ON"}</button>
                        </div>
                    )}
                    {!isBroadcaster && (
                        <button onClick={toggleMic}>{micOn ? "Mute Mic" : "Unmute Mic"}</button>
                    )}
                </div>
            )}
            {!isJoined && <button onClick={joinChannel}>Join Live Stream</button>}
        </div>
    );
};

export default LiveStream;