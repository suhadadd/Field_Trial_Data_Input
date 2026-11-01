const DB_NAME = "padi-field-trial";
const STORE = "observations";
const $ = id => document.getElementById(id);
let db;

function openDB(){
  return new Promise((resolve,reject)=>{
    const req=indexedDB.open(DB_NAME,1);
    req.onupgradeneeded=()=>{const d=req.result;if(!d.objectStoreNames.contains(STORE))d.createObjectStore(STORE,{keyPath:"id"});};
    req.onsuccess=()=>{db=req.result;resolve(db);};req.onerror=()=>reject(req.error);
  });
}
function allRecords(){
  return new Promise((resolve,reject)=>{const r=db.transaction(STORE).objectStore(STORE).getAll();r.onsuccess=()=>resolve(r.result.sort((a,b)=>b.createdAt.localeCompare(a.createdAt)));r.onerror=()=>reject(r.error);});
}
function putRecord(record){
  return new Promise((resolve,reject)=>{const r=db.transaction(STORE,"readwrite").objectStore(STORE).put(record);r.onsuccess=()=>resolve();r.onerror=()=>reject(r.error);});
}
function updateRecord(record){
  return putRecord(record);
}
function makeId(){return "OBS-"+Date.now().toString(36)+"-"+Math.random().toString(36).slice(2,8).toUpperCase();}
function setNetwork(){ $("netStatus").textContent=navigator.onLine?"Online":"Offline"; }
function switchTab(name){
  document.querySelectorAll(".tab").forEach(b=>b.classList.toggle("active",b.dataset.tab===name));
  document.querySelectorAll(".panel").forEach(p=>p.classList.toggle("active",p.id===name));
  if(name==="records")renderRecords();
}
async function renderRecords(){
  const rows=await allRecords();
  $("pendingCount").textContent=rows.filter(x=>x.syncStatus!=="synced").length;
  $("savedCount").textContent=rows.length;
  $("recordList").innerHTML=rows.length?rows.map(r=>`<article class="record"><strong>${esc(r.parameter)} · ${esc(r.value)} ${esc(r.unit||"")}</strong><p>${esc(r.projectCode)} / ${esc(r.plotCode)} · ${esc(r.date)} · ${r.hst===""?"HST —":"HST "+esc(r.hst)}</p><p>${esc(r.treatment||"Tanpa perlakuan")} · ${esc(r.observer||"Pengamat belum diisi")}</p><span class="pill ${r.syncStatus==="synced"?"done":""}">${r.syncStatus==="synced"?"Tersinkron":"Menunggu sinkronisasi"}</span></article>`).join(""):'<p class="muted">Belum ada data.</p>';
}
function esc(v){return String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
async function saveObservation(e){
  e.preventDefault();
  const record={
    id:makeId(),projectCode:$("projectCode").value.trim(),projectName:$("projectName").value.trim(),
    plotCode:$("plotCode").value.trim(),treatment:$("treatment").value.trim(),
    date:$("obsDate").value,hst:$("hst").value,parameter:$("parameter").value,
    value:Number($("value").value),unit:$("unit").value.trim(),observer:$("observer").value.trim(),
    notes:$("notes").value.trim(),createdAt:new Date().toISOString(),syncStatus:"pending"
  };
  await putRecord(record);e.target.reset();$("obsDate").value=new Date().toISOString().slice(0,10);
  $("syncMessage").textContent="Data tersimpan di perangkat. Anda dapat mengisi data berikutnya.";
  await renderRecords();
}
async function syncRecords(){
  const endpoint=localStorage.getItem("padiEndpoint");
  if(!endpoint){$("syncMessage").textContent="URL Apps Script belum diatur. Buka tab Pengaturan.";return;}
  if(!navigator.onLine){$("syncMessage").textContent="Perangkat sedang offline. Data tetap aman tersimpan di HP.";return;}
  const pending=(await allRecords()).filter(x=>x.syncStatus!=="synced");
  if(!pending.length){$("syncMessage").textContent="Tidak ada data yang menunggu sinkronisasi.";return;}
  $("syncBtn").disabled=true;$("syncMessage").textContent="Mengirim "+pending.length+" catatan...";
  let ok=0,fail=0;
  for(const rec of pending){
    try{
      const res=await fetch(endpoint,{method:"POST",headers:{"Content-Type":"text/plain;charset=utf-8"},body:JSON.stringify({action:"addObservation",record:rec})});
      const data=await res.json();
      if(data.ok){rec.syncStatus="synced";rec.syncedAt=new Date().toISOString();await updateRecord(rec);ok++;}
      else fail++;
    }catch(err){fail++;}
  }
  $("syncBtn").disabled=false;$("syncMessage").textContent=`Selesai: ${ok} berhasil, ${fail} belum berhasil. Data gagal tetap tersimpan di HP.`;
  await renderRecords();
}
document.querySelectorAll(".tab").forEach(b=>b.addEventListener("click",()=>switchTab(b.dataset.tab)));
$("observationForm").addEventListener("submit",saveObservation);
$("syncBtn").addEventListener("click",syncRecords);
$("refreshBtn").addEventListener("click",renderRecords);
$("saveSettings").addEventListener("click",()=>{localStorage.setItem("padiEndpoint",$("endpoint").value.trim());$("syncMessage").textContent="URL sinkronisasi tersimpan pada perangkat ini.";});
window.addEventListener("online",setNetwork);window.addEventListener("offline",setNetwork);
(async()=>{await openDB();$("obsDate").value=new Date().toISOString().slice(0,10);$("endpoint").value=localStorage.getItem("padiEndpoint")||"";setNetwork();await renderRecords();if("serviceWorker" in navigator)navigator.serviceWorker.register("./sw.js").catch(()=>{});})();
