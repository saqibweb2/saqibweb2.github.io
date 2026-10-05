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

function createProjectArt(project) {
  const art = document.createElement("div");
  art.className = "project-art";
  art.dataset.projectArt = project.id;
  art.setAttribute("aria-hidden", "true");

  const shape = document.createElement("span");
  shape.className = "art-shape";
  const mark = document.createElement("span");
  mark.className = "art-mark";
  const eyebrow = document.createElement("small");
  eyebrow.textContent = project.category || "SELECTED PROJECT";
  const initials = document.createElement("strong");
  const titleWords = project.title.split(/\s+/);
  initials.textContent = titleWords.length > 1
    ? titleWords.map((part) => part[0]).slice(0, 2).join("").toUpperCase()
    : project.title.slice(0, 2).toUpperCase();
  const label = document.createElement("em");
  label.textContent = project.title;
  mark.append(eyebrow, initials, label);
  art.append(shape, mark);
  return art;
}

function makeProjectCard(project) {
  const card = document.createElement("article");
  card.className = "project-card reveal-item";

  const visual = document.createElement("div");
  visual.className = "project-visual";
  if (project.image && !project.is_private) {
    const image = document.createElement("img");
    image.src = project.image;
    image.alt = `${project.title} — ${project.category || "project"}`;
    image.loading = "lazy";
    image.decoding = "async";
    image.width = 900;
    image.height = 780;
    image.addEventListener("error", () => image.replaceWith(createProjectArt(project)), { once: true });
    visual.append(image);
  } else {
    visual.append(createProjectArt(project));
  }

  const copy = document.createElement("div");
  copy.className = "project-card-copy";
  const eyebrow = document.createElement("p");
  eyebrow.className = "project-category-label-text";
  eyebrow.textContent = project.category || "Selected work";
  const title = document.createElement("h4");
  title.textContent = project.title;
  const description = document.createElement("p");
  description.className = "project-description";
  description.textContent = project.description;
  copy.append(eyebrow, title, description);

  if (project.is_private) {
    const privacyNote = document.createElement("p");
    privacyNote.className = "project-private-note";
    privacyNote.textContent = "Private client project · selected details available on request";
    copy.append(privacyNote);
  }

  const technologyList = document.createElement("div");
  technologyList.className = "project-tech";
  (project.technologies || []).forEach((technology) => {
    const chip = document.createElement("span");
    chip.textContent = technology;
    technologyList.append(chip);
  });
  copy.append(technologyList);

  if (project.url && !project.is_private) {
    try {
      const destination = new URL(project.url);
      if (destination.protocol === "https:" || destination.protocol === "http:") {
        const visit = document.createElement("a");
        visit.className = "project-visit";
        visit.href = destination.href;
        visit.target = "_blank";
        visit.rel = "noopener noreferrer";
        visit.append(document.createTextNode("Visit project"));
        const arrow = document.createElement("span");
        arrow.setAttribute("aria-hidden", "true");
        arrow.textContent = "↗";
        visit.append(arrow);
        copy.append(visit);
      }
    } catch {
      // Ignore malformed external links while keeping project information visible.
    }
  }

  card.append(visual, copy);
  return card;
}

function setupLoadMore(container, row, visibleCount = 4) {
  const cards = [...container.children].filter((child) => child.matches(".project-card"));
  cards.forEach((card, index) => {
    if (index >= visibleCount) card.hidden = true;
  });
  if (cards.length <= visibleCount) return;
  row.hidden = false;
  const button = row.querySelector("button");
  const moreLabel = button.dataset.moreLabel || "See more projects";
  const lessLabel = button.dataset.lessLabel || "Show fewer projects";
  button.addEventListener("click", () => {
    const expanded = button.getAttribute("aria-expanded") !== "true";
    cards.forEach((card, index) => {
      card.hidden = !expanded && index >= visibleCount;
    });
    button.setAttribute("aria-expanded", String(expanded));
    button.innerHTML = expanded
      ? `${lessLabel} <span aria-hidden="true">↑</span>`
      : `${moreLabel} <span aria-hidden="true">↓</span>`;
  });
}

function revealOnScroll() {
  const targets = [...document.querySelectorAll(".reveal-item")].filter((item) => !item.hidden);
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) {
    targets.forEach((item) => item.classList.add("is-visible"));
    return;
  }
  const observer = new IntersectionObserver((entries, activeObserver) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      activeObserver.unobserve(entry.target);
    });
  }, { threshold: 0.08, rootMargin: "0px 0px -4% 0px" });
  targets.forEach((item) => {
    item.classList.add("reveal-ready");
    observer.observe(item);
  });
}

async function loadProjects() {
  try {
    let data;
    try {
      const response = await fetch(new URL("public.json", document.baseURI));
      if (!response.ok) throw new Error(`Project data request failed (${response.status})`);
      data = await response.json();
    } catch (fetchError) {
      const embeddedData = document.querySelector("#project-data");
      if (!embeddedData) throw fetchError;
      data = JSON.parse(embeddedData.textContent);
    }
    const projects = Array.isArray(data.portfolio?.projects)
      ? data.portfolio.projects
      : Array.isArray(data.projects)
        ? data.projects
        : [];
    const usesWordPress = (project) => (project.technologies || []).some((tech) => ["wordpress", "woocommerce"].includes(tech.toLowerCase()));
    const groups = {
      laravel: projects.filter((project) => !usesWordPress(project)),
      wordpress: projects.filter(usesWordPress)
    };

    const laravelGrid = document.querySelector("#laravel-grid");
    const wordpressGrid = document.querySelector("#wordpress-grid");
    laravelGrid.replaceChildren(...groups.laravel.map(makeProjectCard));
    wordpressGrid.replaceChildren(...groups.wordpress.map(makeProjectCard));
    document.querySelector("#laravel-count").textContent = String(groups.laravel.length).padStart(2, "0");
    document.querySelector("#wordpress-count").textContent = String(groups.wordpress.length).padStart(2, "0");
    setupLoadMore(laravelGrid, document.querySelector("#laravel-more-row"), 4);
    setupLoadMore(wordpressGrid, document.querySelector("#wordpress-more-row"), 4);
    revealOnScroll();
  } catch (error) {
    console.error("Could not load portfolio projects:", error);
    document.querySelectorAll(".projects-loading").forEach((placeholder) => {
      placeholder.className = "projects-error";
      placeholder.textContent = "Projects could not be loaded right now. Please check back soon.";
    });
  }
}

loadProjects();
