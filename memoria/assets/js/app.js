document.addEventListener("DOMContentLoaded", () => {
  initHeader();
  initHeroFixedScroll();
  initTimeline();
  initCarousels();
  initMarqueeCarousels();
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
    header.classList.toggle("scrolled", window.scrollY > 30);
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

  const updateHeroScroll = () => {
    const maxScroll = hero.offsetHeight;
    const scroll = Math.min(window.scrollY, maxScroll);
    const progress = Math.max(0, Math.min(1, scroll / maxScroll));

    const translateY = progress * 180;
    const scale = 1 - progress * 0.08;
    const opacity = 1 - progress * 0.92;

    heroContent.style.transform = `translateY(-${translateY}px) scale(${scale})`;
    heroContent.style.opacity = `${opacity}`;
  };

  updateHeroScroll();
  window.addEventListener("scroll", updateHeroScroll, { passive: true });
}

/* =========================
   TIMELINE
========================= */
function initTimeline() {
  const timelineHeader = document.querySelector(".timeline-header");
  const buttons = Array.from(document.querySelectorAll(".timeline-stop"));
  const panels = Array.from(document.querySelectorAll(".timeline-panel"));

  if (!timelineHeader || !buttons.length || !panels.length) return;

  const updateTimelineProgress = (forcedIndex = null) => {
    const activeIndex =
      forcedIndex !== null
        ? forcedIndex
        : buttons.findIndex((btn) => btn.classList.contains("active"));

    if (activeIndex < 0) return;

    const percent =
      buttons.length === 1 ? 0 : (activeIndex / (buttons.length - 1)) * 96;

    timelineHeader.style.setProperty("--timeline-progress", `${percent}%`);
  };

  buttons.forEach((button, index) => {
    button.addEventListener("click", () => {
      const targetId = button.dataset.target;
      const targetPanel = document.getElementById(targetId);

      buttons.forEach((btn) => btn.classList.remove("active"));
      panels.forEach((panel) => panel.classList.remove("active"));

      button.classList.add("active");

      if (targetPanel) {
        targetPanel.classList.add("active");
        resetCarouselsInside(targetPanel);
        restartMarqueesInside(targetPanel);
      }

      updateTimelineProgress(index);
    });
  });

  window.addEventListener("resize", () => updateTimelineProgress());
  updateTimelineProgress();
}

function resetCarouselsInside(panel) {
  if (!panel) return;

  const carousels = panel.querySelectorAll("[data-carousel]");
  carousels.forEach((carousel) => {
    carousel.dataset.index = "0";
    updateCarousel(carousel);
  });
}

function restartMarqueesInside(panel) {
  if (!panel) return;

  const tracks = panel.querySelectorAll(".media-carousel-marquee .marquee-track");
  tracks.forEach((track) => {
    track.style.animation = "none";
    void track.offsetWidth;
    track.style.animation = "";
  });
}

/* =========================
   CARRUSEL NORMAL
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

    const startAutoPlay = () => {
      if (slides.length <= 1) return;
      stopAutoPlay();
      autoPlay = setInterval(() => {
        goToNext(carousel, slides.length);
      }, intervalMs);
    };

    const stopAutoPlay = () => {
      if (autoPlay) {
        clearInterval(autoPlay);
        autoPlay = null;
      }
    };

    const restartAutoPlay = () => {
      stopAutoPlay();
      startAutoPlay();
    };

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
   CARRUSEL INFINITO / MARQUEE
========================= */
function initMarqueeCarousels() {
  const marquees = Array.from(document.querySelectorAll("[data-carousel-marquee]"));
  if (!marquees.length) return;

  const setupMarquee = (marquee) => {
    const viewport = marquee.querySelector(".carousel-viewport");
    const track = marquee.querySelector(".marquee-track");
    if (!viewport || !track) return;

    if (!track.dataset.originalMarkup) {
      track.dataset.originalMarkup = track.innerHTML;
    }

    // Restaurar contenido original antes de recalcular
    track.innerHTML = track.dataset.originalMarkup;
    track.style.animation = "none";
    track.style.removeProperty("--marquee-distance");
    track.style.removeProperty("--marquee-duration");

    const originalSlides = Array.from(track.children);
    if (!originalSlides.length) return;

    const gap = parseFloat(getComputedStyle(track).gap || "0");

    const measureOriginalWidth = () => {
      const slides = Array.from(track.children).slice(0, originalSlides.length);
      return slides.reduce((total, slide, index) => {
        const width = slide.getBoundingClientRect().width;
        return total + width + (index < slides.length - 1 ? gap : 0);
      }, 0);
    };

    const finalize = () => {
      const viewportWidth = viewport.getBoundingClientRect().width;
      let originalWidth = measureOriginalWidth();

      // Si todavía no hay medidas válidas, reintentar un frame después
      if (!viewportWidth || !originalWidth) {
        requestAnimationFrame(() => setupMarquee(marquee));
        return;
      }

      // Duplicar suficientes veces para evitar huecos
      while (track.scrollWidth < viewportWidth + originalWidth * 2) {
        originalSlides.forEach((slide) => {
          const clone = slide.cloneNode(true);
          clone.setAttribute("aria-hidden", "true");
          track.appendChild(clone);
        });
      }

      originalWidth = measureOriginalWidth();

      track.style.setProperty("--marquee-distance", `${originalWidth + gap}px`);
      track.style.setProperty("--marquee-duration", `${Math.max(20, originalWidth / 30)}s`);

      // Reiniciar animación
      requestAnimationFrame(() => {
        track.style.animation = "";
      });
    };

    const images = Array.from(track.querySelectorAll("img"));
    if (!images.length) {
      finalize();
      return;
    }

    let loaded = 0;
    const done = () => {
      loaded += 1;
      if (loaded === images.length) {
        finalize();
      }
    };

    images.forEach((img) => {
      if (img.complete) {
        done();
      } else {
        img.addEventListener("load", done, { once: true });
        img.addEventListener("error", done, { once: true });
      }
    });
  };

  const initAll = () => {
    marquees.forEach(setupMarquee);
  };

  initAll();

  let resizeTimer = null;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(initAll, 180);
  });

  // Recalcular cuando cambias de panel del timeline
  document.querySelectorAll(".timeline-stop").forEach((button) => {
    button.addEventListener("click", () => {
      setTimeout(initAll, 120);
    });
  });
}

/* =========================
   MAPA DINÁMICO
========================= */
async function initMemoryMap() {
  const mapSection = document.getElementById("mapa");
  if (!mapSection) return;

  const tabs = Array.from(document.querySelectorAll(".map-tab"));
  const mapFrame = document.getElementById("memoryMap");
  const mapImage = document.getElementById("mapImage");
  const markerLayer = document.getElementById("markerLayer");
  const introWrap = document.getElementById("mapIntro");
  const introText = introWrap?.querySelector("p");
  const typingText = document.getElementById("mapTypingText");
  const transitionOverlay = document.getElementById("mapTransitionOverlay");

  const card = document.getElementById("mapPointCard");
  const cardTitle = document.getElementById("mapPointTitle");
  const cardPlace = document.getElementById("mapPointPlace");
  const cardText = document.getElementById("mapPointText");
  const cardLink = document.getElementById("mapPointLink");

  if (
    !tabs.length ||
    !mapFrame ||
    !mapImage ||
    !markerLayer ||
    !introText ||
    !typingText ||
    !transitionOverlay ||
    !card ||
    !cardTitle ||
    !cardPlace ||
    !cardText ||
    !cardLink
  ) {
    return;
  }

  let mapData = [];
  let activeMapId = "hitos-historicos";
  let activeMarker = null;
  let activePoint = null;
  let typingTimer = null;
  let hoverCloseTimer = null;

  const typingPhrases = {
    "hitos-historicos": "Sumapaz a través de los hitos históricos",
    "practicas-ancestrales": "Sumapaz a través de las prácticas ancestrales",
    "defensa-del-territorio": "Sumapaz a través de la defensa del territorio",
    "conflicto-armado": "Sumapaz a través del conflicto armado"
  };

  const mapImageOverrides = {
    "hitos-historicos": "assets/img/MAPA.png",
    "practicas-ancestrales": "assets/img/MAPA.png",
    "defensa-del-territorio": "assets/img/MAPA.png",
    "conflicto-armado": "assets/img/MAPA.png"
  };

  try {
    const response = await fetch("assets/data/points.json", { cache: "no-store" });

    if (!response.ok) {
      throw new Error(`No se pudo cargar points.json (${response.status})`);
    }

    mapData = await response.json();
  } catch (error) {
    console.error("Error cargando points.json:", error);
    introText.textContent = "No fue posible cargar la información del mapa.";
    return;
  }

  function getMapById(id) {
    return mapData.find((item) => item.id === id);
  }

  function clearTypingTimer() {
    if (typingTimer) {
      clearTimeout(typingTimer);
      typingTimer = null;
    }
  }

  function setTyping(text) {
    clearTypingTimer();
    typingText.textContent = "";

    let index = 0;

    const write = () => {
      typingText.textContent = text.slice(0, index);
      index += 1;

      if (index <= text.length) {
        typingTimer = setTimeout(write, 38);
      }
    };

    write();
  }

  function clearHoverCloseTimer() {
    if (hoverCloseTimer) {
      clearTimeout(hoverCloseTimer);
      hoverCloseTimer = null;
    }
  }

  function closeCard() {
    clearHoverCloseTimer();

    card.classList.add("hidden");
    card.style.left = "";
    card.style.top = "";

    if (activeMarker) {
      activeMarker.classList.remove("active");
      activeMarker = null;
    }

    activePoint = null;
  }

  function scheduleCloseCard() {
    clearHoverCloseTimer();
    hoverCloseTimer = setTimeout(() => {
      closeCard();
    }, 90);
  }

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function placeCardNearMarker(marker) {
    const frameRect = mapFrame.getBoundingClientRect();
    const markerRect = marker.getBoundingClientRect();

    const cardWidth = card.offsetWidth || 340;
    const cardHeight = card.offsetHeight || 220;
    const gap = 18;
    const padding = 12;

    let left = markerRect.left - frameRect.left + gap;
    let top =
      markerRect.top -
      frameRect.top -
      cardHeight / 2 +
      markerRect.height / 2;

    if (left + cardWidth > frameRect.width - padding) {
      left = markerRect.left - frameRect.left - cardWidth - gap;
    }

    if (left < padding) {
      left = padding;
    }

    top = clamp(top, padding, frameRect.height - cardHeight - padding);

    card.style.left = `${left}px`;
    card.style.top = `${top}px`;
  }

  function openCard(point, marker) {
    clearHoverCloseTimer();
    activePoint = point;

    if (activeMarker && activeMarker !== marker) {
      activeMarker.classList.remove("active");
    }

    activeMarker = marker;
    activeMarker.classList.add("active");

    cardTitle.textContent = point.title || "";
    cardPlace.textContent = point.place || "";
    cardText.textContent = point.description || "";

    if (point.link) {
      cardLink.href = point.link;
      cardLink.classList.remove("hidden");
    } else {
      cardLink.href = "#";
      cardLink.classList.add("hidden");
    }

    card.classList.remove("hidden");
    placeCardNearMarker(marker);
  }

  function createMarker(point, index) {
    const marker = document.createElement("button");
    marker.type = "button";
    marker.className = "map-marker";
    marker.style.left = `${point.x}%`;
    marker.style.top = `${point.y}%`;
    marker.setAttribute("aria-label", point.title || `Punto ${index + 1}`);

    marker.innerHTML = `
      <span class="map-marker__ring"></span>
      <span class="map-marker__ring delay-1"></span>
      <span class="map-marker__ring delay-2"></span>
      <span class="map-marker__dot"></span>
    `;

    marker.addEventListener("mouseenter", () => {
      openCard(point, marker);
    });

    marker.addEventListener("mouseleave", () => {
      scheduleCloseCard();
    });

    marker.addEventListener("focus", () => {
      openCard(point, marker);
    });

    marker.addEventListener("blur", () => {
      scheduleCloseCard();
    });

    return marker;
  }

  function renderMarkers(points) {
    markerLayer.innerHTML = "";

    (points || []).forEach((point, index) => {
      const marker = createMarker(point, index);
      markerLayer.appendChild(marker);
    });
  }

  function switchMapImage(newSrc, newAlt, points) {
    mapFrame.classList.add("is-switching");
    closeCard();

    const preload = new Image();
    preload.src = newSrc;

    preload.onload = () => {
      setTimeout(() => {
        mapImage.src = newSrc;
        mapImage.alt = newAlt || "Mapa de memoria";
        renderMarkers(points);

        requestAnimationFrame(() => {
          mapFrame.classList.remove("is-switching");
        });
      }, 180);
    };

    preload.onerror = () => {
      mapImage.src = newSrc;
      mapImage.alt = newAlt || "Mapa de memoria";
      renderMarkers(points);
      mapFrame.classList.remove("is-switching");
    };
  }

  function renderMap(id) {
    const mapItem = getMapById(id);
    if (!mapItem) return;

    activeMapId = id;

    tabs.forEach((tab) => {
      tab.classList.toggle("active", tab.dataset.map === id);
    });

    introText.textContent = mapItem.intro || "";
    setTyping(typingPhrases[id] || "Sumapaz a través de la memoria");

    const resolvedImage = mapImageOverrides[id] || mapItem.mapImage || "";
    switchMapImage(
      resolvedImage,
      mapItem.label || "Mapa de memoria",
      mapItem.points || []
    );
  }

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const id = tab.dataset.map;
      if (!id || id === activeMapId) return;
      renderMap(id);
    });
  });

  card.addEventListener("mouseenter", () => {
    clearHoverCloseTimer();
  });

  card.addEventListener("mouseleave", () => {
    scheduleCloseCard();
  });

  window.addEventListener("resize", () => {
    if (activeMarker && activePoint && !card.classList.contains("hidden")) {
      placeCardNearMarker(activeMarker);
    }
  });

  renderMap(activeMapId);
}