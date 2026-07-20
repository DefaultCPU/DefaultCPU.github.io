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

  // ---------- Gallery: "landmarks of Stockton" ----------
  // The bit: every caption is a real Stockton, CA place name, but the photo
  // behind it is somewhere else entirely. All images from Wikimedia Commons,
  // credited per license (click through and the joke gives itself away).

  const LANDMARKS = [
    {
      caption: "The Haggin Museum",
      img: "https://upload.wikimedia.org/wikipedia/commons/1/12/Grand_Canyon_South_Rim_at_Sunset.jpg",
      credit: "Wikimedia Commons (CC0)",
      page: "https://commons.wikimedia.org/wiki/File:Grand_Canyon_South_Rim_at_Sunset.jpg",
    },
    {
      caption: "The Delta",
      img: "https://upload.wikimedia.org/wikipedia/commons/4/4a/Niagara_Falls_001.JPG",
      credit: "Wikimedia Commons (CC BY-SA 3.0)",
      page: "https://commons.wikimedia.org/wiki/File:Niagara_Falls_001.JPG",
    },
    {
      caption: "Bob Hope Theatre",
      img: "https://upload.wikimedia.org/wikipedia/commons/b/b7/Paris_-_The_Eiffel_Tower_in_spring_-_2307.jpg",
      credit: "Wikimedia Commons (CC BY-SA 3.0)",
      page: "https://commons.wikimedia.org/wiki/File:Paris_-_The_Eiffel_Tower_in_spring_-_2307.jpg",
    },
    {
      caption: "Pixie Woods",
      img: "https://upload.wikimedia.org/wikipedia/commons/6/62/80_-_Machu_Picchu_-_Juin_2009_-_edit.jpg",
      credit: "Wikimedia Commons (CC BY-SA 3.0)",
      page: "https://commons.wikimedia.org/wiki/File:80_-_Machu_Picchu_-_Juin_2009_-_edit.jpg",
    },
    {
      caption: "Stockton Arena",
      img: "https://upload.wikimedia.org/wikipedia/commons/6/6d/Serengeti_wildebeest_migration_JF.jpg",
      credit: "Wikimedia Commons (CC BY-SA 4.0)",
      page: "https://commons.wikimedia.org/wiki/File:Serengeti_wildebeest_migration_JF.jpg",
    },
    {
      caption: "Weber Point Events Center",
      img: "https://upload.wikimedia.org/wikipedia/commons/c/c5/Tokyo_Shibuya_Scramble_Crossing_2018-10-09.jpg",
      credit: "Wikimedia Commons (CC BY-SA 2.0)",
      page: "https://commons.wikimedia.org/wiki/File:Tokyo_Shibuya_Scramble_Crossing_2018-10-09.jpg",
    },
    {
      caption: "University of the Pacific",
      img: "https://upload.wikimedia.org/wikipedia/commons/b/b2/Radcliffe_Camera_Oxford_2018_03.jpg",
      credit: "Wikimedia Commons (CC BY 4.0)",
      page: "https://commons.wikimedia.org/wiki/File:Radcliffe_Camera_Oxford_2018_03.jpg",
    },
    {
      caption: "Banner Island Ballpark",
      img: "https://upload.wikimedia.org/wikipedia/commons/6/6d/Panoramic_view_of_Oia%2C_Santorini_island_%28Thira%29%2C_Greece.jpg",
      credit: "Wikimedia Commons (CC BY-SA 3.0)",
      page: "https://commons.wikimedia.org/wiki/File:Panoramic_view_of_Oia,_Santorini_island_(Thira),_Greece.jpg",
    },
    {
      caption: "Dean DeCarli Waterfront Plaza",
      img: "https://upload.wikimedia.org/wikipedia/commons/6/69/New_York_City_%28New_York%2C_USA%29%2C_Times_Square-Duffy_Square_--_2012_--_6380.jpg",
      credit: "Wikimedia Commons (CC BY-SA 4.0)",
      page: "https://commons.wikimedia.org/wiki/File:New_York_City_(New_York,_USA),_Times_Square-Duffy_Square_--_2012_--_6380.jpg",
    },
    {
      caption: "Oak Park",
      img: "https://upload.wikimedia.org/wikipedia/commons/1/10/20090529_Great_Wall_8185.jpg",
      credit: "Wikimedia Commons (CC BY-SA 3.0)",
      page: "https://commons.wikimedia.org/wiki/File:20090529_Great_Wall_8185.jpg",
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

  // ---------- Music player ----------
  // Drop an mp3 at music/theme.mp3 and this lights up automatically.
  // Browsers block autoplay-with-sound, so playback always starts from
  // an explicit click on the button (a real user gesture).

  function initMusicPlayer() {
    const audio = document.getElementById("bg-music");
    const button = document.getElementById("play-toggle");
    const trackName = document.getElementById("track-name");
    const trackArtist = document.getElementById("track-artist");
    const cassette = document.getElementById("cassette-icon");

    audio.addEventListener("loadedmetadata", () => {
      button.disabled = false;
      trackName.textContent = "theme.mp3";
      trackArtist.textContent = "click play →";
    });

    audio.addEventListener("error", () => {
      button.disabled = true;
      trackName.textContent = "[ no track loaded ]";
      trackArtist.textContent = "drop an mp3 in /music";
    });

    audio.addEventListener("play", () => {
      button.textContent = "⏸ Pause";
      cassette.textContent = "🎶";
      trackArtist.textContent = "now playing...";
    });

    audio.addEventListener("pause", () => {
      button.textContent = "▶ Play";
      cassette.textContent = "📼";
      trackArtist.textContent = "paused";
    });

    button.addEventListener("click", () => {
      if (audio.paused) {
        audio.play().catch(() => {
          trackArtist.textContent = "couldn't play, try again";
        });
      } else {
        audio.pause();
      }
    });

    // preload="none" means we have to nudge it to check the file exists
    audio.load();
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
      ctx.fillStyle = "#7dffb3";
      ctx.shadowColor = "#39ff88";
      ctx.shadowBlur = 6;
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
      ctx.shadowBlur = 0;
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
    initMusicPlayer();
  });
})();
