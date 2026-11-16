(() => {
  const STORAGE_KEY = "wondoo-cv-theme";
  const root = document.documentElement;
  const themeToggleBtn = document.getElementById("theme-toggle");
  const themeLabel = document.getElementById("theme-toggle-label");
  const themeMeta = document.querySelector('meta[name="theme-color"]');
  const printBtn = document.getElementById("print-cv-btn");
  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

  function getSavedTheme() {
    try {
      const value = localStorage.getItem(STORAGE_KEY);
      return value === "light" || value === "dark" ? value : null;
    } catch {
      return null;
    }
  }

  function saveTheme(theme) {
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // Ignore storage errors in restricted contexts.
    }
  }

  function resolveTheme() {
    return getSavedTheme() || (mediaQuery.matches ? "dark" : "light");
  }

  function updateThemeUI(theme) {
    const isDark = theme === "dark";
    root.dataset.theme = theme;

    if (themeMeta) {
      themeMeta.setAttribute("content", isDark ? "#0c0f16" : "#fafaf8");
    }

    if (themeToggleBtn) {
      themeToggleBtn.setAttribute("aria-pressed", String(isDark));
      themeToggleBtn.setAttribute(
        "aria-label",
        isDark ? "Switch to light mode" : "Switch to dark mode"
      );
      themeToggleBtn.setAttribute(
        "title",
        isDark ? "Switch to light mode" : "Switch to dark mode"
      );
    }

    if (themeLabel) {
      themeLabel.textContent = isDark ? "Light" : "Dark";
    }
  }

  updateThemeUI(resolveTheme());


  if (themeToggleBtn) {
    themeToggleBtn.addEventListener("click", () => {
      const current = root.dataset.theme === "dark" ? "dark" : "light";
      const next = current === "dark" ? "light" : "dark";
      saveTheme(next);
      updateThemeUI(next);
    });
  }

  mediaQuery.addEventListener("change", (event) => {
    if (!getSavedTheme()) {
      updateThemeUI(event.matches ? "dark" : "light");
    }
  });

  // Publication category filtering
  const filterButtons = document.querySelectorAll(".filter-tab[data-filter]");
  const pubCards = document.querySelectorAll(".pub-card[data-category]");
  const filterStatus = document.getElementById("pub-filter-status");

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const filter = button.dataset.filter;
      let visibleCount = 0;

      filterButtons.forEach((btn) => {
        btn.setAttribute("aria-pressed", String(btn === button));
      });

      pubCards.forEach((card) => {
        const match = filter === "all" || card.dataset.category === filter;
        card.hidden = !match;
        if (match) visibleCount += 1;
      });

      if (filterStatus) {
        filterStatus.textContent = `Showing ${visibleCount} item${visibleCount === 1 ? "" : "s"}`;
      }
    });
  });

  // Print CV button + auto-expand contributions when printing
  const contribDetails = document.querySelectorAll(".pub-contrib");
  let priorOpenStates = [];

  window.addEventListener("beforeprint", () => {
    priorOpenStates = Array.from(contribDetails).map((el) => el.open);
    contribDetails.forEach((el) => {
      el.open = true;
    });
  });

  window.addEventListener("afterprint", () => {
    contribDetails.forEach((el, idx) => {
      if (typeof priorOpenStates[idx] === "boolean") {
        el.open = priorOpenStates[idx];
      }
    });
  });

  if (printBtn) {
    printBtn.addEventListener("click", () => {
      window.print();
    });
  }
})();