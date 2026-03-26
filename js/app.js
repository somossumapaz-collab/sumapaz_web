document.addEventListener("DOMContentLoaded", () => {
  const panels = document.querySelectorAll(".panel");

  panels.forEach((panel) => {
    panel.addEventListener("mouseenter", () => {
      panels.forEach((p) => p.classList.remove("active"));
      panel.classList.add("active");
    });
  });

  document.querySelector(".home-split")?.addEventListener("mouseleave", () => {
    panels.forEach((p) => p.classList.remove("active"));
  });
});