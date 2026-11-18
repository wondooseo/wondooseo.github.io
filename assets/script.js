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

  // Desktop dropdown submenu toggle & outside-click/Escape dismissal
  const desktopSubmenuItems = document.querySelectorAll(".nav-item.has-submenu");
  desktopSubmenuItems.forEach((item) => {
    const btn = item.querySelector(".nav-submenu-btn");
    if (!btn) return;

    function setOpen(open) {
      item.classList.toggle("is-open", open);
      if (open) {
        item.classList.remove("is-dismissed");
      }
      btn.setAttribute("aria-expanded", String(open));
    }

    btn.addEventListener("click", (event) => {
      event.stopPropagation();
      const next = !item.classList.contains("is-open");
      setOpen(next);
      if (!next) {
        item.classList.add("is-dismissed");
      }
    });

    item.addEventListener("mouseleave", () => {
      item.classList.remove("is-dismissed");
    });

    item.addEventListener("focusout", (event) => {
      if (!item.contains(event.relatedTarget)) {
        item.classList.remove("is-dismissed");
      }
    });

    document.addEventListener("click", (event) => {
      if (!item.contains(event.target)) {
        setOpen(false);
        item.classList.remove("is-dismissed");
      }
    });

    item.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        setOpen(false);
        item.classList.add("is-dismissed");
        btn.focus();
      }
    });
  });

  // Mobile navigation drawer (auto-closes when expanding past mobile breakpoint)
  const mobileBtn = document.getElementById("mobile-menu-btn");
  const mobileDrawer = document.getElementById("mobile-drawer");
  if (mobileBtn && mobileDrawer) {
    function setMobileDrawerOpen(open) {
      mobileBtn.setAttribute("aria-expanded", String(open));
      mobileDrawer.classList.toggle("is-open", open);
    }

    mobileBtn.addEventListener("click", () => {
      const expanded = mobileBtn.getAttribute("aria-expanded") === "true";
      setMobileDrawerOpen(!expanded);
    });

    const mobileBreakpoint = window.matchMedia("(max-width: 860px)");
    mobileBreakpoint.addEventListener("change", (event) => {
      if (!event.matches) {
        setMobileDrawerOpen(false);
      }
    });
  }

  // Shared submenu accordion toggles (mobile drawer & desktop sidebar)
  const submenuToggles = document.querySelectorAll(".mobile-submenu-toggle, .category-submenu-toggle");
  submenuToggles.forEach((toggleBtn) => {
    const targetId = toggleBtn.getAttribute("aria-controls");
    const targetPanel = targetId ? document.getElementById(targetId) : null;
    if (!targetPanel) return;

    toggleBtn.addEventListener("click", () => {
      const expanded = toggleBtn.getAttribute("aria-expanded") === "true";
      toggleBtn.setAttribute("aria-expanded", String(!expanded));
      targetPanel.classList.toggle("is-open", !expanded);
    });
  });

  // Interactive section tabs (e.g., ABOUT ME) with keyboard navigation & hash sync
  const sectionTabs = Array.from(document.querySelectorAll('[role="tab"][data-tab]'));
  const sectionPanels = Array.from(document.querySelectorAll('[role="tabpanel"]'));

  if (sectionTabs.length > 0 && sectionPanels.length > 0) {
    function activateTab(tab, { focus = false, updateHash = false } = {}) {
      const targetId = tab.dataset.tab;

      sectionTabs.forEach((btn) => {
        const isSelected = btn === tab;
        btn.setAttribute("aria-selected", String(isSelected));
        btn.setAttribute("tabindex", isSelected ? "0" : "-1");
      });

      sectionPanels.forEach((panel) => {
        panel.hidden = panel.id !== targetId;
      });

      if (focus) {
        tab.focus();
      }

      if (updateHash && targetId) {
        try {
          history.replaceState(null, "", `#${targetId}`);
        } catch {
          // Ignore history errors in restricted origins.
        }
      }
    }

    function activateTabByHash() {
      const hashId = window.location.hash.replace(/^#/, "");
      if (!hashId) return;
      const matched = sectionTabs.find((btn) => btn.dataset.tab === hashId);
      if (matched) {
        activateTab(matched);
      }
    }

    sectionTabs.forEach((tab, index) => {
      tab.addEventListener("click", () => {
        activateTab(tab, { updateHash: true });
      });

      tab.addEventListener("keydown", (event) => {
        let nextIndex = null;
        if (event.key === "ArrowRight") {
          nextIndex = (index + 1) % sectionTabs.length;
        } else if (event.key === "ArrowLeft") {
          nextIndex = (index - 1 + sectionTabs.length) % sectionTabs.length;
        } else if (event.key === "Home") {
          nextIndex = 0;
        } else if (event.key === "End") {
          nextIndex = sectionTabs.length - 1;
        }

        if (nextIndex !== null) {
          event.preventDefault();
          activateTab(sectionTabs[nextIndex], { focus: true, updateHash: true });
        }
      });
    });

    activateTabByHash();
    window.addEventListener("hashchange", activateTabByHash);
  }

  // Category filtering for Publications
  const filterButtons = document.querySelectorAll(".filter-tab[data-filter]");
  const pubCards = document.querySelectorAll(".pub-card[data-category]");
  const pubStatus = document.getElementById("pub-filter-status");

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const filter = button.dataset.filter;
      let visibleCount = 0;

      filterButtons.forEach((btn) => {
        btn.setAttribute("aria-pressed", String(btn === button));
      });

      pubCards.forEach((item) => {
        const match = filter === "all" || item.dataset.category === filter;
        item.hidden = !match;
        if (match) visibleCount += 1;
      });

      if (pubStatus) {
        pubStatus.textContent = `Showing ${visibleCount} ${visibleCount === 1 ? "item" : "items"}`;
      }
    });
  });
})();