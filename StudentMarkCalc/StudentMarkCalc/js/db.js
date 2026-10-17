/* Shared SQLite layer (sql.js) used by every page. */
const SUBJECTS=[["english","English"],["maths","Mathematics"],["cs","Computer Science"],["cn","Computer Networks"],["dbms","Database Management Systems"]];
const PASS_MARK=40,CDN="https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/";
const $=id=>document.getElementById(id);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
let db,SQL;
const SCHEMA=`CREATE TABLE IF NOT EXISTS students(
 id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, reg_no TEXT NOT NULL UNIQUE,
 english INTEGER NOT NULL, maths INTEGER NOT NULL, cs INTEGER NOT NULL, cn INTEGER NOT NULL, dbms INTEGER NOT NULL,
 total INTEGER NOT NULL, percentage REAL NOT NULL, grade TEXT NOT NULL, result TEXT NOT NULL,
 created_at TEXT DEFAULT CURRENT_TIMESTAMP);`;

function idb(){return new Promise((res,rej)=>{const r=indexedDB.open("StudentMarkCalc",1);r.onupgradeneeded=()=>r.result.createObjectStore("files");r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)})}
async function loadFile(){try{const d=await idb();return await new Promise(res=>{const q=d.transaction("files").objectStore("files").get("db");q.onsuccess=()=>res(q.result||null);q.onerror=()=>res(null)})}catch(e){return null}}
async function saveFile(){const d=await idb();const tx=d.transaction("files","readwrite");tx.objectStore("files").put(db.export(),"db");return new Promise((res,rej)=>{tx.oncomplete=res;tx.onerror=()=>rej(tx.error)})}
async function openDB(){
  SQL=await initSqlJs({locateFile:f=>CDN+f});
  const bytes=await loadFile();
  db=bytes?new SQL.Database(bytes):new SQL.Database();
  db.run(SCHEMA);return db}
function all(sql,p=[]){const st=db.prepare(sql);st.bind(p);const out=[];while(st.step())out.push(st.getAsObject());st.free();return out}

function gradeOf(pct,passed){if(!passed)return"F";return pct>=90?"O":pct>=80?"A+":pct>=70?"A":pct>=60?"B+":pct>=50?"B":"C"}
function compute(m){
  const total=Object.values(m).reduce((a,b)=>a+b,0),pct=Math.round(total/SUBJECTS.length*100)/100;
  const passed=Object.values(m).every(v=>v>=PASS_MARK);
  return{total,pct,grade:gradeOf(pct,passed),result:passed?"Pass":"Fail"}}
const badge=r=>`<span class="badge ${r==="Pass"?"pass":"fail"}">${r}</span>`;
function getStats(){
  const s=all("SELECT COUNT(*) n, AVG(percentage) a, MAX(percentage) h, SUM(result='Pass') p FROM students")[0];
  return{n:s.n,avg:s.n?Math.round(s.a*100)/100:null,high:s.n?s.h:null,rate:s.n?Math.round(s.p/s.n*100):null,passed:s.p||0}}
function statCards(s){return[["Students",s.n],["Average",s.n?s.avg+"%":"–"],["Highest",s.n?s.high+"%":"–"],["Pass rate",s.n?s.rate+"%":"–"]].map(([l,v])=>`<div class="stat"><b>${v}</b><span>${l}</span></div>`).join("")}

function renderNav(active){
  const L=[["index.html","Dashboard"],["calculator.html","Calculator"],["students.html","Students"],["reports.html","Reports"]];
  document.body.insertAdjacentHTML("afterbegin",`<nav class="nav"><div class="nav-in"><a class="brand" href="index.html"><span class="logo">SM</span>Student Marks</a><div class="links">${L.map(([h,t])=>`<a href="${h}"${h===active?' class="on" aria-current="page"':""}>${t}</a>`).join("")}</div></div></nav>`)}
function boot(active,init){
  renderNav(active);
  openDB().then(init).catch(e=>{const m=document.querySelector(".wrap");if(m)m.insertAdjacentHTML("afterbegin",`<div class="card msg err">Could not load the SQLite engine. Check your internet connection and reload. (${esc(e.message||e)})</div>`)})}
