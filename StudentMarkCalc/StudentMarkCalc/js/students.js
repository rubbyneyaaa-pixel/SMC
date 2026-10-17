function render(){
  const q=$("search").value.trim(),sort=$("sort").value;
  const rows=all(`SELECT * FROM students WHERE name LIKE ?1 OR reg_no LIKE ?1 ORDER BY ${sort}`,["%"+q+"%"]);
  $("rows").innerHTML=rows.length?rows.map(r=>`<tr><td>${esc(r.name)}</td><td>${esc(r.reg_no)}</td><td>${r.total}</td><td>${r.percentage}%</td><td>${esc(r.grade)}</td><td>${badge(r.result)}</td><td class="act"><button class="small" data-view="${r.id}">Marks</button><button class="small" data-edit="${r.id}">Edit</button><button class="small danger" data-del="${r.id}">Delete</button></td></tr><tr class="detail" id="d${r.id}" hidden><td colspan="7">${SUBJECTS.map(([k,l])=>`${l}: <b>${r[k]}</b>`).join(" &nbsp;|&nbsp; ")}</td></tr>`).join(""):`<tr><td colspan="7" class="empty">${q?"No students match your search.":"No saved students yet. Open the Calculator to add one."}</td></tr>`;
  $("count").textContent=rows.length+" record"+(rows.length===1?"":"s")}
boot("students.html",()=>{
  render();$("search").oninput=render;$("sort").onchange=render;
  $("rows").onclick=async e=>{
    const t=e.target.dataset;
    if(t.view){const r=$("d"+t.view);r.hidden=!r.hidden}
    if(t.edit)location.href="calculator.html?edit="+t.edit;
    if(t.del&&confirm("Delete this student record?")){db.run("DELETE FROM students WHERE id=?",[Number(t.del)]);await saveFile();render()}};
  $("expCsv").onclick=()=>{
    const cols=["name","reg_no","english","maths","cs","cn","dbms","total","percentage","grade","result"];
    const rows=all("SELECT "+cols.join(",")+" FROM students ORDER BY id"),q=v=>'"'+String(v).replace(/"/g,'""')+'"';
    const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([[cols.join(","),...rows.map(r=>cols.map(c=>q(r[c])).join(","))].join("\n")],{type:"text/csv"}));a.download="students.csv";a.click()};
  $("clear").onclick=async()=>{if(confirm("Delete ALL saved records? This cannot be undone.")){db.run("DELETE FROM students");db.run("DELETE FROM sqlite_sequence WHERE name='students'");await saveFile();render()}}});
