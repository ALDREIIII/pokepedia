/* ===== SETTINGS ===== */
const API = "https://pokeapi.co/api/v2";
const SPRITES =
  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon";
const spriteFolder = {
  ruby: "ruby-sapphire",
  sapphire: "ruby-sapphire",
  emerald: "emerald",
};

const games = {
  ruby: {
    title: "Pokémon Ruby",
    legendary: "Groudon",
    team: "Team Magma (Maxie)",
    champion: "Steven Stone",
  },
  sapphire: {
    title: "Pokémon Sapphire",
    legendary: "Kyogre",
    team: "Team Aqua (Archie)",
    champion: "Steven Stone",
  },
  emerald: {
    title: "Pokémon Emerald",
    legendary: "Rayquaza",
    team: "Team Magma and Team Aqua",
    champion: "Wallace",
  },
};

let currentGame = "ruby";
let pokemonList = [];
let letter = "";
let musicOn = true;
let spins = 0;

/* ===== PAGE ELEMENTS ===== */
const pokeball = document.getElementById("pokeball");
const welcome = document.getElementById("welcome");
const footerBrand = document.getElementById("footer-brand");
const musicButton = document.getElementById("music-button");
const toast = document.getElementById("toast");
const gameTitle = document.getElementById("game-title");
const gameInfo = document.getElementById("game-info");
const letters = document.getElementById("letters");
const searchForm = document.getElementById("search-form");
const searchBox = document.getElementById("search-box");
const dexSelect = document.getElementById("dex-select");
const pokemonGrid = document.getElementById("pokemon-list");
const detail = document.getElementById("detail");
const music = document.getElementById("music");
const clickSound = document.getElementById("click-sound");
const hoverSound = document.getElementById("hover-sound");

/* ===== SOUNDS ===== */
const clickable = "button, a, area, #pokeball";
music.volume = 0.3;
hoverSound.volume = 0.4;

function playSound(sound) {
  sound.currentTime = 0;
  sound.play().catch(() => {});
}

document.addEventListener("mouseover", (event) => {
  const item = event.target.closest(clickable);
  if (item && !item.contains(event.relatedTarget)) playSound(hoverSound);
});

document.addEventListener("click", (event) => {
  if (event.target.closest(clickable)) playSound(clickSound);
});

/* ===== BACKGROUND MUSIC ===== */
function updateMusic() {
  if (musicOn) music.play().catch(() => {});
  else music.pause();
  musicButton.textContent = "Music: " + (musicOn ? "ON" : "OFF");
}

musicButton.addEventListener("click", () => {
  musicOn = !musicOn;
  updateMusic();
});

// Browsers only allow music after the first click
document.addEventListener(
  "click",
  () => {
    if (musicOn) music.play().catch(() => {});
  },
  { once: true },
);

/* ===== EASTER EGGS ===== */
function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2000);
}

pokeball.addEventListener("click", () => {
  pokeball.animate(
    { rotate: ["0deg", "720deg"] },
    { duration: 800, easing: "ease-in-out" },
  );
  spins++;
  if (spins % 5 === 0) {
    pokeball.classList.toggle("master");
    showToast(
      pokeball.classList.contains("master")
        ? "You found a Master Ball!"
        : "Back to a regular Poké Ball.",
    );
  }
});

welcome.addEventListener("click", () =>
  showToast("A wild Zigzagoon appeared!"),
);
footerBrand.addEventListener("click", () => showToast("Gotta catch 'em all!"));

/* ===== NAVIGATION ===== */
function openPage(name) {
  if (name === "pokedex") name = currentGame;
  const isGame = name in games;
  const section = isGame ? "pokedex" : name;

  document.querySelectorAll(".page").forEach((page) => {
    page.classList.toggle("active", page.id === section);
  });
  document.querySelectorAll("[data-page]").forEach((item) => {
    item.classList.toggle(
      "current",
      item.dataset.page === name || item.dataset.page === section,
    );
  });

  document.body.dataset.theme = name;
  if (isGame) loadGame(name);
  window.scrollTo(0, 0);
}

document.addEventListener("click", (event) => {
  const link = event.target.closest("[data-page]");
  if (link) {
    event.preventDefault();
    openPage(link.dataset.page);
  }
});

/* ===== POKEDEX LIST ===== */
async function getData(path) {
  const response = await fetch(`${API}/${path}`);
  return response.json();
}

function pokemonImage(url, name) {
  return `<img src="${url}" alt="${name}" loading="lazy" onerror="this.onerror=null;this.src='assets/images/pokemon-placeholder.svg'">`;
}

function loadGame(game) {
  currentGame = game;
  const info = games[game];
  gameTitle.textContent = info.title;
  gameInfo.innerHTML = `
    <li>Legendary: <b>${info.legendary}</b></li>
    <li>Villains: <b>${info.team}</b></li>
    <li>Champion: <b>${info.champion}</b></li>`;

  if (pokemonList.length) showList();
  else loadList();
}

async function loadList() {
  pokemonGrid.innerHTML = "<p>Loading Pokémon...</p>";
  try {
    const data = await getData(`pokedex/${dexSelect.value}`);
    pokemonList = data.pokemon_entries.slice(0, 386).map((entry) => ({
      number: entry.entry_number,
      id: entry.pokemon_species.url.split("/").filter(Boolean).pop(),
      name: entry.pokemon_species.name.replace("-", " "),
    }));
    showList();
  } catch {
    pokemonGrid.innerHTML =
      "<p>Could not load the Pokédex. Please check your internet connection.</p>";
  }
}

function showList() {
  const search = searchBox.value.toLowerCase().trim();
  const folder = spriteFolder[currentGame];
  const matches = pokemonList.filter(
    (pokemon) =>
      pokemon.name.startsWith(letter) &&
      (pokemon.name.includes(search) || String(pokemon.number) === search),
  );

  pokemonGrid.innerHTML =
    matches
      .map(
        (pokemon) => `
    <button class="pokemon-card" data-id="${pokemon.id}">
      ${pokemonImage(`${SPRITES}/versions/generation-iii/${folder}/${pokemon.id}.png`, pokemon.name)}
      <span>#${String(pokemon.number).padStart(3, "0")}</span>
      <strong>${pokemon.name}</strong>
    </button>`,
      )
      .join("") || "<p>No Pokémon found.</p>";
}

letters.innerHTML = [..."ABCDEFGHIJKLMNOPQRSTUVWXYZ"]
  .map((item) => `<button>${item}</button>`)
  .join("");

letters.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;

  const chosen = button.textContent.toLowerCase();
  letter = letter === chosen ? "" : chosen;
  letters.querySelectorAll("button").forEach((item) => {
    item.classList.toggle("current", item.textContent.toLowerCase() === letter);
  });
  showList();
});

searchBox.addEventListener("input", showList);
dexSelect.addEventListener("change", loadList);
searchForm.addEventListener("submit", (event) => event.preventDefault());

pokemonGrid.addEventListener("click", (event) => {
  const card = event.target.closest(".pokemon-card");
  if (card) inspect(card.dataset.id);
});

/* ===== POKEMON DETAILS ===== */
async function inspect(id) {
  detail.innerHTML = '<p class="detail-body">Loading...</p>';
  detail.showModal();
  try {
    const [pokemon, species] = await Promise.all([
      getData(`pokemon/${id}`),
      getData(`pokemon-species/${id}`),
    ]);
    const name = species.name.replace("-", " ");
    const texts = species.flavor_text_entries.filter(
      (item) => item.language.name === "en",
    );
    const text = (
      texts.find((item) => item.version.name === currentGame) || texts[0]
    ).flavor_text.replace(/\s+/g, " ");

    const types = pokemon.types
      .map(
        (item) =>
          `<span class="type ${item.type.name}">${item.type.name}</span>`,
      )
      .join("");
    const stats = pokemon.stats
      .map(
        (item) => `
      <tr>
        <th>${item.stat.name.replace("-", " ").replace("hp", "HP")}</th>
        <td>${item.base_stat}</td>
        <td><div class="bar" style="width:${item.base_stat / 2.55}%"></div></td>
      </tr>`,
      )
      .join("");

    detail.innerHTML = `
      <div class="detail-top">
        <button id="close-button" aria-label="Close">✕</button>
        ${pokemonImage(`${SPRITES}/other/official-artwork/${id}.png`, name)}
      </div>
      <div class="detail-body">
        <h2>${name} <small>National No. ${id}</small></h2>
        <p>${types}</p>
        <p>${text}</p>
        <table>${stats}</table>
        <p>Height: ${pokemon.height / 10} m &nbsp; Weight: ${pokemon.weight / 10} kg</p>
      </div>`;
  } catch {
    detail.innerHTML =
      '<button id="close-button" aria-label="Close">✕</button><p class="detail-body">Could not load this Pokémon.</p>';
  }
}

detail.addEventListener("click", (event) => {
  if (event.target === detail || event.target.id === "close-button")
    detail.close();
});

/* ===== START ===== */
openPage("home");
