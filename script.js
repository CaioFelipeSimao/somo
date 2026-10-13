const form = document.getElementById("form");
const status = document.getElementById("status");
const button = form.querySelector("button");

function show(msg, kind) {
  status.textContent = msg;
  status.className = "status " + kind;
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  for (const field of form.querySelectorAll("[required]")) {
    field.setAttribute("aria-invalid", field.validity.valid ? "false" : "true");
  }

  if (!form.checkValidity()) {
    show("Preencha nome, tipo de negócio e um contato para eu te responder.", "erro");
    form.querySelector(":invalid").focus();
    return;
  }

  const key = window.FORM_ACCESS_KEY;
  if (!key || key.startsWith("COLE_AQUI")) {
    show("O formulário ainda não está configurado. Tente de novo mais tarde.", "erro");
    return;
  }

  button.disabled = true;
  show("Enviando…", "");

  const data = new FormData(form);
  data.append("access_key", key);
  data.append("subject", "Novo pedido de diagnóstico");

  try {
    const res = await fetch("https://api.web3forms.com/submit", { method: "POST", body: data });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.message);
    show("Recebi seu pedido, respondo em até 2 dias úteis.", "ok");
    form.reset();
    form.querySelectorAll("[aria-invalid]").forEach((f) => f.removeAttribute("aria-invalid"));
    // botão fica inativo de propósito, para evitar envio duplicado
  } catch {
    button.disabled = false;
    show("Não consegui enviar. Verifique sua internet e tente de novo.", "erro");
  }
});
