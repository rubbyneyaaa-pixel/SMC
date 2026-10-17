let editingId=null;
$("marks").innerHTML=SUBJECTS.map(([k,l])=>`<div><label for="m_${k}">${l}</label><div class="mark"><input id="m_${k}" type="number" min="0" max="100" step="1" inputmode="numeric"><span>/ 100</span></div></div>`).join("");
function msg(t,cls){const e=$("msg");e.textContent=t;e.className="msg "+(cls||"")}
function read(){
  const name=$("name").value.trim(),reg=$("reg").value.trim(),m={};
  if(!name)return{error:"Enter the student name."};
  if(!reg)return{error:"Enter the register number."};
  for(const[k,l]of SUBJECTS){const raw=$("m_"+k).value.trim(),v=Number(raw);
    if(raw===""||!Number.isInteger(v)||v<0||v>100)return{error:`${l} must be a whole number from 0 to 100.`};m[k]=v}
  return{name,reg,m,...compute(m)}}
function calculate(){
  const d=read();msg(d.error||"","err");
  if(d.error){$("result").classList.remove("show");return null}
  $("result").innerHTML=`<b>${esc(d.name)}</b> (${esc(d.reg)})<br>Total: <b>${d.total}</b> / ${SUBJECTS.length*100} &nbsp; Percentage: <b>${d.pct}%</b> &nbsp; Grade: <b>${d.grade}</b> &nbsp; ${badge(d.result)}`;
  $("result").classList.add("show");return d}
function reset(){editingId=null;$("name").value=$("reg").value="";SUBJECTS.forEach(([k])=>$("m_"+k).value="");$("result").classList.remove("show");$("save").textContent="Save result";$("cancel").hidden=true}
async function save(){
  const d=calculate();if(!d)return;
  const v=[d.name,d.reg,d.m.english,d.m.maths,d.m.cs,d.m.cn,d.m.dbms,d.total,d.pct,d.grade,d.result];
  try{
    if(editingId)db.run("UPDATE students SET name=?,reg_no=?,english=?,maths=?,cs=?,cn=?,dbms=?,total=?,percentage=?,grade=?,result=? WHERE id=?",[...v,editingId]);
    else db.run("INSERT INTO students(name,reg_no,english,maths,cs,cn,dbms,total,percentage,grade,result) VALUES(?,?,?,?,?,?,?,?,?,?,?)",v);
    await saveFile();
  }catch(e){msg(/UNIQUE/.test(e.message)?"That register number is already saved. Use a different one or edit the existing record.":"Could not save: "+e.message,"err");return}
  if(editingId){location.href="students.html";return}
  reset();msg("Saved. You can view it on the Students page.","good")}
boot("calculator.html",()=>{
  $("calc").onclick=calculate;$("save").onclick=save;$("cancel").onclick=()=>{location.href="students.html"};
  const id=new URLSearchParams(location.search).get("edit");
  if(id){const r=all("SELECT * FROM students WHERE id=?",[Number(id)])[0];
    if(r){editingId=r.id;$("name").value=r.name;$("reg").value=r.reg_no;SUBJECTS.forEach(([k])=>$("m_"+k).value=r[k]);
      $("save").textContent="Update result";$("cancel").hidden=false;$("title").textContent="Edit student";calculate()}}});
