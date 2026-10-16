import {test} from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {JSDOM} from "jsdom";

const html = readFileSync("index.html","utf8");
const script = readFileSync("app.js","utf8");
async function boot(t, stored) {
  const dom = new JSDOM(html, {url:"http://localhost", runScripts:"dangerously"});
  await new Promise(resolve => dom.window.addEventListener("load", resolve));
  const w = dom.window;
  w.structuredClone = structuredClone;
  if (stored !== undefined) w.localStorage.setItem("serdengectiler.v1", stored);
  const node = w.document.createElement("script"); node.textContent = script; w.document.body.append(node);
  w.document.dispatchEvent(new w.Event("DOMContentLoaded"));
  t.after(() => w.close());
  return w;
}
const json = (w, expression) => JSON.parse(w.eval("JSON.stringify(" + expression + ")"));
function card(w) {
  w.eval('activeFormCards = [{id:"f_test",city:"Ankara",district:"Çankaya",level:"Üniversite",school:"Ankara Üniversitesi",location:"Salon",type:"Workshop",date:"2026-07-18",participants:25,volunteers:0,notes:"Not"}]');
}
test("draft survives fresh page and is isolated by demo role", async t => {
  const w = await boot(t); w.loginUser(); card(w); w.saveDraft();
  const next = await boot(t,w.localStorage.getItem("serdengectiler.v1"));
  next.loginUser(); assert.equal(json(next,"activeFormCards")[0].notes,"Not");
  next.logoutUser(); next.selectQuickRole("Representative","Siirt","İl","demo","");
  next.loginUser(); assert.equal(json(next,"activeFormCards").length,0);
});
test("submit, edit and delete persist across reload", async t => {
  const w = await boot(t); w.loginUser();card(w);w.submitFinalReport();
  assert.equal(json(w,"dbActivities").length,6);
  assert.equal(json(w,"savedDrafts")["President:all"],undefined);
  const id=json(w,"dbActivities")[0].id;
  w.openEditModal(id);
  w.document.getElementById("edit-school").value='Yeni kurum';
  w.saveEditFromModal();
  const next=await boot(t,w.localStorage.getItem("serdengectiler.v1"));next.loginUser();
  assert.equal(json(next,"dbActivities")[0].school,"Yeni kurum");
  next.deleteActivity(id);next.document.getElementById("modal-confirm-btn").click();
  assert.equal(JSON.parse(next.localStorage.getItem("serdengectiler.v1")).activities.length,5);
});
for(const [field,value] of [["participants",-1],["participants",1.5],["volunteers",-2],["date","2026-02-31"],["school",""]]){
 test("reject invalid "+field+"="+value,async t=>{
  const w=await boot(t);w.loginUser();card(w);
  w.eval("activeFormCards[0]["+JSON.stringify(field)+"]="+JSON.stringify(value));
  w.submitFinalReport();assert.equal(json(w,"dbActivities").length,5);
  assert.equal(json(w,"activeFormCards").length,1);
 });
}
test("storage write error does not pretend success or discard form",async t=>{
 const w=await boot(t);w.loginUser();card(w);
 w.Storage.prototype.setItem=()=>{throw Error("quota");};
 w.submitFinalReport();assert.equal(json(w,"dbActivities").length,5);
 assert.equal(json(w,"activeFormCards")[0].id,"f_test");
 assert.match(w.document.getElementById("toast-container").textContent,/Kaydedilemedi/);
});
test("corrupt storage is preserved and writes blocked",async t=>{
 const w=await boot(t,"{bad");w.loginUser();card(w);w.saveDraft();
 assert.equal(w.localStorage.getItem("serdengectiler.v1"),"{bad");
});
test("user content is text, not HTML in cards and table",async t=>{
 const w=await boot(t);w.loginUser();card(w);
 w.eval('activeFormCards[0].notes = "</textarea><img src=x onerror=alert(1)>"; activeFormCards[0].district = "\\" autofocus onfocus=alert(1) x=\\"";');
 w.renderFormCards();assert.equal(w.document.querySelectorAll("#report-form-container img").length,0);
 assert.equal(w.document.querySelectorAll("#report-form-container [onfocus]").length,0);
 w.submitFinalReport();
 const id=json(w,"dbActivities")[0].id;w.openEditModal(id);
 w.document.getElementById("edit-school").value="<img src=x onerror=alert(1)>";w.saveEditFromModal();
 assert.equal(w.document.querySelectorAll("#crud-table-body img").length,0);
 assert.match(w.document.getElementById("crud-table-body").textContent,/<img/);
});
test("representative cannot edit another city through direct handler",async t=>{
 const w=await boot(t);w.selectQuickRole("Representative","Siirt","İl","demo","");w.loginUser();
 w.openEditModal("act_103");assert.ok(w.document.getElementById("edit-modal").classList.contains("hidden"));
 w.saveEditFromModal();assert.equal(json(w,"dbActivities").find(a=>a.id==="act_103").city,"Ankara");
});
test("empty filtered dashboard has zero count/score and no invented curve",async t=>{
 const w=await boot(t);w.loginUser();
 w.document.getElementById("dash-filter-city").value="Adana";w.onCityFilterChanged();
 assert.equal(w.document.getElementById("dashTotalActivities").textContent,"0");
 assert.equal(w.document.getElementById("dashScore").textContent,"0.00 Puan");
 assert.match(w.document.getElementById("pie-lbl-students").textContent,/Ölçülmüyor/);
 assert.match(w.document.getElementById("trend-ratio-percentage").textContent,/karşılaştırması yok/);
});
test("photo placeholder never changes participant data",async t=>{
 const w=await boot(t);w.loginUser();card(w);w.simulatePhotoAnalysis();
 assert.equal(json(w,"activeFormCards")[0].participants,25);
});
test("all inline event handler names resolve",async t=>{
 const w=await boot(t);w.loginUser();card(w);w.renderFormCards();
 for(const node of w.document.querySelectorAll("[onclick],[oninput],[onchange]")){
  for(const attr of ["onclick","oninput","onchange"]){
   const code=node.getAttribute(attr)||"";
   for(const match of code.matchAll(/(?:^|;)\s*([a-zA-Z]\w*)\(/g)){
    assert.equal(typeof w[match[1]],"function",match[1]);
   }
  }
 }
});
test("other-tab update prevents silent overwrite", async t=>{
 const w=await boot(t);w.loginUser();card(w);
 w.localStorage.setItem("serdengectiler.v1","other tab data");
 w.submitFinalReport();
 assert.equal(w.localStorage.getItem("serdengectiler.v1"),"other tab data");
 assert.equal(json(w,"dbActivities").length,5);
});
test("CSV uses filtered rows, escapes quotes and neutralizes formulas",async t=>{
 const w=await boot(t);w.loginUser();
 w.eval('dbActivities[0].school = \'=SUM(1;2)"test\';');
 w.document.getElementById("filter-city").value="Siirt";
 let output;
 w.Blob=class {constructor(parts){output=parts.join("");}};
 w.URL.createObjectURL=()=>"blob:test";w.URL.revokeObjectURL=()=>{};
 w.HTMLAnchorElement.prototype.click=function(){assert.ok(this.download.endsWith(".csv"));};
 w.exportToExcel();
 assert.ok(output.includes('"\'=SUM(1;2)""test"'));
 assert.ok(!output.includes("İstanbul Üniversitesi"));
});
