import { createApp } from './app.ts';
if(process.env.DEMO_MODE!=='true'||process.env.NODE_ENV==='production')throw new Error('This reference API is a development demo with volatile storage. Production startup is disabled until the PostgreSQL repository, real OTP sessions, upload verification, and reconciliation workers are integrated and tested.');
const {server,market}=createApp({demo:true,secret:process.env.ACCESS_TOKEN_SECRET,webhookSecret:process.env.RAZORPAY_WEBHOOK_SECRET,origins:(process.env.CORS_ORIGINS??'http://localhost:3000,http://localhost:8081,http://localhost:4173,http://127.0.0.1:4173,http://localhost:5173,http://127.0.0.1:5173').split(',')});
const timer=setInterval(()=>void market.expireReservations(),30000);timer.unref();
server.listen(Number(process.env.PORT??4000),process.env.HOST??'127.0.0.1',()=>console.log(`KhetSetu development API listening on port ${process.env.PORT??4000}; volatile demo data; no production authentication.`));
for(const signal of ['SIGTERM','SIGINT'])process.on(signal,()=>{clearInterval(timer);server.close(()=>process.exit(0));});
