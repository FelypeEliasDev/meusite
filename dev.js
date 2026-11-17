const header = document.querySelector(".site-header");
const menuToggle = document.querySelector(".menu-toggle");
const mainNav = document.querySelector("#main-nav");
const sections = [...document.querySelectorAll("main section[id]")];
const navLinks = [...document.querySelectorAll("#main-nav a[href^='#']")];
const mobileMenu = window.matchMedia("(max-width: 640px)");

function setMenuOpen(isOpen) {
  mainNav.classList.toggle("is-open", isOpen);
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.setAttribute("aria-label", isOpen ? "Fechar menu" : "Abrir menu");
}

menuToggle.addEventListener("click", () => {
  const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
  setMenuOpen(!isOpen);
});

mainNav.addEventListener("click", (event) => {
  const link = event.target.closest("a[href^='#']");

  if (!link) {
    return;
  }

  setMenuOpen(false);

  const sectionId = link.hash.slice(1);
  if (sections.some((section) => section.id === sectionId)) {
    setActiveSection(sectionId);
  }
});

document.addEventListener("click", (event) => {
  if (mobileMenu.matches && !header.contains(event.target)) {
    setMenuOpen(false);
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && menuToggle.getAttribute("aria-expanded") === "true") {
    setMenuOpen(false);
    menuToggle.focus();
  }
});

mobileMenu.addEventListener("change", () => setMenuOpen(false));

function updateActiveSection() {
  const marker = window.scrollY + header.offsetHeight + window.innerHeight * 0.28;
  let activeSection = sections[0];

  for (const section of sections) {
    if (section.offsetTop <= marker) {
      activeSection = section;
    }
  }

  setActiveSection(activeSection.id);
}

function setActiveSection(sectionId) {
  for (const link of navLinks) {
    const isActive = link.hash === `#${sectionId}`;
    link.classList.toggle("nav-link--active", isActive);

    if (isActive) {
      link.setAttribute("aria-current", "location");
    } else {
      link.removeAttribute("aria-current");
    }
  }
}

window.addEventListener("scroll", updateActiveSection, { passive: true });
window.addEventListener("resize", updateActiveSection);
window.addEventListener("hashchange", () => {
  const sectionId = window.location.hash.slice(1);

  if (sections.some((section) => section.id === sectionId)) {
    setActiveSection(sectionId);
  }
});
updateActiveSection();

const scenarioForm = document.querySelector("#scenario-form");

if (scenarioForm) {
  const taskCountInput = document.querySelector("#tasks-per-month");
  const manualMinutesInput = document.querySelector("#manual-minutes");
  const automatedMinutesInput = document.querySelector("#automated-minutes");
  const hoursSavedOutput = document.querySelector("#hours-saved");
  const yearlyHoursSavedOutput = document.querySelector("#yearly-hours-saved");
  const timeReductionOutput = document.querySelector("#time-reduction");
  const tasksCountOutput = document.querySelector("#tasks-count");
  const manualTimeOutput = document.querySelector("#manual-time");
  const automatedTimeOutput = document.querySelector("#automated-time");
  const manualBar = document.querySelector("#manual-bar");
  const automatedBar = document.querySelector("#automated-bar");
  const scenarioStatus = document.querySelector("#scenario-status");
  const numberFormat = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 });

  function updateScenario() {
    const taskCount = Number(taskCountInput.value);
    const manualMinutes = Number(manualMinutesInput.value);
    const automatedMinutes = Number(automatedMinutesInput.value);
    const manualHours = (taskCount * manualMinutes) / 60;
    const automatedHours = (taskCount * automatedMinutes) / 60;
    const savedHours = manualHours - automatedHours;
    const reduction = manualHours > 0 ? (savedHours / manualHours) * 100 : 0;
    const maxHours = Math.max(manualHours, automatedHours);
    const manualWidth = maxHours > 0 ? (manualHours / maxHours) * 100 : 0;
    const automatedWidth = maxHours > 0 ? (automatedHours / maxHours) * 100 : 0;

    hoursSavedOutput.textContent = `${numberFormat.format(savedHours)} h`;
    yearlyHoursSavedOutput.textContent = `${numberFormat.format(savedHours * 12)} h`;
    timeReductionOutput.textContent = `${numberFormat.format(reduction)}%`;
    tasksCountOutput.textContent = numberFormat.format(taskCount);
    manualTimeOutput.textContent = `${numberFormat.format(manualHours)} h/mês`;
    automatedTimeOutput.textContent = `${numberFormat.format(automatedHours)} h/mês`;
    manualBar.style.width = `${manualWidth}%`;
    automatedBar.style.width = `${automatedWidth}%`;
  }

  scenarioForm.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!scenarioForm.reportValidity()) {
      return;
    }

    updateScenario();
    scenarioStatus.textContent = "Estimativa atualizada com os valores informados.";
  });

}

const runTriageButton = document.querySelector("#run-triage");

if (runTriageButton) {
  const triageForm = document.querySelector("#triage-form");
  const triageInput = document.querySelector("#triage-input");
  const triageList = document.querySelector("#triage-list");
  const processedOutput = document.querySelector("#triage-processed");
  const highPriorityOutput = document.querySelector("#triage-high-priority");
  const categoriesOutput = document.querySelector("#triage-categories");
  const triageStatus = document.querySelector("#triage-status");
  const categoryRules = [
    { name: "Acesso", pattern: /\b(senha|login|conta|acesso|bloquead[ao])\b/i },
    { name: "Pedido", pattern: /\b(pedido|entrega|rastreamento|rastreio)\b/i },
    { name: "Financeiro", pattern: /\b(boleto|pagamento|cobrança|cobrado|reembolso)\b/i },
  ];
  const highPriorityPattern = /\b(urgente|bloquead[ao]|parado|fraude)\b/i;
  const numberFormat = new Intl.NumberFormat("pt-BR");

  function getRequests() {
    return triageInput.value
      .split(/\r?\n/)
      .map((request) => request.trim())
      .filter(Boolean);
  }

  function clearTriageResults() {
    processedOutput.textContent = "—";
    highPriorityOutput.textContent = "—";
    categoriesOutput.textContent = "—";
    triageList.textContent = "";
    triageList.hidden = true;
  }

  triageInput.addEventListener("input", () => {
    const requestCount = getRequests().length;

    runTriageButton.disabled = requestCount !== 5;
    clearTriageResults();
    triageStatus.textContent = requestCount === 5
      ? "Cinco solicitações informadas. A classificação será executada localmente."
      : `Informe cinco solicitações não vazias (${numberFormat.format(requestCount)}/5).`;
  });

  triageForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const requests = getRequests();

    if (requests.length !== 5) {
      triageStatus.textContent = `Não foi possível classificar: informe exatamente cinco solicitações (${numberFormat.format(requests.length)}/5).`;
      triageInput.focus();
      return;
    }

    let highPriorityCount = 0;
    const categories = new Set();

    triageList.textContent = "";

    for (const request of requests) {
      const matchingRule = categoryRules.find((rule) => rule.pattern.test(request));
      const category = matchingRule ? matchingRule.name : "Geral";
      const isHighPriority = highPriorityPattern.test(request);
      const ticket = document.createElement("li");
      const requestText = document.createElement("p");
      const result = document.createElement("span");

      categories.add(category);
      highPriorityCount += Number(isHighPriority);
      ticket.className = "triage-ticket is-processed";
      requestText.textContent = request;
      result.className = "triage-result";
      result.textContent = `${category} · ${isHighPriority ? "Prioridade alta" : "Prioridade normal"}`;
      ticket.append(requestText, result);
      triageList.appendChild(ticket);
    }

    triageList.hidden = false;
    processedOutput.textContent = numberFormat.format(requests.length);
    highPriorityOutput.textContent = numberFormat.format(highPriorityCount);
    categoriesOutput.textContent = numberFormat.format(categories.size);
    triageStatus.textContent = `${numberFormat.format(requests.length)} solicitações classificadas localmente. Nenhum dado foi enviado ou salvo.`;
  });
}