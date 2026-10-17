boot("index.html",()=>{
  $("stats").innerHTML=statCards(getStats());
  const rows=all("SELECT name,reg_no,percentage,grade,result FROM students ORDER BY id DESC LIMIT 5");
  $("recent").innerHTML=rows.length?rows.map(r=>`<tr><td>${esc(r.name)}</td><td>${esc(r.reg_no)}</td><td>${r.percentage}%</td><td>${esc(r.grade)}</td><td>${badge(r.result)}</td></tr>`).join(""):`<tr><td colspan="5" class="empty">Nothing here yet. Open the Calculator to add the first student.</td></tr>`});
