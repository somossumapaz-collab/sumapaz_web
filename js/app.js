document.addEventListener("DOMContentLoaded", () => {
  const panels = document.querySelectorAll(".panel");
  const menuToggle = document.getElementById("menuToggle");
  const sideMenu = document.getElementById("sideMenu");

  panels.forEach((panel) => {
    panel.addEventListener("mouseenter", () => {
      panels.forEach((p) => p.classList.remove("active"));
      panel.classList.add("active");
    });

    panel.addEventListener("mouseleave", () => {
      panel.classList.remove("active");
    });
  });

  panels.forEach((panel) => {
    panel.addEventListener("click", function (e) {
      const href = this.getAttribute("href");

      if (!href || href.startsWith("http")) {
        return;
      }

      e.preventDefault();
      document.body.classList.add("fade-out");

      setTimeout(() => {
        window.location.href = href;
      }, 250);
    });
  });

  menuToggle?.addEventListener("click", (event) => {
    event.stopPropagation();
    menuToggle.classList.toggle("active");
    sideMenu?.classList.toggle("open");
  });

  sideMenu?.addEventListener("click", (event) => {
    event.stopPropagation();
  });

  document.addEventListener("click", () => {
    sideMenu?.classList.remove("open");
    menuToggle?.classList.remove("active");
  });
});