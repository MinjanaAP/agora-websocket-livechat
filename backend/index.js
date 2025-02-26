require('dotenv').config();
import express from 'express';
import cors from 'cors';
const { RtcTokenBuilder, RtcRole } = require('agora-access-token');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 8000;
const APP_ID = process.env.APP_ID;
const APP_CERTIFICATE = process.env.APP_CERTIFICATE;

const WebSocket = require('ws');


//? GENERATE an authentication token
app.post('/generate-token', (req, res)=>{
    const { channelName, uid, role} = req.body;

    if(!channelName){
        return res.status(400).json({
            error: "Channel name is required."
        })
    }

    const expirationTimeInSeconds = 3600; 
    const currentTime = Math.floor(Date.now() / 1000);
    const privilegeExpiredTs = currentTime + expirationTimeInSeconds;

    const token = RtcTokenBuilder.buildTokenWithUid(
        APP_ID,
        APP_CERTIFICATE,
        channelName,
        uid || 0,
        role === 'publisher' ? RtcRole.PUBLISHER : RtcRole.SUBSCRIBER,
        privilegeExpiredTs
    );
    res.json({ token });
})


//?Websocket API s
const wss = new WebSocket.Server({port:8080});

wss.on('connection', (ws)=>{
    console.log('Client connected.');

    ws.on('message', (message)=>{
        console.log(`Received Message : ${message}`);

        wss.clients.forEach((client)=>{
            if(client.readyState === WebSocket.OPEN){
                client.send(message);
            }
        });
    });

    ws.on('close',()=> console.log("Client disconnected."));
})
