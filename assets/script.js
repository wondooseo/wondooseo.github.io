(() => {
  const STORAGE_KEY = "wondoo-site-theme";
  const root = document.documentElement;
  const themeToggleBtn = document.getElementById("theme-toggle");
  const themeLabel = document.getElementById("theme-toggle-label");
  const themeMeta = document.querySelector('meta[name="theme-color"]');
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
      themeMeta.setAttribute("content", isDark ? "#0d1016" : "#f6f7f9");
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

  // Mobile navigation drawer
  const mobileBtn = document.getElementById("mobile-menu-btn");
  const mobileDrawer = document.getElementById("mobile-drawer");
  if (mobileBtn && mobileDrawer) {
    mobileBtn.addEventListener("click", () => {
      const expanded = mobileBtn.getAttribute("aria-expanded") === "true";
      mobileBtn.setAttribute("aria-expanded", String(!expanded));
      mobileDrawer.classList.toggle("is-open", !expanded);
    });
  }

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
})();