import express from 'express';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const __dirname=path.dirname(fileURLToPath(import.meta.url));
const app=express(); const http=createServer(app); const io=new Server(http,{cors:{origin:true}});
app.use(express.static(path.join(__dirname,'../dist')));
app.get('/health',(req,res)=>res.json({ok:true,game:'Penalti Game'}));
const rooms=new Map(); const teams=['Real Madrid','Barcelona','Manchester United','Manchester City','Liverpool','Bayern Munich','Borussia Dortmund','Paris Saint-Germain','Beşiktaş','Fenerbahçe','Galatasaray','Trabzonspor','Arsenal','Chelsea','Milan','Inter'];
const code=()=>Math.random().toString(36).slice(2,6).toUpperCase();
function pub(r){return {code:r.code,players:r.players.map(p=>({id:p.id,name:p.name,team:p.team,ready:p.ready,host:p.host})),phase:r.phase,round:r.round,score:[...r.score],turn:r.turn,shootSide:r.shootSide,choices:Object.keys(r.choices).length};}
function send(r){io.to(r.code).emit('room:update',pub(r));}
function start(r){r.phase='playing';r.round=1;r.score=[0,0];r.turn=0;r.shootSide=0;r.choices={};r.history=[];}
function finishKick(r){const shooter=r.shootSide, keeper=1-shooter;const a=r.choices[shooter],b=r.choices[keeper];const goal=a!==b; if(goal)r.score[shooter]++;r.history.push({round:r.round,shooter,shot:a,save:b,goal,score:[...r.score]});io.to(r.code).emit('kick:result',{shooter,shot:a,save:b,goal,score:r.score,round:r.round,history:r.history});r.turn++;r.round=Math.floor(r.turn/2)+1;r.shootSide=r.turn%2===0?0:1;r.choices={};if(r.turn>=10){if(r.score[0]!==r.score[1])r.phase='finished';else r.phase='sudden';}else if(r.turn>=10)r.phase='sudden';send(r);}
io.on('connection',s=>{
 s.on('room:create',({name,team},cb)=>{let c=code();while(rooms.has(c))c=code();const r={code:c,players:[{id:s.id,name:String(name||'Oyuncu 1').slice(0,16),team:teams.includes(team)?team:teams[0],ready:false,host:true}],phase:'lobby',round:0,score:[0,0],turn:0,shootSide:0,choices:{},history:[]};rooms.set(c,r);s.join(c);s.data.room=c;cb?.({ok:true,room:pub(r)});});
 s.on('room:join',({code:c,name,team},cb)=>{const r=rooms.get(String(c||'').toUpperCase());if(!r)return cb?.({ok:false,error:'Oda bulunamadı.'});if(r.players.length>=2)return cb?.({ok:false,error:'Oda dolu.'});if(r.phase!=='lobby')return cb?.({ok:false,error:'Maç başlamış.'});r.players.push({id:s.id,name:String(name||'Oyuncu 2').slice(0,16),team:teams.includes(team)?team:teams[1],ready:false,host:false});s.join(r.code);s.data.room=r.code;cb?.({ok:true,room:pub(r)});send(r);});
 s.on('player:update',({name,team,ready})=>{const r=rooms.get(s.data.room);if(!r||r.phase!=='lobby')return;const p=r.players.find(x=>x.id===s.id);if(!p)return;if(name)p.name=String(name).slice(0,16);if(team&&teams.includes(team))p.team=team;if(typeof ready==='boolean')p.ready=ready;send(r);});
 s.on('match:start',()=>{const r=rooms.get(s.data.room);if(!r||r.players[0]?.id!==s.id||r.players.length!==2||!r.players.every(p=>p.ready))return;start(r);io.to(r.code).emit('match:started',pub(r));send(r);});
 s.on('kick:choose',({direction})=>{const r=rooms.get(s.data.room);if(!r||!['playing','sudden'].includes(r.phase)||!['left','center','right'].includes(direction))return;const idx=r.players.findIndex(p=>p.id===s.id);if(idx<0||r.choices[idx])return;r.choices[idx]=direction;io.to(r.code).emit('kick:waiting',{count:Object.keys(r.choices).length});if(Object.keys(r.choices).length===2){finishKick(r);}});
 s.on('match:rematch',()=>{const r=rooms.get(s.data.room);if(!r||r.players[0]?.id!==s.id||r.phase!=='finished')return;start(r);io.to(r.code).emit('match:started',pub(r));send(r);});
 s.on('disconnect',()=>{const r=rooms.get(s.data.room);if(!r)return;io.to(r.code).emit('player:disconnected');r.players=r.players.filter(p=>p.id!==s.id);if(!r.players.length)rooms.delete(r.code);else{r.phase='lobby';r.players[0].host=true;r.players[0].ready=false;send(r);}});
});
const port=process.env.PORT||3000;http.listen(port,'0.0.0.0',()=>console.log(`Penaltı Game listening on ${port}`));
