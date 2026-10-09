const menuButton = document.querySelector(".menu-toggle");
const drawer = document.querySelector(".drawer");
const drawerBackdrop = document.querySelector(".drawer-backdrop");
const drawerClose = document.querySelector(".drawer-close");
const drawerFocusable = 'a[href], button:not([disabled])';

function closeDrawer(returnFocus = false) {
  if (!menuButton || !drawer || !drawerBackdrop) return;
  menuButton.setAttribute("aria-expanded", "false");
  menuButton.setAttribute("aria-label", "Open menu");
  drawer.setAttribute("aria-hidden", "true");
  drawer.inert = true;
  drawer.classList.remove("open");
  drawerBackdrop.classList.remove("open");
  document.body.classList.remove("menu-open");
  if (returnFocus) menuButton.focus();
}

function openDrawer() {
  if (!menuButton || !drawer || !drawerBackdrop) return;
  menuButton.setAttribute("aria-expanded", "true");
  menuButton.setAttribute("aria-label", "Close menu");
  drawer.inert = false;
  drawer.setAttribute("aria-hidden", "false");
  drawer.classList.add("open");
  drawerBackdrop.classList.add("open");
  document.body.classList.add("menu-open");
  drawerClose?.focus();
}

menuButton?.addEventListener("click", () => {
  if (menuButton.getAttribute("aria-expanded") === "true") closeDrawer(true);
  else openDrawer();
});
drawerClose?.addEventListener("click", () => closeDrawer(true));
drawerBackdrop?.addEventListener("click", () => closeDrawer(true));
drawer?.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => closeDrawer()));

document.addEventListener("keydown", (event) => {
  if (menuButton?.getAttribute("aria-expanded") !== "true" || !drawer) return;
  if (event.key === "Escape") {
    closeDrawer(true);
    return;
  }
  if (event.key !== "Tab") return;
  const controls = [...drawer.querySelectorAll(drawerFocusable)];
  const first = controls[0];
  const last = controls[controls.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last?.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first?.focus();
  }
});

document.querySelectorAll("[data-year]").forEach((year) => {
  year.textContent = new Date().getFullYear();
});

const revealItems = [...document.querySelectorAll(".service-card, .standards-list article, .process-grid article")];
if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) {
  revealItems.forEach((item) => item.classList.add("is-visible"));
} else {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.08, rootMargin: "0px 0px -4% 0px" });
  revealItems.forEach((item) => {
    item.classList.add("reveal-ready");
    revealObserver.observe(item);
  });
}
