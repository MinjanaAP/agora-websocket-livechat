require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { RtcTokenBuilder, RtcRole } = require('agora-access-token');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 8000;
const APP_ID = process.env.APP_ID || null;
const APP_CERTIFICATE = process.env.APP_CERTIFICATE || null;

const WebSocket = require('ws');


//? GENERATE an authentication token
app.post('/generate-token', (req, res)=>{
    try {
        const { channelName, uid, role} = req.body;
    
        if(!channelName){
            return res.status(400).json({
                status : false,
                message: "Channel name is required."
            })
        }
    
        const expirationTimeInSeconds = 3600; 
        const currentTime = Math.floor(Date.now() / 1000);
        const privilegeExpiredTs = currentTime + expirationTimeInSeconds;
    
        const rtcRole = role === 'publisher' ? RtcRole.PUBLISHER : RtcRole.SUBSCRIBER;
        const userId = uid ?? 0;
    
        const token = RtcTokenBuilder.buildTokenWithUid(
            APP_ID,
            APP_CERTIFICATE,
            channelName,
            userId,
            rtcRole,
            privilegeExpiredTs
        );
    
        res.status(200).json({
            status : true,
            token : token,
            message : "Token generated successfully."
        });
    } catch (error) {
        console.error("Error generating token:", error);
        res.status(500).json({
            status: false,
            message: "Failed to generate token"
        });
    }
})

app.post('/create-broadcast',(req, res)=>{
    const { channelName } = req.body;

    if (!channelName) {
        return res.status(400).json({ error: 'Channel name is required' });
    }

    res.json({ message: 'Broadcast created', channelName });
})


//?Websocket API s
// const wss = new WebSocket.Server({port:8080});

const server = require('http').createServer(app);
const wss = new WebSocket.Server({ server });

server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

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
