/* Obsidian Capital — shared behaviour: nav, reveals, cursor, counters, parallax. */

(() => {
  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  /* ---- Nav scroll state ---- */
  const nav = document.querySelector(".nav");
  const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 24);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---- Mobile menu ---- */
  const toggle = document.querySelector(".nav-toggle");
  const links = document.querySelector(".nav-links");
  if (toggle && links) {
    toggle.addEventListener("click", () => {
      const open = links.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open);
      document.body.style.overflow = open ? "hidden" : "";
    });
    links.addEventListener("click", (e) => {
      if (e.target.closest("a")) {
        links.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
        document.body.style.overflow = "";
      }
    });
  }

  /* ---- Scroll reveals ----
     Exposed as window.observeReveals(root) so pages that inject content
     (job board, featured roles) can register new .reveal elements. */
  const io = reduceMotion
    ? null
    : new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("visible");
              io.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
      );

  window.observeReveals = (root = document) => {
    root.querySelectorAll(".reveal:not(.visible)").forEach((el) => {
      if (io) io.observe(el);
      else el.classList.add("visible");
    });
  };
  window.observeReveals();

  /* ---- Animated counters (elements with [data-count]) ---- */
  const counters = document.querySelectorAll("[data-count]");
  const runCounter = (el) => {
    const target = parseFloat(el.dataset.count);
    const decimals = (el.dataset.count.split(".")[1] || "").length;
    const prefix = el.dataset.prefix || "";
    const suffix = el.dataset.suffix || "";
    const fmt = (n) =>
      decimals
        ? n.toFixed(decimals)
        : Math.round(n).toLocaleString("en-US");
    if (reduceMotion) {
      el.textContent = prefix + fmt(target) + suffix;
      return;
    }
    const duration = 1800;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 4);
      el.textContent = prefix + fmt(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  if (counters.length) {
    const cio = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            runCounter(entry.target);
            cio.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );
    counters.forEach((el) => cio.observe(el));
  }

  /* ---- Hero parallax ---- */
  const heroBg = document.querySelector(".hero-bg");
  const heroFacets = document.querySelector(".hero-facets");
  if ((heroBg || heroFacets) && !reduceMotion) {
    window.addEventListener(
      "scroll",
      () => {
        const y = window.scrollY;
        if (y > window.innerHeight * 1.2) return;
        if (heroBg) heroBg.style.transform = `translateY(${y * 0.18}px)`;
        if (heroFacets)
          heroFacets.style.transform = `translateY(calc(-50% + ${y * 0.1}px)) rotate(${y * 0.012}deg)`;
      },
      { passive: true }
    );
  }

  /* ---- Custom cursor ---- */
  if (window.matchMedia("(hover: hover) and (pointer: fine)").matches && !reduceMotion) {
    const dot = document.createElement("div");
    dot.className = "cursor-dot";
    document.body.appendChild(dot);
    let shown = false;
    document.addEventListener("mousemove", (e) => {
      if (!shown) {
        dot.classList.add("on");
        shown = true;
      }
      dot.style.left = e.clientX + "px";
      dot.style.top = e.clientY + "px";
      const interactive = e.target.closest(
        "a, button, input, select, textarea, .job-row, .dept-card"
      );
      dot.classList.toggle("grow", Boolean(interactive));
    });
    document.addEventListener("mouseleave", () => {
      dot.classList.remove("on");
      shown = false;
    });
  }

  /* ---- Footer year ---- */
  const year = document.querySelector("[data-year]");
  if (year) year.textContent = new Date().getFullYear();
})();
