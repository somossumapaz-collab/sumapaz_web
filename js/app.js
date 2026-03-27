document.addEventListener("DOMContentLoaded", () => {
  const panels = document.querySelectorAll(".panel");
  const menuToggle = document.getElementById("menuToggle");
  const sideMenu = document.getElementById("sideMenu");

  const resetHomeState = () => {
    panels.forEach((panel) => {
      panel.classList.remove("active");
      panel.blur();
    });

    if (sideMenu) sideMenu.classList.remove("open");
    if (menuToggle) menuToggle.classList.remove("active");
  };

  // Estado limpio al cargar
  resetHomeState();

  // Hover por panel
  panels.forEach((panel) => {
    panel.addEventListener("mouseenter", () => {
      panels.forEach((p) => p.classList.remove("active"));
      panel.classList.add("active");
    });

    panel.addEventListener("mouseleave", () => {
      panel.classList.remove("active");
    });
  });

  // Menú lateral
  if (menuToggle && sideMenu) {
    menuToggle.addEventListener("click", (event) => {
      event.stopPropagation();
      menuToggle.classList.toggle("active");
      sideMenu.classList.toggle("open");
    });

    sideMenu.addEventListener("click", (event) => {
      event.stopPropagation();
    });

    document.addEventListener("click", () => {
      sideMenu.classList.remove("open");
      menuToggle.classList.remove("active");
    });
  }
});

// Corrige Firefox al volver con "Atrás"
window.addEventListener("pageshow", () => {
  const panels = document.querySelectorAll(".panel");
  const menuToggle = document.getElementById("menuToggle");
  const sideMenu = document.getElementById("sideMenu");

  panels.forEach((panel) => {
    panel.classList.remove("active");
    panel.blur();
  });

  if (sideMenu) sideMenu.classList.remove("open");
  if (menuToggle) menuToggle.classList.remove("active");
});