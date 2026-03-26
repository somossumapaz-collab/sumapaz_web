document.addEventListener("DOMContentLoaded", () => {
  const panels = document.querySelectorAll(".panel");
  const wrapper = document.querySelector(".home-split");

  panels.forEach((panel) => {
    panel.addEventListener("mouseenter", () => {
      panels.forEach((p) => p.classList.remove("active"));
      panel.classList.add("active");
    });
  });

  wrapper?.addEventListener("mouseleave", () => {
    panels.forEach((p) => p.classList.remove("active"));
  });
});