(() => {
  "use strict";

  // ---------- Repos: live from GitHub API ----------

  async function loadRepos() {
    const grid = document.getElementById("repo-grid");
    try {
      const res = await fetch("https://api.github.com/users/DefaultCPU/repos?sort=updated&per_page=30");
      if (!res.ok) throw new Error("bad response");
      const repos = await res.json();
      const filtered = repos
        .filter((r) => !r.fork && r.name.toLowerCase() !== "defaultcpu.github.io")
        .sort((a, b) => new Date(b.pushed_at) - new Date(a.pushed_at));

      if (!filtered.length) {
        grid.innerHTML = '<p class="loading-text">no public repos yet, check back soon</p>';
        return;
      }

      grid.innerHTML = "";
      for (const repo of filtered) {
        const card = document.createElement("div");
        card.className = "repo-card";
        card.innerHTML = `
          <a class="repo-name" href="${repo.html_url}" target="_blank" rel="noopener">${repo.name}</a>
          <p class="repo-desc">${repo.description ? escapeHtml(repo.description) : "no description yet"}</p>
          <div class="repo-meta">
            <span>${repo.language ? "🔧 " + escapeHtml(repo.language) : ""}</span>
            <span>⭐ ${repo.stargazers_count}</span>
          </div>
        `;
        grid.appendChild(card);
      }
    } catch (err) {
      grid.innerHTML = '<p class="loading-text">couldn\'t reach GitHub right now, poke the repo link on the sidebar instead</p>';
    }
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  // ---------- Gallery: San Joaquin Valley landmarks ----------
  // All images from Wikimedia Commons, credited per license.

  const LANDMARKS = [
    {
      caption: "Old Fresno Water Tower",
      img: "https://upload.wikimedia.org/wikipedia/commons/0/0e/Fresno_Water_Tower.JPG",
      credit: "Wikimedia Commons (CC0)",
      page: "https://commons.wikimedia.org/wiki/File:Fresno_Water_Tower.JPG",
    },
    {
      caption: "Forestiere Underground Gardens",
      img: "https://upload.wikimedia.org/wikipedia/commons/9/92/Forestiere_Underground_Gardens.JPG",
      credit: "Wikimedia Commons (CC BY-SA 3.0)",
      page: "https://commons.wikimedia.org/wiki/File:Forestiere_Underground_Gardens.JPG",
    },
    {
      caption: "Modesto Arch",
      img: "https://upload.wikimedia.org/wikipedia/commons/0/01/Modesto_Arch.JPG",
      credit: "Wikimedia Commons (Public domain)",
      page: "https://commons.wikimedia.org/wiki/File:Modesto_Arch.JPG",
    },
    {
      caption: "Tower Theatre, Fresno",
      img: "https://upload.wikimedia.org/wikipedia/commons/f/f3/Tower_Theatre_Fresno_2.jpg",
      credit: "Wikimedia Commons (CC BY-SA 2.0)",
      page: "https://commons.wikimedia.org/wiki/File:Tower_Theatre_Fresno_2.jpg",
    },
    {
      caption: "General Sherman Tree, Sequoia NP",
      img: "https://upload.wikimedia.org/wikipedia/commons/5/57/General_Sherman_Sequoia_Tree.jpg",
      credit: "Wikimedia Commons (CC0)",
      page: "https://commons.wikimedia.org/wiki/File:General_Sherman_Sequoia_Tree.jpg",
    },
    {
      caption: "Millerton Lake",
      img: "https://upload.wikimedia.org/wikipedia/commons/8/89/Millerton_Lake_1.jpg",
      credit: "Wikimedia Commons (CC BY 2.5)",
      page: "https://commons.wikimedia.org/wiki/File:Millerton_Lake_1.jpg",
    },
    {
      caption: "Stockton Skyline",
      img: "https://upload.wikimedia.org/wikipedia/commons/a/a5/Aerial_view_of_Stockton%2C_California_skyline.jpg",
      credit: "Wikimedia Commons (CC BY 4.0)",
      page: "https://commons.wikimedia.org/wiki/File:Aerial_view_of_Stockton,_California_skyline.jpg",
    },
    {
      caption: "Kearney Mansion, Fresno",
      img: "https://upload.wikimedia.org/wikipedia/commons/e/ed/Kearney_Park_Mansion.JPG",
      credit: "Wikimedia Commons (CC BY-SA 3.0)",
      page: "https://commons.wikimedia.org/wiki/File:Kearney_Park_Mansion.JPG",
    },
  ];

  function loadGallery() {
    const grid = document.getElementById("gallery-grid");
    grid.innerHTML = "";
    for (const spot of LANDMARKS) {
      const item = document.createElement("div");
      item.className = "gallery-item";
      item.innerHTML = `
        <img src="${spot.img}" alt="${escapeHtml(spot.caption)}" loading="lazy">
        <p class="gallery-caption">${escapeHtml(spot.caption)}</p>
        <a class="gallery-credit" href="${spot.page}" target="_blank" rel="noopener">${escapeHtml(spot.credit)}</a>
      `;
      grid.appendChild(item);
    }
  }

  // ---------- Visitor counter (local, honest gag) ----------

  function updateVisitorCounter() {
    const el = document.getElementById("visitor-counter");
    const key = "defaultcpu-visits";
    const count = (parseInt(localStorage.getItem(key) || "0", 10) || 0) + 1;
    localStorage.setItem(key, String(count));
    el.textContent = String(count).padStart(6, "0");
  }

  // ---------- Dynamic background: drifting sparkle field ----------

  function initBackgroundCanvas() {
    const canvas = document.getElementById("bg-canvas");
    const ctx = canvas.getContext("2d");
    const SPARKLE_CHARS = ["✦", "✧", "★", "☆", "🌴", "🌻"];
    let width, height, sparkles;

    function resize() {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    }

    function createSparkles() {
      const count = Math.round((width * height) / 28000);
      sparkles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        size: 10 + Math.random() * 14,
        speed: 0.15 + Math.random() * 0.35,
        phase: Math.random() * Math.PI * 2,
        char: SPARKLE_CHARS[Math.floor(Math.random() * SPARKLE_CHARS.length)],
      }));
    }

    function frame(time) {
      ctx.clearRect(0, 0, width, height);
      for (const s of sparkles) {
        s.y -= s.speed;
        if (s.y < -20) {
          s.y = height + 20;
          s.x = Math.random() * width;
        }
        const twinkle = 0.35 + 0.35 * Math.sin(time * 0.002 + s.phase);
        ctx.globalAlpha = twinkle;
        ctx.font = `${s.size}px serif`;
        ctx.fillText(s.char, s.x, s.y);
      }
      ctx.globalAlpha = 1;
      requestAnimationFrame(frame);
    }

    resize();
    createSparkles();
    window.addEventListener("resize", () => {
      resize();
      createSparkles();
    });
    requestAnimationFrame(frame);
  }

  // ---------- Cursor sparkle trail ----------

  function initCursorTrail() {
    if (window.matchMedia("(pointer: coarse)").matches) return; // skip on touch devices
    const TRAIL_CHARS = ["✨", "⭐", "💫"];
    let lastSpawn = 0;

    window.addEventListener("mousemove", (e) => {
      const now = performance.now();
      if (now - lastSpawn < 60) return;
      lastSpawn = now;

      const el = document.createElement("span");
      el.textContent = TRAIL_CHARS[Math.floor(Math.random() * TRAIL_CHARS.length)];
      el.style.position = "fixed";
      el.style.left = `${e.clientX}px`;
      el.style.top = `${e.clientY}px`;
      el.style.pointerEvents = "none";
      el.style.fontSize = "16px";
      el.style.zIndex = "9999";
      el.style.transition = "transform 0.6s ease, opacity 0.6s ease";
      document.body.appendChild(el);

      requestAnimationFrame(() => {
        el.style.transform = "translateY(-24px) scale(0.4)";
        el.style.opacity = "0";
      });

      setTimeout(() => el.remove(), 650);
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    loadRepos();
    loadGallery();
    updateVisitorCounter();
    initBackgroundCanvas();
    initCursorTrail();
  });
})();
