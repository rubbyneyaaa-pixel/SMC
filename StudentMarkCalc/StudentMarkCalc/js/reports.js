const bar=(l,v,max,suf)=>`<div class="bar"><span>${esc(l)}</span><i><u style="width:${max?Math.round(v/max*100):0}%"></u></i><b>${v}${suf||""}</b></div>`;
boot("reports.html",()=>{
  const s=getStats();$("stats").innerHTML=statCards(s);
  if(!s.n){document.querySelectorAll(".rep").forEach(e=>e.innerHTML='<p class="empty">No data yet. Save a student on the Calculator page to see reports.</p>');return}
  const g=Object.fromEntries(all("SELECT grade, COUNT(*) c FROM students GROUP BY grade").map(r=>[r.grade,r.c]));
  $("grades").innerHTML=["O","A+","A","B+","B","C","F"].map(k=>bar("Grade "+k,g[k]||0,s.n)).join("");
  const q=SUBJECTS.map(([k])=>`ROUND(AVG(${k}),1) a_${k}, MAX(${k}) h_${k}, SUM(${k}<${PASS_MARK}) f_${k}`).join(",");
  const r=all("SELECT "+q+" FROM students")[0];
  $("subjects").innerHTML=SUBJECTS.map(([k,l])=>bar(l,r["a_"+k],100)).join("");
  $("subTable").innerHTML=SUBJECTS.map(([k,l])=>`<tr><td>${l}</td><td>${r["a_"+k]}</td><td>${r["h_"+k]}</td><td>${r["f_"+k]}</td></tr>`).join("");
  $("top").innerHTML=all("SELECT name,reg_no,percentage,grade FROM students WHERE result='Pass' ORDER BY percentage DESC LIMIT 5").map(t=>`<li><span>${esc(t.name)} <small class="sub">${esc(t.reg_no)}</small></span><b>${t.percentage}% (${esc(t.grade)})</b></li>`).join("")||'<li class="sub">No passing students yet.</li>';
  $("pf").innerHTML=bar("Passed",s.passed,s.n)+bar("Failed",s.n-s.passed,s.n)});
