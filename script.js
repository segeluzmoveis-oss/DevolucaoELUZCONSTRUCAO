const form = document.querySelector("#returnForm");
const fileInput = document.querySelector("#saleSummary");
const fileName = document.querySelector("#fileName");
const successMessage = document.querySelector("#successMessage");
const submitButton = document.querySelector("#submitButton");

const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzji4v9hrcD6A2NIYb00P6U2Kf7gfBA-LRnWxbGCz8Y4pkG2WO1HaqN35BVVE7aWYa9/exec";
const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
let isSubmitting = false;
const CONFIRM_TIMEOUT_MS = 90000;


fileInput.addEventListener("change", () => {
  const file = fileInput.files[0];
  fileName.textContent = file ? file.name : "Nenhum arquivo escolhido";
  successMessage.textContent = "";
  fileInput.setCustomValidity("");
});

form.addEventListener("reset", () => {
  fileName.textContent = "Nenhum arquivo escolhido";
  successMessage.textContent = "";
  successMessage.className = "success";
  unlockSubmitButton();
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (isSubmitting) return;

  const file = fileInput.files[0];
  if (!GOOGLE_SCRIPT_URL) {
    showMessage("A URL do Google Apps Script não foi configurada.", true);
    return;
  }
  if (!file || (file.type && file.type !== "application/pdf")) {
    fileInput.setCustomValidity("Anexe um arquivo em PDF.");
    fileInput.reportValidity();
    return;
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    fileInput.setCustomValidity(`O PDF deve ter no máximo ${MAX_FILE_SIZE_MB} MB.`);
    fileInput.reportValidity();
    return;
  }

  fileInput.setCustomValidity("");
  lockSubmitButton();
  showMessage("Enviando dados... aguarde.", false);

  try {
    const payload = {
      reason: form.elements["reason"].value.trim(),
      seller: form.elements["seller"].value.trim(),
      branch: form.elements["branch"].value.trim(),
      delivered: form.elements["delivered"].value,
      operation: form.elements["operation"].value,
      cancellation: form.elements["cancellation"].value,
      location: form.elements["location"].value.trim(),
      destination: form.elements["destination"].value.trim(),
      file: {
        name: file.name,
        mimeType: "application/pdf",
        content: await fileToBase64(file),
      },
    };

    // ID exclusivo permite consultar se o servidor realmente gravou a solicitação.
    payload.requestId = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
    });

    // Consulta de status via JSONP (somente ID e estado, sem dados pessoais).
    const result = await waitForConfirmation(payload.requestId);
    if (!result.ok) throw new Error(result.error || "O servidor não confirmou o registro.");
    window.location.assign("sucesso.html");
  } catch (error) {
    console.error("Erro ao enviar formulário:", error);
    showMessage(error.message || "Não foi possível confirmar o envio. Verifique a planilha antes de tentar novamente.", true);
  } finally {
    unlockSubmitButton();
  }
});

function lockSubmitButton() {
  isSubmitting = true;
  submitButton.disabled = true;
  submitButton.textContent = "Enviando...";
}

function unlockSubmitButton() {
  isSubmitting = false;
  submitButton.disabled = false;
  submitButton.textContent = "Enviar";
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result);
      resolve(result.split(",")[1]);
    };
    reader.onerror = () => reject(new Error("Não foi possível ler o PDF."));
    reader.readAsDataURL(file);
  });
}

function showMessage(message, isError) {
  successMessage.textContent = message;
  successMessage.className = isError ? "success error" : "success";
}

function checkStatus(requestId) {
  return new Promise((resolve, reject) => {
    const callbackName = `eluzStatus_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const script = document.createElement("script");
    let settled = false;
    const cleanup = () => { delete window[callbackName]; script.remove(); clearTimeout(timer); };
    const finish = (err, data) => { if (settled) return; settled = true; cleanup(); err ? reject(err) : resolve(data); };
    const timer = setTimeout(() => finish(new Error("Tempo esgotado ao consultar status.")), 12000);
    window[callbackName] = data => finish(null, data);
    script.onerror = () => finish(new Error("Não foi possível consultar o Apps Script. Confira a implantação."));
    const url = new URL(GOOGLE_SCRIPT_URL);
    url.searchParams.set("action", "status");
    url.searchParams.set("id", requestId);
    url.searchParams.set("callback", callbackName);
    url.searchParams.set("_", Date.now().toString());
    script.src = url.toString();
    document.head.appendChild(script);
  });
}
async function waitForConfirmation(id) {
  const until = Date.now() + CONFIRM_TIMEOUT_MS;
  let lastError = null;
  while (Date.now() < until) {
    try {
      const result = await checkStatus(id);
      if (result.status === "success") return { ok: true };
      if (result.status === "error") return { ok: false, error: result.error };
    } catch (error) { lastError = error; }
    await new Promise(resolve => setTimeout(resolve, 2500));
  }
  throw new Error("Não foi possível confirmar a gravação. Confira a planilha e as execuções do Apps Script antes de reenviar." + (lastError ? ` (${lastError.message})` : ""));
}
