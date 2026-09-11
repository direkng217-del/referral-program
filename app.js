let currentUser={name:"",role:""}; let referrals=JSON.parse(localStorage.getItem("referrals")||"[]");
const $=id=>document.getElementById(id);
function showLogin(){$("splash").classList.add("hidden");$("login").classList.remove("hidden")}
function backSplash(){$("login").classList.add("hidden");$("splash").classList.remove("hidden")}
function login(){let n=$("loginName").value.trim();if(!n){alert("Nama user wajib diisi.");return}currentUser={name:n,role:$("loginRole").value};localStorage.setItem("currentUser",JSON.stringify(currentUser));$("login").classList.add("hidden");$("app").classList.remove("hidden");$("activeName").textContent=n;$("activeRole").textContent=currentUser.role==="pejabat"?"Pejabat":"Petugas";$("userInfo").textContent=n+" • "+$("activeRole").textContent;$("dailyMenu").style.display="flex";
$("allDailyBtn").style.display=currentUser.role==="pejabat"?"inline-block":"none";;$("allReportBtn").style.display=currentUser.role==="pejabat"?"inline-block":"none";goHome()}
function logout(){currentUser={name:"",role:""};$("app").classList.add("hidden");$("login").classList.remove("hidden");$("loginName").value=""}
function hidePages(){document.querySelectorAll(".page").forEach(x=>x.classList.add("hidden"))}
function goHome(){hidePages();$("home").classList.remove("hidden")}
function openPage(id){hidePages();$(id).classList.remove("hidden");if(id==="printPage")renderReport("user");if(id==="dailyPage")renderDaily("user")}
$("refForm").addEventListener("submit",e=>{e.preventDefault();let r={id:Date.now(),tanggal:$("tanggal").value,petugas:$("petugas").value.trim(),,unit:$("unit").value.trim(),customer:$("customer").value.trim(),produk:$("produk").value,status:$("status").value,user:currentUser.name};referrals.push(r);localStorage.setItem("referrals",JSON.stringify(referrals));alert("Referral berhasil disimpan.");e.target.reset();$("tanggal").value=new Date().toISOString().slice(0,10)})
function dataFor(mode){
  return mode==="all"
    ? referrals
    : referrals.filter(r=>r.user===currentUser.name);
}
function table(rows, allowDelete=false){

  if(!rows.length){
    return '<div class="empty">Belum ada data referral.</div>';
  }

  return '<div class="tablewrap"><table><thead><tr>' +
    '<th>Tanggal</th>' +
    '<th>User</th>' +
    '<th>Nama</th>' +
    '<th>Unit</th>' +
    '<th>Customer</th>' +
    '<th>Produk</th>' +
    '<th>Status</th>' +
    (allowDelete ? '<th>Aksi</th>' : '') +
    '</tr></thead><tbody>' +

    rows.map(r =>
      '<tr>' +
      `<td>${r.tanggal}</td>` +
      `<td>${esc(r.user)}</td>` +
      `<td>${esc(r.nama)}</td>` +
      `<td>${esc(r.unit)}</td>` +
      `<td>${esc(r.customer)}</td>` +
      `<td>${esc(r.produk)}</td>` +
      `<td>${esc(r.status)}</td>` +

      (allowDelete ?
        `<td>
          <button class="secondary"
            onclick="deleteReferral(${r.id})">
            🗑 Hapus
          </button>
        </td>` : '') +

      '</tr>'
    ).join("") +

    '</tbody></table></div>';
}
function deleteReferral(id){
  const item = referrals.find(r => r.id === id);

  if(!item) return;

  if(currentUser.role !== "pejabat" &&
     item.user !== currentUser.name){
    alert("Anda hanya dapat menghapus data referral milik sendiri.");
    return;
  }

  if(!confirm(
    "Hapus data referral ini?\n\n" +
    "Customer: " + item.customer
  )){
    return;
  }

  referrals = referrals.filter(r => r.id !== id);

  localStorage.setItem(
    "referrals",
    JSON.stringify(referrals)
  );

  alert("Data referral berhasil dihapus.");

  renderDaily("all");
}
function renderDaily(mode){

  if(mode==="all" && currentUser.role!=="pejabat"){
    alert("Laporan semua nama khusus Pejabat.");
    return;
  }

  if(mode==="user" && currentUser.role==="pejabat"){

    const names = [...new Set(
      referrals.map(r => r.user)
    )];

    const box = $("dailyNameBox");
    const select = $("dailyNameSelect");

    box.style.display = "block";

    select.innerHTML =
      '<option value="">Pilih nama petugas</option>' +
      names.map(n =>
        `<option value="${esc(n)}">${esc(n)}</option>`
      ).join("");

    $("dailyContent").innerHTML =
      '<h3>Ringkasan</h3>' +
      '<p class="empty">Silakan pilih nama petugas.</p>';

    return;
  }

  $("dailyNameBox").style.display = "none";

  let rows = dataFor(mode);

  renderDailyRows(rows);
}
function renderDailyByName(){

  const name = $("dailyNameSelect").value;

  if(!name){
    $("dailyContent").innerHTML =
      '<h3>Ringkasan</h3>' +
      '<p class="empty">Silakan pilih nama petugas.</p>';
    return;
  }

  const rows = referrals.filter(r => r.user === name);

  renderDailyRows(rows);
}
function renderDailyRows(rows){

  let counts = {};

  rows.forEach(r => {
    counts[r.user] = (counts[r.user] || 0) + 1;
  });

  let summary =
    Object.entries(counts)
      .map(([u,c]) =>
        `<p><b>${esc(u)}</b>: ${c} referral</p>`
      )
      .join("") ||
      '<p class="empty">Belum ada data.</p>';

  $("dailyContent").innerHTML =
    '<h3>Ringkasan</h3>' +
    summary +
   table(rows,true);
}
function renderReport(mode){

  if(mode==="all" && currentUser.role!=="pejabat"){
    alert("Laporan semua nama khusus Pejabat.");
    return;
  }

  if(mode==="user" && currentUser.role==="pejabat"){

    const names = [...new Set(
      referrals.map(r => r.user)
    )];

    const box = $("reportNameBox");
    const select = $("reportNameSelect");

    box.style.display = "block";

    select.innerHTML =
      '<option value="">Pilih nama petugas</option>' +
      names.map(n =>
        `<option value="${esc(n)}">${esc(n)}</option>`
      ).join("");

    $("reportContent").innerHTML =
      '<p class="empty">Silakan pilih nama petugas.</p>';

    return;
  }

  $("reportNameBox").style.display = "none";

  let rows = dataFor(mode);

  $("reportContent").innerHTML =
    `<p><b>${mode==="all"?"Semua Nama":"Nama: "+esc(currentUser.name)}</b> — ${rows.length} referral</p>` +
    table(rows);
}
function renderReportByName(){

  const name = $("reportNameSelect").value;

  if(!name){
    $("reportContent").innerHTML =
      '<p class="empty">Silakan pilih nama petugas.</p>';
    return;
  }

  const rows = referrals.filter(r => r.user === name);

  $("reportContent").innerHTML =
    `<p><b>Nama: ${esc(name)}</b> — ${rows.length} referral</p>` +
    table(rows);
}
function printReport(){window.print()}
async function shareReport(){let rows=dataFor("user");let text="Referral Program\\nUser: "+currentUser.name+"\\nTotal referral: "+rows.length+"\\n\\n"+rows.map(r=>`${r.tanggal} | ${r.customer} | ${r.produk} | ${r.status}`).join("\\n");if(navigator.share){try{await navigator.share({title:"Referral Program",text})}catch(e){}}else{await navigator.clipboard.writeText(text);alert("Laporan disalin ke clipboard.")}}
function esc(s){return String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
$("tanggal").value=new Date().toISOString().slice(0,10);
document.querySelectorAll(".tabs button").forEach(btn=>btn.addEventListener("click",()=>{
  btn.parentElement.querySelectorAll("button").forEach(b=>b.classList.remove("active")); btn.classList.add("active");
}));
