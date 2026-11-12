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