document.addEventListener("DOMContentLoaded", () => {
  initHeader();
  initHeroFixedScroll();
  initTimeline();
  initCarousels();
  initMemoryMap();
});

/* =========================
   HEADER
========================= */
function initHeader() {
  const header = document.getElementById("siteHeader");
  const menuToggle = document.getElementById("siteMenuToggle");
  const mobileMenu = document.getElementById("siteMobileMenu");

  if (!header) return;

  const onScroll = () => {
    if (window.scrollY > 30) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
  };

  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener("click", () => {
      mobileMenu.classList.toggle("open");
    });

    mobileMenu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        mobileMenu.classList.remove("open");
      });
    });
  }
}

/* =========================
   HERO SCROLL EFFECT
========================= */
function initHeroFixedScroll() {
  const hero = document.querySelector(".hero-spacer");
  const heroContent = document.getElementById("heroFixedContent");

  if (!hero || !heroContent) return;

  function updateHeroScroll() {
    const maxScroll = hero.offsetHeight;
    const scroll = Math.min(window.scrollY, maxScroll);
    const progress = Math.max(0, Math.min(1, scroll / maxScroll));

    const translateY = progress * 180;
    const scale = 1 - progress * 0.08;
    const opacity = 1 - progress * 0.92;

    heroContent.style.transform = `translateY(-${translateY}px) scale(${scale})`;
    heroContent.style.opacity = `${opacity}`;
  }

  updateHeroScroll();
  window.addEventListener("scroll", updateHeroScroll, { passive: true });
}

function initHeroCredits() {
  const hero = document.querySelector(".hero-sticky");
  const heroContent = document.querySelector(".hero-sticky-content");

  if (!hero || !heroContent) return;

  function updateHeroScroll() {
    const rect = hero.getBoundingClientRect();
    const heroHeight = hero.offsetHeight;
    const progress = Math.min(Math.max(-rect.top / heroHeight, 0), 1);

    const translateY = progress * 180;
    const opacity = 1 - progress * 0.9;
    const scale = 1 - progress * 0.08;

    heroContent.style.transform = `translateY(-${translateY}px) scale(${scale})`;
    heroContent.style.opacity = opacity;
  }

  updateHeroScroll();
  window.addEventListener("scroll", updateHeroScroll, { passive: true });
}

/* =========================
   TIMELINE
========================= */
function initTimeline() {
  const timelineHeader = document.querySelector(".timeline-header");
  const buttons = document.querySelectorAll(".timeline-stop");
  const panels = document.querySelectorAll(".timeline-panel");

  if (!buttons.length || !panels.length || !timelineHeader) return;

  updateTimelineProgress();

  buttons.forEach((button, index) => {
    button.addEventListener("click", () => {
      const target = button.dataset.target;
      const targetPanel = document.getElementById(target);

      buttons.forEach((btn) => btn.classList.remove("active"));
      panels.forEach((panel) => panel.classList.remove("active"));

      button.classList.add("active");

      if (targetPanel) {
        targetPanel.classList.add("active");
      }

      updateTimelineProgress(index);
      resetCarouselsInside(targetPanel);
    });
  });

  window.addEventListener("resize", () => {
    updateTimelineProgress();
  });

  function updateTimelineProgress(forcedIndex = null) {
    const activeIndex =
      forcedIndex !== null
        ? forcedIndex
        : Array.from(buttons).findIndex((btn) => btn.classList.contains("active"));

    if (activeIndex < 0) return;

    const percent =
      buttons.length === 1 ? 0 : (activeIndex / (buttons.length - 1)) * 96;

    timelineHeader.style.setProperty("--timeline-progress", `${percent}%`);
  }
}

function resetCarouselsInside(panel) {
  if (!panel) return;

  const carousels = panel.querySelectorAll("[data-carousel]");
  carousels.forEach((carousel) => {
    carousel.dataset.index = "0";
    updateCarousel(carousel);
  });
}

/* =========================
   CARRUSELES
========================= */
function initCarousels() {
  const carousels = document.querySelectorAll("[data-carousel]");
  if (!carousels.length) return;

  carousels.forEach((carousel) => {
    carousel.dataset.index = "0";

    const prevBtn = carousel.querySelector("[data-carousel-prev]");
    const nextBtn = carousel.querySelector("[data-carousel-next]");
    const slides = carousel.querySelectorAll(".carousel-slide");

    if (!slides.length) return;

    let autoPlay = null;
    const intervalMs = 4500;

    prevBtn?.addEventListener("click", () => {
      goToPrev(carousel, slides.length);
      restartAutoPlay();
    });

    nextBtn?.addEventListener("click", () => {
      goToNext(carousel, slides.length);
      restartAutoPlay();
    });

    carousel.addEventListener("mouseenter", stopAutoPlay);
    carousel.addEventListener("mouseleave", startAutoPlay);
    carousel.addEventListener("focusin", stopAutoPlay);
    carousel.addEventListener("focusout", startAutoPlay);

    if (slides.length > 1) {
      startAutoPlay();
    }

    updateCarousel(carousel);

    function startAutoPlay() {
      if (slides.length <= 1) return;
      stopAutoPlay();
      autoPlay = setInterval(() => {
        goToNext(carousel, slides.length);
      }, intervalMs);
    }

    function stopAutoPlay() {
      if (autoPlay) {
        clearInterval(autoPlay);
        autoPlay = null;
      }
    }

    function restartAutoPlay() {
      stopAutoPlay();
      startAutoPlay();
    }
  });
}

function goToPrev(carousel, totalSlides) {
  let index = parseInt(carousel.dataset.index || "0", 10);
  index = index <= 0 ? totalSlides - 1 : index - 1;
  carousel.dataset.index = String(index);
  updateCarousel(carousel);
}

function goToNext(carousel, totalSlides) {
  let index = parseInt(carousel.dataset.index || "0", 10);
  index = index >= totalSlides - 1 ? 0 : index + 1;
  carousel.dataset.index = String(index);
  updateCarousel(carousel);
}

function updateCarousel(carousel) {
  const track = carousel.querySelector(".carousel-track");
  const slides = carousel.querySelectorAll(".carousel-slide");
  const index = parseInt(carousel.dataset.index || "0", 10);

  if (!track || !slides.length) return;

  track.style.transform = `translateX(-${index * 100}%)`;

  slides.forEach((slide, i) => {
    slide.classList.toggle("active", i === index);
  });
}

/* =========================
   MAPA DE MEMORIA DINÁMICO
========================= */
function initMemoryMap() {
  const tabsContainer = document.getElementById("memoryTabs");
  const markerLayer = document.getElementById("markerLayer");
  const sectionIntro = document.getElementById("sectionIntro");
  const mapImage = document.getElementById("mapImage");
  const mapCanvas = document.getElementById("mapCanvas");

  const floatingCard = document.getElementById("floatingCard");
  const floatingCardClose = document.getElementById("floatingCardClose");
  const cardTitle = document.getElementById("cardTitle");
  const cardPlace = document.getElementById("cardPlace");
  const cardText = document.getElementById("cardText");
  const cardLink = document.getElementById("cardLink");
  const typingText = document.getElementById("typingText");

  if (
    !tabsContainer ||
    !markerLayer ||
    !sectionIntro ||
    !mapImage ||
    !mapCanvas ||
    !floatingCard ||
    !floatingCardClose ||
    !cardTitle ||
    !cardPlace ||
    !cardText ||
    !cardLink ||
    !typingText
  ) {
    return;
  }

  let sectionsData = [];
  let activeSectionIndex = 0;
  let activePointIndex = null;

  const typingPhrases = [
    "Sumapaz a través de la memoria...",
    "Sumapaz a través de los saberes...",
    "Sumapaz a través de la resistencia...",
    "Sumapaz a través del territorio..."
  ];

  let phraseIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let typingTimeout = null;

  function runTypingEffect() {
    if (!typingPhrases.length) return;

    const currentPhrase = typingPhrases[phraseIndex];

    if (!isDeleting) {
      typingText.textContent = currentPhrase.slice(0, charIndex + 1);
      charIndex++;

      if (charIndex === currentPhrase.length) {
        isDeleting = true;
        typingTimeout = setTimeout(runTypingEffect, 1400);
        return;
      }

      typingTimeout = setTimeout(runTypingEffect, 65);
    } else {
      typingText.textContent = currentPhrase.slice(0, charIndex - 1);
      charIndex--;

      if (charIndex === 0) {
        isDeleting = false;
        phraseIndex = (phraseIndex + 1) % typingPhrases.length;
        typingTimeout = setTimeout(runTypingEffect, 260);
        return;
      }

      typingTimeout = setTimeout(runTypingEffect, 32);
    }
  }

  async function loadPoints() {
    try {
      const response = await fetch("api/points.json");
      if (!response.ok) {
        throw new Error("No se pudo cargar points.json");
      }

      sectionsData = await response.json();

      if (!Array.isArray(sectionsData) || !sectionsData.length) {
        throw new Error("El archivo points.json no contiene datos válidos.");
      }

      renderApp();
      runTypingEffect();
    } catch (error) {
      console.error("Error cargando puntos del mapa:", error);
      sectionIntro.textContent =
        "No fue posible cargar la información del mapa. Ejecuta el proyecto con Live Server o revisa la ruta api/points.json.";
    }
  }

  function renderApp() {
    if (!sectionsData.length) return;

    renderTabs();
    updateSectionIntro();
    updateMapImage();
    renderMarkers();
    closeFloatingCard(false);
  }

  function renderTabs() {
    tabsContainer.innerHTML = "";
    tabsContainer.style.setProperty("--active-index", activeSectionIndex);

    sectionsData.forEach((section, index) => {
      const button = document.createElement("button");
      button.className = `map-tab ${index === activeSectionIndex ? "active" : ""}`;
      button.type = "button";
      button.textContent = section.label || `Sección ${index + 1}`;

      button.addEventListener("click", () => {
        activeSectionIndex = index;
        activePointIndex = null;
        renderApp();
      });

      tabsContainer.appendChild(button);
    });
  }

  function updateSectionIntro() {
    const currentSection = sectionsData[activeSectionIndex];
    sectionIntro.textContent = currentSection?.intro || "";
  }

  function updateMapImage() {
    const currentSection = sectionsData[activeSectionIndex];

    if (currentSection?.mapImage) {
      mapImage.src = currentSection.mapImage;
      mapImage.alt = currentSection.label || "Mapa interactivo";
    }
  }

  function renderMarkers() {
    markerLayer.innerHTML = "";
    const currentSection = sectionsData[activeSectionIndex];

    if (!currentSection?.points || !Array.isArray(currentSection.points)) return;

    currentSection.points.forEach((point, index) => {
      const marker = document.createElement("button");
      marker.className = `map-marker ${index === activePointIndex ? "active" : ""}`;
      marker.type = "button";
      marker.style.left = `${point.x}%`;
      marker.style.top = `${point.y}%`;
      marker.setAttribute("aria-label", point.title || `Punto ${index + 1}`);
      marker.title = point.title || `Punto ${index + 1}`;

      marker.innerHTML = `
        <span class="map-marker__dot"></span>
        <span class="map-marker__ring"></span>
        <span class="map-marker__ring delay-1"></span>
        <span class="map-marker__ring delay-2"></span>
      `;

      marker.addEventListener("click", (event) => {
        event.stopPropagation();
        activePointIndex = index;
        renderMarkers();
        openFloatingCard(point);
      });

      markerLayer.appendChild(marker);
    });
  }

  function openFloatingCard(point) {
    cardTitle.textContent = point.title || "";
    cardPlace.textContent = point.place || "";
    cardText.textContent = point.description || "";

    if (point.link && point.link.trim() !== "") {
      cardLink.href = point.link;
      cardLink.style.display = "inline-block";
    } else {
      cardLink.href = "#";
      cardLink.style.display = "none";
    }

    const defaultPosition = {
      left: 62,
      top: 16
    };

    const cardPosition = point.cardPosition || defaultPosition;

    floatingCard.style.left = `${cardPosition.left}%`;
    floatingCard.style.top = `${cardPosition.top}%`;
    floatingCard.classList.remove("hidden");

    requestAnimationFrame(() => {
      adjustCardIfOverflow();
    });
  }

  function closeFloatingCard(resetMarker = true) {
    floatingCard.classList.add("hidden");

    if (resetMarker) {
      activePointIndex = null;
      renderMarkers();
    }
  }

  function adjustCardIfOverflow() {
    if (floatingCard.classList.contains("hidden")) return;

    const canvasRect = mapCanvas.getBoundingClientRect();
    const cardRect = floatingCard.getBoundingClientRect();

    let currentLeft = parseFloat(floatingCard.style.left) || 0;
    let currentTop = parseFloat(floatingCard.style.top) || 0;

    if (cardRect.right > canvasRect.right) {
      currentLeft -= 18;
    }

    if (cardRect.bottom > canvasRect.bottom) {
      currentTop -= 18;
    }

    if (cardRect.left < canvasRect.left) {
      currentLeft += 12;
    }

    if (cardRect.top < canvasRect.top) {
      currentTop += 12;
    }

    floatingCard.style.left = `${currentLeft}%`;
    floatingCard.style.top = `${currentTop}%`;
  }

  floatingCardClose.addEventListener("click", (event) => {
    event.stopPropagation();
    closeFloatingCard();
  });

  mapCanvas.addEventListener("click", (event) => {
    if (
      !event.target.closest(".map-marker") &&
      !event.target.closest(".map-point-card")
    ) {
      closeFloatingCard();
    }
  });

  window.addEventListener("resize", () => {
    if (!floatingCard.classList.contains("hidden")) {
      adjustCardIfOverflow();
    }
  });

  loadPoints();
}