// Configure o ID da PLANILHA (entre /d/ e /edit na URL do Google Sheets).
// Se o Apps Script foi criado DENTRO da planilha, pode deixar vazio.
const SPREADSHEET_ID = "";
const SHEET_NAME = "Respostas";
const FOLDER_ID = "1GzOV1vqxCASax9SMIBafBVUCYC5h69vA";
const HEADERS = ["Data do envio", "Motivo da Devolução", "Vendedor", "Filial solicitante", "Produto foi entregue", "Operação da venda", "Cancelamento ou troca", "Onde o produto está", "Para onde o produto vai", "PDF no Drive"];

function doGet(e) {
  const p = (e && e.parameter) || {};
  if (p.action !== "status") return ContentService.createTextOutput("Web App Eluz ativo");
  const callback = String(p.callback || "");
  if (!/^eluzStatus_[A-Za-z0-9_]+$/.test(callback)) return ContentService.createTextOutput("Callback inválido");
  const id = String(p.id || "");
  const state = id ? PropertiesService.getScriptProperties().getProperty("req_" + id) : null;
  let response = {status: "pending"};
  if (state) { try { response = JSON.parse(state); } catch (_) {} }
  return ContentService.createTextOutput(callback + "(" + JSON.stringify(response) + ");")
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
}

function doPost(e) {
  let id = "";
  try {
    if (!e || !e.postData || !e.postData.contents) throw new Error("Corpo da requisição vazio");
    const data = JSON.parse(e.postData.contents);
    id = String(data.requestId || "");
    if (!/^[a-zA-Z0-9_-]{10,100}$/.test(id)) throw new Error("ID da solicitação inválido");
    const props = PropertiesService.getScriptProperties();
    const lock = LockService.getScriptLock();
    lock.waitLock(30000);
    try {
      const existing = props.getProperty("req_" + id);
      if (existing) return jsonResponse(JSON.parse(existing));
      for (const field of ["reason","seller","branch","delivered","operation","cancellation","location","destination"]) {
        if (!String(data[field] || "").trim()) throw new Error("Campo obrigatório ausente: " + field);
      }
      if (!data.file || !data.file.content || !/\.pdf$/i.test(data.file.name || "")) throw new Error("PDF obrigatório");
      const bytes = Utilities.base64Decode(data.file.content);
      if (bytes.length > 10 * 1024 * 1024) throw new Error("PDF excede 10 MB");
      if (bytes.length < 5 || bytes.slice(0,5).map(x => String.fromCharCode(x)).join("") !== "%PDF-") throw new Error("Arquivo não é um PDF válido");
      const sheet = getSheet();
      const safeName = String(data.file.name).replace(/[\\/]/g,"_");
      const pdf = DriveApp.getFolderById(FOLDER_ID).createFile(Utilities.newBlob(bytes, "application/pdf", safeName));
      const safe = v => { const s=String(v||"").trim(); return /^[=+@\-]/.test(s) ? "'" + s : s; };
      sheet.appendRow([new Date(), safe(data.reason), safe(data.seller), safe(data.branch), safe(data.delivered), safe(data.operation), safe(data.cancellation), safe(data.location), safe(data.destination), pdf.getUrl()]);
      SpreadsheetApp.flush();
      const result = {status:"success", ok:true};
      props.setProperty("req_" + id, JSON.stringify(result));
      return jsonResponse(result);
    } finally { lock.releaseLock(); }
  } catch (err) {
    console.error(err.stack || err);
    const result = {status:"error", ok:false, error:String(err.message || err)};
    if (id) PropertiesService.getScriptProperties().setProperty("req_" + id, JSON.stringify(result));
    return jsonResponse(result);
  }
}
function getSheet() {
  const ss = SPREADSHEET_ID ? SpreadsheetApp.openById(SPREADSHEET_ID) : SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) throw new Error("Planilha não encontrada. Preencha SPREADSHEET_ID no Code.gs.");
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(SHEET_NAME);
  if (sheet.getLastRow() === 0) sheet.appendRow(HEADERS);
  else sheet.getRange(1,1,1,HEADERS.length).setValues([HEADERS]);
  return sheet;
}
function jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}
// Execute manualmente uma vez para autorizar acesso ao Sheets e ao Drive.
function testarConfiguracao() {
  const sheet = getSheet();
  const folder = DriveApp.getFolderById(FOLDER_ID);
  console.log("OK: aba " + sheet.getName() + " / pasta " + folder.getName());
}
