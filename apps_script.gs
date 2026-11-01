/**
 * PADI FIELD TRIAL — Google Sheets backend prototype
 * 1) Tempel seluruh file ini di Apps Script yang terikat ke spreadsheet.
 * 2) Jalankan setupDatabase() satu kali.
 * 3) Deploy > New deployment > Web app.
 * 4) Execute as: Me. Who has access: Anyone (atau sesuai kebijakan organisasi).
 *
 * Catatan: Endpoint publik memerlukan pertimbangan keamanan. Untuk penggunaan tim,
 * batasi akses spreadsheet, tambahkan token/API key, atau gunakan autentikasi terkelola.
 */
const SHEETS = {
  PROJECT: ["project_code","project_name","commodity","variety","trial_type","design_type","location_code","start_date","planting_date","notes","created_at"],
  LOCATION: ["location_code","location_name","village","district","regency","province","latitude","longitude","soil_type","notes"],
  TREATMENT: ["project_code","treatment_code","treatment_name","description","dose","dose_unit","application_method"],
  PLOT_MASTER: ["plot_id","project_code","block_replication","plot_number","treatment_code","plot_code","plot_area_m2","planting_date","status"],
  PARAMETER_MASTER: ["parameter_code","parameter_name","category","unit","data_type","method","min_value","max_value","active"],
  OBSERVATION: ["observation_id","project_code","project_name","plot_code","treatment_code","observation_date","hst","parameter_name","value","unit","observer","notes","created_at","synced_at"],
  HARVEST_DATA: ["harvest_id","project_code","plot_code","treatment_code","harvest_date","harvest_area_m2","grain_weight_kg","moisture_percent","yield_t_ha","thousand_grain_weight_g","notes","observer"],
  PHOTO_LOG: ["photo_id","project_code","plot_code","photo_date","hst","category","drive_file_url","caption","observer"],
  APPLICATION_LOG: ["application_id","project_code","plot_code","treatment_code","application_date","product_name","active_ingredient","dose","dose_unit","water_volume","application_method","weather","observer","notes"],
  USER_MASTER: ["user_id","name","role","email","active"],
  DASHBOARD: ["metric","value","updated_at"]
};
function setupDatabase(){
  const ss=SpreadsheetApp.getActiveSpreadsheet();
  Object.keys(SHEETS).forEach(name=>{
    let sh=ss.getSheetByName(name); if(!sh) sh=ss.insertSheet(name);
    const headers=SHEETS[name];
    if(sh.getLastRow()===0) sh.getRange(1,1,1,headers.length).setValues([headers]);
    sh.setFrozenRows(1); sh.getRange(1,1,1,headers.length).setFontWeight("bold").setBackground("#176b3a").setFontColor("#ffffff");
    sh.autoResizeColumns(1,headers.length); sh.setRowHeight(1,28);
  });
  SpreadsheetApp.flush();
  return "Database PADI FIELD TRIAL siap.";
}
function doGet(){
  return json_({ok:true,app:"PADI FIELD TRIAL API",version:"0.1"});
}
function doPost(e){
  try{
    const payload=JSON.parse(e.postData.contents||"{}");
    if(payload.action==="addObservation") return addObservation_(payload.record);
    return json_({ok:false,error:"Aksi tidak dikenal"});
  }catch(err){return json_({ok:false,error:String(err)});}
}
function addObservation_(r){
  if(!r || !r.id || !r.projectCode || !r.plotCode || !r.date || !r.parameter) throw new Error("Data wajib belum lengkap.");
  const ss=SpreadsheetApp.getActiveSpreadsheet();
  const sh=ss.getSheetByName("OBSERVATION");
  if(!sh) throw new Error("Jalankan setupDatabase() terlebih dahulu.");
  const ids=sh.getLastRow()>1?sh.getRange(2,1,sh.getLastRow()-1,1).getValues().flat():[];
  if(ids.includes(r.id)) return json_({ok:true,duplicate:true,id:r.id});
  sh.appendRow([r.id,r.projectCode,r.projectName||"",r.plotCode,r.treatment||"",r.date,r.hst||"",r.parameter,r.value,r.unit||"",r.observer||"",r.notes||"",r.createdAt||new Date().toISOString(),new Date().toISOString()]);
  return json_({ok:true,id:r.id});
}
function json_(obj){return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);}
