const wallpapers = [
  {
    id: "dolomites",
    title: "The quiet collection",
    location: "Dolomites, Italy",
    category: "Nature",
    mood: "Alpine calm",
    photo: "photo-1470770841072-f978cf4d019e",
  },
  {
    id: "coastline",
    title: "Where land meets blue",
    location: "Amalfi Coast, Italy",
    category: "Ocean",
    mood: "Salt air",
    photo: "photo-1518837695005-2083093ee35b",
  },
  {
    id: "desert",
    title: "A study in stillness",
    location: "Sahara, Morocco",
    category: "Nature",
    mood: "Golden hour",
    photo: "photo-1509316785289-025f5b846b35",
  },
  {
    id: "city",
    title: "Lines of the city",
    location: "Copenhagen, Denmark",
    category: "Architecture",
    mood: "Urban quiet",
    photo: "photo-1511818966892-d7d671e672a2",
  },
  {
    id: "mountains",
    title: "Above the clouds",
    location: "Swiss Alps",
    category: "Nature",
    mood: "Open air",
    photo: "photo-1464822759023-fed622ff2c3b",
  },
  {
    id: "abstract",
    title: "Shapes of the sun",
    location: "Somewhere, slowly",
    category: "Abstract",
    mood: "Warm light",
    photo: "photo-1500530855697-b586d89ba3ee",
  },
  {
    id: "forest",
    title: "A forest of quiet",
    location: "Black Forest, Germany",
    category: "Nature",
    mood: "Deep green",
    photo: "photo-1448375240586-882707db888b",
  },
  {
    id: "japan",
    title: "The long way home",
    location: "Kyoto, Japan",
    category: "Architecture",
    mood: "Rainy afternoon",
    photo: "photo-1493976040374-85c8e12f0c0e",
  },
  {
    id: "lake",
    title: "A blue hour somewhere",
    location: "Lake Bled, Slovenia",
    category: "Nature",
    mood: "Blue hour",
    photo: "photo-1472396961693-142e6e269027",
  },
  {
    id: "waves",
    title: "Out past the shore",
    location: "Pacific Ocean",
    category: "Ocean",
    mood: "Open water",
    photo: "photo-1500375592092-40eb2168fd21",
  },
  {
    id: "desert-arch",
    title: "Geometry in the sand",
    location: "Antelope Canyon, USA",
    category: "Architecture",
    mood: "Sculpted light",
    photo: "photo-1518005020951-eccb494ad742",
  },
  {
    id: "wildflowers",
    title: "A field of almost-summer",
    location: "Provence, France",
    category: "Nature",
    mood: "Soft afternoon",
    photo: "photo-1490750967868-88aa4486c946",
  },
  {
    id: "cliffs",
    title: "The edge of everything",
    location: "Big Sur, California",
    category: "Ocean",
    mood: "Coastal air",
    photo: "photo-1469474968028-56623f02e42e",
  },
  {
    id: "arches",
    title: "A little room to breathe",
    location: "Marrakech, Morocco",
    category: "Architecture",
    mood: "Warm minimalism",
    photo: "photo-1497366754035-f200968a6e72",
  },
  {
    id: "abstract-dunes",
    title: "Shapes the wind leaves",
    location: "Namib Desert",
    category: "Abstract",
    mood: "Natural forms",
    photo: "photo-1509316785289-025f5b846b35",
  },
  {
    id: "coast",
    title: "Somewhere along the coast",
    location: "Lofoten, Norway",
    category: "Ocean",
    mood: "Northern light",
    photo: "photo-1473116763249-2faaef81ccda",
  },
  {
    id: "city-lights",
    title: "After the city exhales",
    location: "Tokyo, Japan",
    category: "Architecture",
    mood: "Night wander",
    photo: "photo-1519608487953-e999c86e7455",
  },
];

const imageUrl = (photo, width = 900) =>
  `https://images.unsplash.com/${photo}?auto=format&fit=crop&w=${width}&q=85`;

const gallerySize = 6;
const grid = document.querySelector("#wallpaper-grid");
const searchInput = document.querySelector("#search-input");
const emptyState = document.querySelector("#empty-state");
const galleryCount = document.querySelector("#gallery-count");
const favoriteCount = document.querySelector("#favorite-count");
const toast = document.querySelector("#toast");

let activeFilter = "all";
let favoritesOnly = false;
let sortNewestFirst = true;
let toastTimeout;
let pageWallpapers = [];

function getFavorites() {
  try {
    return new Set(JSON.parse(localStorage.getItem("atlas-favorites") || "[]"));
  } catch (error) {
    console.error("Could not read Atlas favorites from storage.", error);
    return new Set();
  }
}

let favorites = getFavorites();

function shuffle(items) {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
}

function chooseWallpapersForPage() {
  const savedFavorites = wallpapers.filter((wallpaper) => favorites.has(wallpaper.id));
  const favoriteIds = new Set(savedFavorites.map((wallpaper) => wallpaper.id));
  let previousIds = [];
  try {
    previousIds = JSON.parse(sessionStorage.getItem("atlas-last-wallpapers") || "[]");
  } catch (error) {
    console.error("Could not read the previous Atlas wallpaper selection.", error);
  }

  const freshWallpapers = shuffle(
    wallpapers.filter((wallpaper) => !favoriteIds.has(wallpaper.id) && !previousIds.includes(wallpaper.id)),
  );
  const needed = Math.max(0, gallerySize - savedFavorites.length);
  let selected = [...savedFavorites, ...freshWallpapers.slice(0, needed)];

  if (selected.length < gallerySize) {
    const selectedIds = new Set(selected.map((wallpaper) => wallpaper.id));
    selected = [...selected, ...shuffle(wallpapers.filter((wallpaper) => !selectedIds.has(wallpaper.id))).slice(0, gallerySize - selected.length)];
  }

  pageWallpapers = shuffle(selected);
  try {
    sessionStorage.setItem(
      "atlas-last-wallpapers",
      JSON.stringify(pageWallpapers.filter((wallpaper) => !favoriteIds.has(wallpaper.id)).map((wallpaper) => wallpaper.id)),
    );
  } catch (error) {
    console.error("Could not save the Atlas wallpaper selection.", error);
  }
}

function saveFavorites() {
  try {
    localStorage.setItem("atlas-favorites", JSON.stringify([...favorites]));
  } catch (error) {
    console.error("Could not save Atlas favorites.", error);
    showToast("Favorites could not be saved in this browser.");
  }
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("is-visible");
  window.clearTimeout(toastTimeout);
  toastTimeout = window.setTimeout(() => toast.classList.remove("is-visible"), 2600);
}

function renderWallpapers() {
  const search = searchInput.value.trim().toLowerCase();
  const candidates = favoritesOnly || activeFilter !== "all" || search ? wallpapers : pageWallpapers;
  const visible = candidates.filter((wallpaper) => {
    const matchesSearch = [
      wallpaper.title,
      wallpaper.location,
      wallpaper.category,
      wallpaper.mood,
    ].some((value) => value.toLowerCase().includes(search));
    const matchesFilter = activeFilter === "all" || wallpaper.category === activeFilter;
    const matchesFavorites = !favoritesOnly || favorites.has(wallpaper.id);
    return matchesSearch && matchesFilter && matchesFavorites;
  });

  if (!sortNewestFirst) visible.reverse();
  galleryCount.textContent = String(visible.length).padStart(2, "0");
  emptyState.hidden = visible.length > 0;
  grid.hidden = visible.length === 0;

  grid.innerHTML = visible.map((wallpaper) => {
    const favorite = favorites.has(wallpaper.id);
    return `
      <article class="wallpaper-card">
        <div class="wallpaper-image-wrap">
          <img class="wallpaper-image" src="${imageUrl(wallpaper.photo, 800)}" alt="${wallpaper.title} — ${wallpaper.location}" loading="lazy">
          <div class="card-top-actions">
            <span class="card-resolution">4K · 16:9</span>
            <button class="card-favorite${favorite ? " is-favorite" : ""}" data-favorite="${wallpaper.id}" aria-label="${favorite ? "Remove from" : "Add to"} favorites" aria-pressed="${favorite}">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.2 8.8c0 5.2-8.2 10.1-8.2 10.1S3.8 14 3.8 8.8a4.3 4.3 0 0 1 8.2-1.7 4.3 4.3 0 0 1 8.2 1.7Z"/></svg>
            </button>
          </div>
          <button class="card-download" data-download="${wallpaper.id}" aria-label="Download ${wallpaper.title}">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.8v11.4m0 0 4.2-4.2M12 15.2 7.8 11M4.5 17v2.5h15V17"/></svg>
          </button>
        </div>
        <div class="card-info">
          <div><h3>${wallpaper.title}</h3><p>${wallpaper.location}</p></div>
          <span class="card-type">${wallpaper.category.toUpperCase()}</span>
        </div>
      </article>`;
  }).join("");

  favoriteCount.textContent = String(favorites.size);
  document.querySelector("#feature-card .feature-favorite").classList.toggle("is-favorite", favorites.has("dolomites"));
  document.querySelector("#feature-card .feature-favorite").setAttribute("aria-pressed", String(favorites.has("dolomites")));
  document.querySelector("#feature-card .feature-favorite").setAttribute(
    "aria-label",
    `${favorites.has("dolomites") ? "Remove Dolomites wallpaper from" : "Add Dolomites wallpaper to"} favorites`,
  );
}

function toggleFavorite(id) {
  if (favorites.has(id)) {
    favorites.delete(id);
    showToast("Removed from your favorites.");
  } else {
    favorites.add(id);
    showToast("Added to your favorites.");
  }
  saveFavorites();
  renderWallpapers();
}

async function downloadWallpaper(id) {
  const wallpaper = wallpapers.find((item) => item.id === id);
  if (!wallpaper) return;
  const button = document.querySelector(`[data-download="${id}"]`);
  if (button) button.disabled = true;

  try {
    const response = await fetch(imageUrl(wallpaper.photo, 2560));
    if (!response.ok) throw new Error(`Image request failed with status ${response.status}`);
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `atlas-${wallpaper.id}.jpg`;
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    showToast("Your wallpaper is downloading.");
  } catch (error) {
    console.error("Wallpaper download failed.", error);
    window.open(imageUrl(wallpaper.photo, 2560), "_blank", "noopener");
    showToast("Opened the wallpaper in a new tab to save.");
  } finally {
    if (button) button.disabled = false;
  }
}

document.addEventListener("click", (event) => {
  const favoriteButton = event.target.closest("[data-favorite]");
  if (favoriteButton) {
    toggleFavorite(favoriteButton.dataset.favorite);
    return;
  }
  const downloadButton = event.target.closest("[data-download]");
  if (downloadButton) {
    downloadWallpaper(downloadButton.dataset.download);
  }
});

document.querySelectorAll("[data-filter]").forEach((button) => {
  button.addEventListener("click", () => {
    activeFilter = button.dataset.filter === "favorites" ? "all" : button.dataset.filter;
    favoritesOnly = button.dataset.filter === "favorites";
    document.querySelectorAll(".nav-link, .collection-link").forEach((item) => {
      item.classList.toggle("is-active", item === button);
    });
    renderWallpapers();
  });
});

searchInput.addEventListener("input", renderWallpapers);
document.querySelector("#clear-search").addEventListener("click", () => {
  searchInput.value = "";
  activeFilter = "all";
  favoritesOnly = false;
  document.querySelectorAll(".nav-link, .collection-link").forEach((item) => {
    item.classList.toggle("is-active", item.dataset.filter === "all");
  });
  renderWallpapers();
});

document.querySelector("#sort-button").addEventListener("click", (event) => {
  sortNewestFirst = !sortNewestFirst;
  event.currentTarget.querySelector("span").textContent = sortNewestFirst ? "Latest" : "Oldest";
  renderWallpapers();
});

document.querySelector("#theme-button").addEventListener("click", () => {
  document.body.classList.toggle("light-theme");
});

document.querySelector("#load-more").addEventListener("click", () => {
  showToast("You’re all caught up — new places arrive every week.");
});

document.addEventListener("keydown", (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    searchInput.focus();
  }
  if (event.key === "Escape") searchInput.blur();
});

chooseWallpapersForPage();
renderWallpapers();
