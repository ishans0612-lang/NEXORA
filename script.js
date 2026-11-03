/* =====================================
   NEXORA — Main JavaScript
   Browser-only personal demo
===================================== */

const $ = id => document.getElementById(id);

const STORAGE_KEY = "nexora_complete_v1";

const defaultData = {
  user: null,
  plan: "Free",
  theme: "violet",
  customAccent: "",
  favorites: [],
  activities: [],
  notifications: [
    { title: "Welcome to NEXORA!", message: "Your personal workspace is ready.", read: false },
    { title: "Theme Studio is ready", message: "Customize your workspace with different colors.", read: false }
  ],
  note: "",
  compact: false,
  animations: true
};

let data = loadData();
let authMode = "login";
let timerSeconds = 1500;
let timerInterval = null;

function loadData() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return saved ? { ...structuredClone(defaultData), ...saved } : structuredClone(defaultData);
  } catch {
    return structuredClone(defaultData);
  }
}

function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function toast(message) {
  const container = $("toastContainer");
  const item = document.createElement("div");
  item.className = "toast";
  item.textContent = message;
  container.appendChild(item);

  setTimeout(() => item.remove(), 3000);
}

function addActivity(message) {
  data.activities.unshift({
    message,
    time: new Date().toLocaleString()
  });

  data.activities = data.activities.slice(0, 15);
  saveData();
  renderActivity();
  updateDashboard();
}

/* =====================================
   NAVIGATION
===================================== */

const pageTitles = {
  dashboard: "Dashboard",
  explore: "Explore",
  gallery: "Gallery",
  tools: "Tools",
  profile: "My Profile",
  subscription: "Membership",
  customize: "Theme Studio",
  favorites: "Favorites",
  notifications: "Notifications",
  settings: "Settings"
};

function showPage(pageId) {
  const page = $(pageId);

  if (!page) return;

  document.querySelectorAll(".page").forEach(p => {
    p.classList.remove("active");
  });

  page.classList.add("active");

  document.querySelectorAll(".nav-item").forEach(button => {
    button.classList.toggle(
      "active",
      button.dataset.page === pageId
    );
  });

  $("pageName").textContent = pageTitles[pageId] || "Workspace";
  $("topTitle").textContent = pageTitles[pageId] || "Workspace";

  $("sidebar").classList.remove("open");
  $("sidebarOverlay").classList.remove("show");

  if (pageId === "favorites") renderFavorites();
  if (pageId === "notifications") renderNotifications();
  if (pageId === "profile") renderProfile();

  if (pageId !== "dashboard") {
    addActivity("Opened " + pageTitles[pageId]);
  }

  window.scrollTo({ top: 0, behavior: "smooth" });
}

document.addEventListener("click", event => {
  const pageButton = event.target.closest("[data-page]");

  if (pageButton) {
    showPage(pageButton.dataset.page);
  }
});

$("menuToggle").addEventListener("click", () => {
  $("sidebar").classList.add("open");
  $("sidebarOverlay").classList.add("show");
});

$("closeSidebar").addEventListener("click", closeSidebar);
$("sidebarOverlay").addEventListener("click", closeSidebar);

function closeSidebar() {
  $("sidebar").classList.remove("open");
  $("sidebarOverlay").classList.remove("show");
}

/* =====================================
   DASHBOARD
===================================== */

function updateDashboard() {
  const name = data.user?.name || "Explorer";
  const initial = name.charAt(0).toUpperCase() || "N";

  $("welcomeName").textContent = name;
  $("miniName").textContent = data.user?.name || "Guest User";
  $("miniPlan").textContent = data.plan === "Free"
    ? "Free Member"
    : "Premium Demo";

  $("miniAvatar").textContent = initial;
  $("topAvatar").textContent = initial;
  $("profileAvatar").textContent = initial;

  $("statPlan").textContent = data.plan === "Free" ? "Free" : "Premium";
  $("statFeatures").textContent = "10";
  $("statSaved").textContent = data.favorites.length;
  $("statActivity").textContent = data.activities.length;

  const unread = data.notifications.filter(n => !n.read).length;
  $("navNotificationCount").textContent = unread;
  $("navNotificationCount").style.display = unread ? "inline-block" : "none";

  $("todayDate").textContent = new Date().toLocaleDateString(
    undefined,
    { weekday: "short", day: "numeric", month: "short", year: "numeric" }
  );
}

function renderActivity() {
  const list = $("activityList");

  if (!data.activities.length) {
    list.innerHTML = '<p class="empty-state">Your activity will appear here.</p>';
    return;
  }

  list.innerHTML = "";

  data.activities.slice(0, 5).forEach(activity => {
    const row = document.createElement("div");
    row.className = "activity-item";

    const dot = document.createElement("span");
    dot.className = "activity-dot";

    const content = document.createElement("div");
    const strong = document.createElement("strong");
    const small = document.createElement("small");

    strong.textContent = activity.message;
    small.textContent = activity.time;

    content.append(strong, small);
    row.append(dot, content);
    list.appendChild(row);
  });
}

/* =====================================
   THEME STUDIO
===================================== */

function applyTheme() {
  document.body.dataset.theme = data.theme;

  if (data.customAccent) {
    document.documentElement.style.setProperty(
      "--accent",
      data.customAccent
    );

    const hex = data.customAccent.replace("#", "");
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    document.documentElement.style.setProperty(
      "--accent-rgb",
      `${r},${g},${b}`
    );
  } else {
    document.documentElement.style.removeProperty("--accent");
    document.documentElement.style.removeProperty("--accent-rgb");
  }

  document.querySelectorAll("[data-theme-choice]").forEach(button => {
    button.classList.toggle(
      "selected",
      button.dataset.themeChoice === data.theme
    );
  });

  $("accentPicker").value = data.customAccent || getThemeColor(data.theme);
}

function getThemeColor(theme) {
  const colors = {
    violet: "#8b70ff",
    ocean: "#35a9ff",
    emerald: "#25c997",
    sunset: "#ff945c",
    rose: "#f06baf"
  };

  return colors[theme] || colors.violet;
}

document.querySelectorAll("[data-theme-choice]").forEach(button => {
  button.addEventListener("click", () => {
    data.theme = button.dataset.themeChoice;
    data.customAccent = "";
    saveData();
    applyTheme();
    toast("Theme changed successfully!");
    addActivity("Changed workspace theme");
  });
});

$("accentPicker").addEventListener("input", event => {
  data.customAccent = event.target.value;
  saveData();
  applyTheme();
});

$("resetTheme").addEventListener("click", () => {
  data.theme = "violet";
  data.customAccent = "";
  saveData();
  applyTheme();
  toast("Theme reset!");
});

/* =====================================
   LOGIN AND REGISTER
===================================== */

function openLogin() {
  $("loginModal").classList.remove("hidden");
  setAuthMode("login");
}

function closeLogin() {
  $("loginModal").classList.add("hidden");
}

function setAuthMode(mode) {
  authMode = mode;

  document.querySelectorAll(".auth-tab").forEach(tab => {
    tab.classList.toggle("active", tab.dataset.auth === mode);
  });

  const registering = mode === "register";

  $("registerFields").classList.toggle("hidden", !registering);
  $("confirmField").classList.toggle("hidden", !registering);

  $("authTitle").textContent = registering ? "Create account" : "Welcome back";
  $("authSubtitle").textContent = registering
    ? "Create a local demo profile."
    : "Login to your local demo profile.";

  $("authSubmit").textContent = registering ? "Create Demo Account" : "Login";
}

document.querySelectorAll("[data-auth]").forEach(tab => {
  tab.addEventListener("click", () => {
    setAuthMode(tab.dataset.auth);
  });
});

document.querySelectorAll("[data-close]").forEach(button => {
  button.addEventListener("click", () => {
    const target = $(button.dataset.close);
    if (target) target.classList.add("hidden");
  });
});

$("accountBtn").addEventListener("click", openLogin);
$("profileLogin").addEventListener("click", openLogin);
$("settingsLogin").addEventListener("click", openLogin);

$("topAvatar").addEventListener("click", () => {
  showPage("profile");
});

$("authForm").addEventListener("submit", event => {
  event.preventDefault();

  const email = $("authEmail").value.trim();
  const password = $("authPassword").value;

  if (!email || !password) {
    toast("Please fill in the required fields.");
    return;
  }

  if (authMode === "register") {
    const name = $("authName").value.trim();
    const confirm = $("authConfirm").value;

    if (!name) {
      toast("Please enter your name.");
      return;
    }

    if (password.length < 4) {
      toast("Demo password must have at least 4 characters.");
      return;
    }

    if (password !== confirm) {
      toast("Passwords do not match.");
      return;
    }

    data.user = { name, email };
  } else {
    data.user = {
      name: email.split("@")[0],
      email
    };
  }

  saveData();
  closeLogin();
  updateDashboard();
  renderProfile();
  toast("Demo profile activated!");
  addActivity("Logged in to local demo profile");
  $("authForm").reset();
});

$("guestBtn").addEventListener("click", () => {
  data.user = null;
  saveData();
  closeLogin();
  updateDashboard();
  renderProfile();
  toast("Continuing as Guest.");
});

/* =====================================
   PROFILE
===================================== */

function renderProfile() {
  const user = data.user;

  $("profileDisplayName").textContent = user?.name || "Guest User";
  $("profileEmail").textContent = user?.email || "Not logged in";
  $("profileStatus").textContent = user ? "Demo account" : "Guest mode";
  $("profilePlan").textContent = data.plan === "Free" ? "Free Member" : "Premium Demo";

  $("editName").value = user?.name || "";
  $("editEmail").value = user?.email || "";
}

$("profileForm").addEventListener("submit", event => {
  event.preventDefault();

  const name = $("editName").value.trim();
  const email = $("editEmail").value.trim();

  if (!name) {
    toast("Please enter a display name.");
    return;
  }

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    toast("Please enter a valid email.");
    return;
  }

  data.user = {
    name,
    email
  };

  saveData();
  renderProfile();
  updateDashboard();
  toast("Profile updated!");
  addActivity("Updated profile");
});

/* =====================================
   MEMBERSHIP DEMO
===================================== */

document.querySelectorAll(".plan-action").forEach(button => {
  button.addEventListener("click", () => {
    const selectedPlan = button.dataset.plan;

    if (selectedPlan === "Free") {
      data.plan = "Free";
    } else {
      data.plan = "Premium Demo";
    }

    saveData();
    updateDashboard();
    renderProfile();

    toast(data.plan + " activated in demo mode.");
    addActivity("Selected " + data.plan + " plan");
  });
});

/* =====================================
   FAVORITES
===================================== */

function renderFavorites() {
  const container = $("favoritesList");
  container.innerHTML = "";

  if (!data.favorites.length) {
    container.innerHTML = '<p class="empty-state">No favorites saved yet. Visit the Gallery to save something.</p>';
    return;
  }

  data.favorites.forEach(name => {
    const row = document.createElement("div");
    row.className = "favorite-row";

    const title = document.createElement("strong");
    title.textContent = "♡  " + name;

    const remove = document.createElement("button");
    remove.textContent = "Remove";
    remove.addEventListener("click", () => {
      data.favorites = data.favorites.filter(item => item !== name);
      saveData();
      renderFavorites();
      updateDashboard();
      updateFavoriteButtons();
      toast("Removed from favorites.");
    });

    row.append(title, remove);
    container.appendChild(row);
  });
}

function updateFavoriteButtons() {
  document.querySelectorAll("[data-favorite]").forEach(button => {
    const saved = data.favorites.includes(button.dataset.favorite);
    button.textContent = saved ? "♥ Saved" : "♡ Save";
  });
}

document.querySelectorAll("[data-favorite]").forEach(button => {
  button.addEventListener("click", () => {
    const name = button.dataset.favorite;

    if (data.favorites.includes(name)) {
      data.favorites = data.favorites.filter(item => item !== name);
      toast("Removed from favorites.");
    } else {
      data.favorites.push(name);
      toast("Added to favorites!");
    }

    saveData();
    updateFavoriteButtons();
    updateDashboard();
    renderFavorites();
  });
});

/* =====================================
   EXPLORE SEARCH
===================================== */

$("exploreSearch").addEventListener("input", event => {
  const query = event.target.value.toLowerCase().trim();
  let visible = 0;

  document.querySelectorAll(".explore-card").forEach(card => {
    const searchText = (
      card.dataset.search + " " + card.textContent
    ).toLowerCase();

    const matches = searchText.includes(query);

    card.style.display = matches ? "" : "none";

    if (matches) visible++;
  });

  $("noSearchResults").classList.toggle("hidden", visible !== 0);
});

/* =====================================
   QUICK NOTES
===================================== */

$("quickNote").value = data.note || "";

$("saveNote").addEventListener("click", () => {
  data.note = $("quickNote").value;
  saveData();

  $("noteStatus").textContent = "Saved on this device!";
  toast("Note saved successfully.");
  addActivity("Saved a quick note");
});

/* =====================================
   WORD COUNTER
===================================== */

$("wordInput").addEventListener("input", event => {
  const text = event.target.value;
  const words = text.trim()
    ? text.trim().split(/\s+/).length
    : 0;

  $("wordCount").textContent = words;
  $("charCount").textContent = text.length;
});

/* =====================================
   FOCUS TIMER
===================================== */

function updateTimerDisplay() {
  const minutes = Math.floor(timerSeconds / 60);
  const seconds = timerSeconds % 60;

  $("timerDisplay").textContent =
    String(minutes).padStart(2, "0") + ":" +
    String(seconds).padStart(2, "0");
}

$("timerStart").addEventListener("click", () => {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
    $("timerStart").textContent = "Resume";
    return;
  }

  if (timerSeconds <= 0) timerSeconds = 1500;

  $("timerStart").textContent = "Pause";

  timerInterval = setInterval(() => {
    timerSeconds--;
    updateTimerDisplay();

    if (timerSeconds <= 0) {
      clearInterval(timerInterval);
      timerInterval = null;
      $("timerStart").textContent = "Start";
      toast("Focus session completed!");
    }
  }, 1000);
});

$("timerReset").addEventListener("click", () => {
  clearInterval(timerInterval);
  timerInterval = null;
  timerSeconds = 1500;
  $("timerStart").textContent = "Start";
  updateTimerDisplay();
});

/* =====================================
   RANDOM IDEA GENERATOR
===================================== */

const ideas = [
  "Create a personal portfolio website.",
  "Design a futuristic dashboard.",
  "Learn one new JavaScript concept today.",
  "Build a simple browser-based game.",
  "Create a digital photo gallery.",
  "Design a unique mobile app interface.",
  "Make a website with five different themes.",
  "Build a useful daily productivity tool.",
  "Create a collection of your favorite images.",
  "Learn how CSS animations work."
];

$("ideaButton").addEventListener("click", () => {
  const randomIdea = ideas[Math.floor(Math.random() * ideas.length)];
  $("ideaDisplay").textContent = randomIdea;
});

/* =====================================
   NOTIFICATIONS
===================================== */

function renderNotifications() {
  const container = $("notificationList");
  container.innerHTML = "";

  if (!data.notifications.length) {
    container.innerHTML = '<p class="empty-state">No notifications available.</p>';
    return;
  }

  data.notifications.forEach(notification => {
    const item = document.createElement("article");
    item.className = "notification-item" + (notification.read ? " read" : "");

    const title = document.createElement("strong");
    title.textContent = notification.title;

    const message = document.createElement("p");
    message.textContent = notification.message;

    const status = document.createElement("small");
    status.textContent = notification.read ? "Read" : "Unread";

    item.append(title, message, status);
    container.appendChild(item);
  });
}

$("markAllRead").addEventListener("click", () => {
  data.notifications.forEach(item => {
    item.read = true;
  });

  saveData();
  renderNotifications();
  updateDashboard();
  toast("All notifications marked as read.");
});

$("notificationBtn").addEventListener("click", () => {
  showPage("notifications");
});

/* =====================================
   SETTINGS
===================================== */

$("compactToggle").checked = data.compact;
$("animationToggle").checked = data.animations;

function applySettings() {
  document.body.classList.toggle("compact", data.compact);
  document.body.classList.toggle("no-animations", !data.animations);
}

$("compactToggle").addEventListener("change", event => {
  data.compact = event.target.checked;
  saveData();
  applySettings();
  toast("Layout preference updated.");
});

$("animationToggle").addEventListener("change", event => {
  data.animations = event.target.checked;
  saveData();
  applySettings();
  toast("Animation preference updated.");
});

$("logoutBtn").addEventListener("click", () => {
  data.user = null;
  data.plan = "Free";
  saveData();
  updateDashboard();
  renderProfile();
  toast("Logged out. You are now a guest.");
  addActivity("Logged out");
});

/* =====================================
   EXPORT DATA
===================================== */

$("downloadData").addEventListener("click", () => {
  const exportData = {
    ...data,
    exportedAt: new Date().toISOString()
  };

  const blob = new Blob(
    [JSON.stringify(exportData, null, 2)],
    { type: "application/json" }
  );

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = "nexora-data.json";
  link.click();

  URL.revokeObjectURL(url);
  toast("Your data export is ready.");
});

/* =====================================
   RESET DATA
===================================== */

$("resetData").addEventListener("click", () => {
  const confirmed = confirm(
    "Are you sure? This will delete your saved NEXORA data from this browser."
  );

  if (!confirmed) return;

  localStorage.removeItem(STORAGE_KEY);
  location.reload();
});

/* =====================================
   INITIALIZATION
===================================== */

function initialize() {
  applyTheme();
  applySettings();
  updateDashboard();
  renderActivity();
  renderProfile();
  updateFavoriteButtons();
  updateTimerDisplay();

  // Start on dashboard
  showPage("dashboard");
}

initialize();
