
const $ = id => document.getElementById(id);

const KEY = "nexora_v1";

const defaults = {
  user: null,
  guest: true,
  premium: false,
  plan: "Guest",
  theme: "dark",
  accent: "#8b72ff",
  animations: true,
  compact: false,
  images: true,
  bio: "",
  favorites: [],
  activities: [],
  notifications: [
    {id:1,title:"Welcome to NEXORA!",message:"Your digital workspace is ready.",read:false},
    {id:2,title:"Explore your dashboard",message:"Discover all available features.",read:false}
  ],
  savedThemes: []
};

let state;

try {
  state = {...defaults,...JSON.parse(localStorage.getItem(KEY) || "{}")};
} catch {
  state = {...defaults};
}

let authMode = "login";
let actionCount = 0;

function save() {
  localStorage.setItem(KEY,JSON.stringify(state));
}

function toast(message) {
  const el = document.createElement("div");
  el.className = "toast";
  el.textContent = "✦  " + message;
  $("toastContainer").appendChild(el);
  setTimeout(()=>el.remove(),3200);
}

function record(message) {
  state.activities.unshift({
    message,
    time:new Date().toLocaleString()
  });
  state.activities = state.activities.slice(0,50);
  actionCount++;
  save();
  renderActivity();
  updateDashboard();
}

function addNotification(title,message) {
  state.notifications.unshift({
    id:Date.now(),
    title,
    message,
    read:false
  });
  save();
  renderNotifications();
}

function navigate(page) {
  const target = $(page);
  if(!target) return;

  document.querySelectorAll(".page").forEach(p=>p.classList.remove("active"));
  target.classList.add("active");

  document.querySelectorAll("[data-page]").forEach(b=>{
    b.classList.toggle("active",b.dataset.page===page);
  });

  $("pageName").textContent =
    page.charAt(0).toUpperCase()+page.slice(1);

  $("sidebar").classList.remove("open");
  $("sidebarOverlay").classList.remove("show");

  window.scrollTo({top:0,behavior:"smooth"});

  if(page==="profile") renderProfile();
  if(page==="favorites") renderFavorites();
  if(page==="tools") renderPremium();
  if(page==="subscription") updateSubscription();
  if(page==="customize") renderSavedThemes();

  record("Opened "+page);
}

document.addEventListener("click",e=>{
  const nav = e.target.closest("[data-page]");
  if(nav){
    navigate(nav.dataset.page);
  }
});

// SIDEBAR

$("menuToggle").addEventListener("click",()=>{
  $("sidebar").classList.add("open");
  $("sidebarOverlay").classList.add("show");
});

$("closeSidebar").addEventListener("click",closeSidebar);
$("sidebarOverlay").addEventListener("click",closeSidebar);

function closeSidebar(){
  $("sidebar").classList.remove("open");
  $("sidebarOverlay").classList.remove("show");
}

// DASHBOARD

function updateDashboard(){
  const name = state.user?.name || "Explorer";
  const plan = state.premium ? state.plan : state.user ? "Free" : "Guest";

  $("welcomeName").textContent = name.split(" ")[0];
  $("miniName").textContent = state.user?.name || "Guest User";
  $("miniPlan").textContent = state.premium ? plan+" Member" : plan+" Account";

  $("miniAvatar").textContent = name.charAt(0).toUpperCase();
  $("topAvatar").textContent = name.charAt(0).toUpperCase();

  $("statPlan").textContent = state.premium ? plan : state.user ? "Free" : "Guest";
  $("statFeatures").textContent = state.premium ? "12" : "8";
  $("statSaved").textContent = state.favorites.length;
  $("statActivity").textContent = state.activities.length;

  $("todayDate").textContent =
    new Date().toLocaleDateString("en-IN",{
      weekday:"short",day:"numeric",month:"short",year:"numeric"
    });

  $("accountBtn").textContent =
    state.user ? "My Account" : "Login / Sign up";

  $("navNotificationCount").textContent =
    state.notifications.filter(n=>!n.read).length;

  $("navNotificationCount").style.display =
    state.notifications.some(n=>!n.read) ? "inline" : "none";
}

// AUTHENTICATION - LOCAL DEMO

function openLogin(mode="login"){
  setAuthMode(mode);
  $("loginModal").classList.add("show");
}

function closeModal(id){
  $(id).classList.remove("show");
}

document.querySelectorAll("[data-close]").forEach(btn=>{
  btn.addEventListener("click",()=>closeModal(btn.dataset.close));
});

$("accountBtn").addEventListener("click",()=>{
  if(state.user) navigate("profile");
  else openLogin();
});

$("profileLogin").addEventListener("click",()=>openLogin());
$("settingsLogin").addEventListener("click",()=>openLogin());

document.querySelectorAll("[data-auth]").forEach(btn=>{
  btn.addEventListener("click",()=>setAuthMode(btn.dataset.auth));
});

function setAuthMode(mode){
  authMode=mode;

  document.querySelectorAll(".auth-tab").forEach(btn=>{
    btn.classList.toggle("active",btn.dataset.auth===mode);
  });

  $("registerFields").classList.toggle("hidden",mode!=="register");
  $("confirmField").classList.toggle("hidden",mode!=="register");

  $("authTitle").textContent =
    mode==="register" ? "Create your account." : "Welcome back.";

  $("authSubtitle").textContent =
    mode==="register" ? "Create a local demo profile." : "Sign in to your local demo account.";

  $("authSubmit").textContent =
    mode==="register" ? "Create Account" : "Login";
}

$("togglePassword").addEventListener("click",()=>{
  const input=$("authPassword");
  input.type=input.type==="password"?"text":"password";
  $("togglePassword").textContent=input.type==="password"?"Show":"Hide";
});

$("authForm").addEventListener("submit",e=>{
  e.preventDefault();

  const email=$("authEmail").value.trim().toLowerCase();
  const password=$("authPassword").value;

  if(!email || !password) return toast("Fill in all required fields.");

  let accounts=[];

  try {
    accounts=JSON.parse(localStorage.getItem("nexora_accounts")||"[]");
  } catch {}

  if(authMode==="register"){
    const name=$("authName").value.trim();
    const confirm=$("authConfirm").value;

    if(!name) return toast("Enter your name.");
    if(password.length<6) return toast("Use at least 6 characters.");
    if(password!==confirm) return toast("Passwords do not match.");
    if(accounts.some(a=>a.email===email)) return toast("Account already exists.");

    accounts.push({name,email,password});
    localStorage.setItem("nexora_accounts",JSON.stringify(accounts));

    state.user={name,email};
    state.guest=false;
    state.premium=false;
    state.plan="Free";

    toast("Demo account created!");
  } else {
    const account=accounts.find(a=>a.email===email && a.password===password);

    if(!account) return toast("Incorrect demo login details.");

    state.user={name:account.name,email:account.email};
    state.guest=false;
    state.premium=false;
    state.plan="Free";

    toast("Welcome back!");
  }

  save();
  closeModal("loginModal");
  updateDashboard();
  renderProfile();
  record("Account "+(authMode==="register"?"registered":"logged in"));
  addNotification("Account updated","Your local demo session is active.");
  $("authForm").reset();
});

// GUEST MODE

function continueGuest(){
  state.user=null;
  state.guest=true;
  state.premium=false;
  state.plan="Guest";
  save();
  closeModal("loginModal");
  updateDashboard();
  toast("Continuing as Guest!");
  record("Continued as Guest");
}

$("guestBtn").addEventListener("click",continueGuest);
$("modalGuest").addEventListener("click",continueGuest);

// LOGOUT

function logout(){
  if(!confirm("Do you want to end this local demo session?")) return;

  state.user=null;
  state.guest=true;
  state.premium=false;
  state.plan="Guest";

  save();
  updateDashboard();
  renderProfile();
  toast("You are now browsing as Guest.");
  record("Logged out");
}

$("logoutBtn").addEventListener("click",logout);

// PROFILE

function renderProfile(){
  const name=state.user?.name||"Guest User";
  $("profileAvatar").textContent=name.charAt(0).toUpperCase();
  $("profileDisplayName").textContent=name;
  $("profileEmail").textContent=state.user?.email||"Guest Mode";
  $("profilePlan").textContent=state.premium?state.plan.toUpperCase():state.user?"FREE":"GUEST";
  $("profileStatus").textContent=state.user?"Demo account active":"Browsing as Guest";

  $("editName").value=state.user?.name||"";
  $("editEmail").value=state.user?.email||"";
  $("editBio").value=state.bio||"";
}

$("profileForm").addEventListener("submit",e=>{
  e.preventDefault();

  const name=$("editName").value.trim();
  const email=$("editEmail").value.trim();

  if(!name) return toast("Name cannot be empty.");

  if(state.user){
    state.user.name=name;
    state.user.email=email;
  } else {
    state.guest=true;
  }

  state.bio=$("editBio").value;
  save();
  renderProfile();
  updateDashboard();
  toast("Profile saved!");
  record("Updated profile");
});

// SUBSCRIPTION DEMO

function unlockPremium(plan="Pro",source="Demo upgrade"){
  state.premium=true;
  state.plan=plan;

  save();
  updateDashboard();
  updateSubscription();
  renderPremium();

  toast(plan+" demo access unlocked!");
  addNotification("Premium unlocked","Your "+plan+" demo access is active.");
  record(source);
}

document.querySelectorAll(".plan-action").forEach(btn=>{
  btn.addEventListener("click",()=>{
    const plan=btn.dataset.plan;

    if(plan==="Free"){
      state.premium=false;
      state.plan="Free";
      save();
      updateDashboard();
      updateSubscription();
      toast("Free demo plan selected.");
      record("Selected Free plan");
      return;
    }

    if(confirm("Activate the "+plan+" demo plan? No payment will be processed.")){
      unlockPremium(plan,"Activated "+plan+" demo plan");
    }
  });
});

$("cheatForm").addEventListener("submit",e=>{
  e.preventDefault();

  const code=$("cheatInput").value.trim();

  if(code==="0987654321"){
    unlockPremium("Ultimate","Cheat code used");
    $("cheatMessage").textContent="✓ Demo premium access unlocked!";
    $("cheatMessage").style.color="var(--green)";
    $("cheatInput").value="";
  }else{
    $("cheatMessage").textContent="✕ Incorrect code. Please try again.";
    $("cheatMessage").style.color="var(--danger)";
    toast("Invalid cheat code!");
  }
});

function updateSubscription(){
  document.querySelectorAll(".plan-action").forEach(btn=>{
    btn.textContent =
      state.premium && state.plan===btn.dataset.plan
      ? "✓ Active Demo Plan"
      : btn.dataset.plan==="Free" && !state.premium
      ? "Current / Select Free"
      : "Try Demo Upgrade";
  });

  $("cheatMessage").textContent=state.premium
    ? "✓ "+state.plan+" demo access is active."
    : "Demo access code is required to unlock premium features.";
}

function renderPremium(){
  $("premiumLock").classList.toggle("hidden",state.premium);
  $("premiumToolsGrid").classList.toggle("hidden",!state.premium);
  document.querySelectorAll("[data-premium]").forEach(card=>{
    card.classList.toggle("locked",!state.premium);
    const label=card.querySelector("small");
    if(label) label.textContent=state.premium?"UNLOCKED":"PRO 🔒";
  });
}

// FAVORITES

function renderFavorites(){
  const container=$("favoritesList");
  container.innerHTML="";

  if(!state.favorites.length){
    container.innerHTML='<p class="empty-state">Nothing saved yet. Open the gallery and tap ♡.</p>';
    return;
  }

  state.favorites.forEach(item=>{
    const row=document.createElement("div");
    row.className="favorite-entry";

    const name=document.createElement("b");
    name.textContent="♡ "+item;

    const remove=document.createElement("button");
    remove.textContent="Remove";
    remove.addEventListener("click",()=>toggleFavorite(item));

    row.append(name,remove);
    container.appendChild(row);
  });
}

function toggleFavorite(name){
  if(state.favorites.includes(name)){
    state.favorites=state.favorites.filter(x=>x!==name);
    toast("Removed from favorites.");
  }else{
    state.favorites.push(name);
    toast("Added to favorites!");
  }

  save();
  renderFavorites();
  updateDashboard();
}

document.querySelectorAll("[data-fav]").forEach(btn=>{
  const name=btn.dataset.fav;

  btn.addEventListener("click",()=>{
    toggleFavorite(name);
    btn.classList.toggle("saved",state.favorites.includes(name));
    btn.textContent=state.favorites.includes(name)?"♥":"♡";
  });

  if(state.favorites.includes(name)){
    btn.classList.add("saved");
    btn.textContent="♥";
  }
});

// NOTIFICATIONS

function renderNotifications(){
  const container=$("notificationList");
  container.innerHTML="";

  if(!state.notifications.length){
    container.innerHTML='<p class="empty-state">No notifications.</p>';
  }

  state.notifications.forEach(n=>{
    const row=document.createElement("div");
    row.className="notification-entry"+(n.read?"":" unread");

    const content=document.createElement("div");
    const title=document.createElement("b");
    const message=document.createElement("p");

    title.textContent=n.title;
    message.textContent=n.message;
    message.style.marginTop="5px";

    content.append(title,message);

    const read=document.createElement("button");
    read.textContent=n.read?"Read":"Mark read";
    read.addEventListener("click",()=>{
      n.read=true;
      save();
      renderNotifications();
      updateDashboard();
    });

    row.append(content,read);
    container.appendChild(row);
  });

  updateDashboard();
}

$("notificationBtn").addEventListener("click",()=>{
  navigate("notifications");
});

$("markAllRead").addEventListener("click",()=>{
  state.notifications.forEach(n=>n.read=true);
  save();
  renderNotifications();
  toast("All notifications marked as read.");
});

$("clearNotifications").addEventListener("click",()=>{
  state.notifications=[];
  save();
  renderNotifications();
  toast("Notifications cleared.");
});

// ACTIVITY

function renderActivity(){
  const container=$("activityList");
  container.innerHTML="";

  if(!state.activities.length){
    container.innerHTML='<p class="empty-state">No activity yet. Start exploring!</p>';
    return;
  }

  state.activities.forEach(a=>{
    const row=document.createElement("div");
    row.className="activity-entry";

    const message=document.createElement("span");
    message.textContent="✦ "+a.message;

    const time=document.createElement("small");
    time.textContent=a.time;

    row.append(message,time);
    container.appendChild(row);
  });
}

$("clearActivity").addEventListener("click",()=>{
  state.activities=[];
  save();
  renderActivity();
  updateDashboard();
  toast("Activity history cleared.");
});

// SEARCH

$("exploreSearch").addEventListener("input",e=>{
  const query=e.target.value.toLowerCase();

  document.querySelectorAll(".explore-card").forEach(card=>{
    card.style.display=card.textContent.toLowerCase().includes(query)?"":"none";
  });
});

// THEMES

function applyTheme(){
  document.body.dataset.theme=state.theme||"dark";
  document.documentElement.style.setProperty("--accent",state.accent||"#8b72ff");

  $("accentPicker").value=state.accent||"#8b72ff";
  $("animationToggle").checked=state.animations!==false;
  $("compactToggle").checked=!!state.compact;
  $("imagesToggle").checked=state.images!==false;

  document.body.classList.toggle("no-animations",state.animations===false);
  document.body.classList.toggle("compact",!!state.compact);
  document.body.classList.toggle("no-images",state.images===false);

  document.querySelectorAll("[data-theme]").forEach(btn=>{
    btn.style.outline=btn.dataset.theme===state.theme?"2px solid var(--accent)":"none";
  });
}

document.querySelectorAll(".theme-choice").forEach(btn=>{
  btn.addEventListener("click",()=>{
    state.theme=btn.dataset.theme;
    save();
    applyTheme();
    toast("Theme changed to "+btn.textContent.trim());
    record("Changed theme");
  });
});

$("accentPicker").addEventListener("input",e=>{
  state.accent=e.target.value;
  save();
  applyTheme();
});

$("animationToggle").addEventListener("change",e=>{
  state.animations=e.target.checked;
  save();
  applyTheme();
});

$("compactToggle").addEventListener("change",e=>{
  state.compact=e.target.checked;
  save();
  applyTheme();
});

$("imagesToggle").addEventListener("change",e=>{
  state.images=e.target.checked;
  save();
  applyTheme();
});

$("quickTheme").addEventListener("click",()=>{
  state.theme=state.theme==="light"?"dark":"light";
  save();
  applyTheme();
  toast("Appearance updated.");
});

// SAVED THEMES

function renderSavedThemes(){
  const container=$("savedThemes");
  container.innerHTML="";

  state.savedThemes.forEach((theme,index)=>{
    const btn=document.createElement("button");
    btn.className="saved-theme";
    btn.textContent=theme.name+" ↗";

    btn.addEventListener("click",()=>{
      state.theme=theme.theme;
      state.accent=theme.accent;
      save();
      applyTheme();
      toast("Theme loaded!");
    });

    container.appendChild(btn);
  });
}

$("saveTheme").addEventListener("click",()=>{
  const name=$("themeName").value.trim();

  if(!name) return toast("Enter a theme name.");

  state.savedThemes.push({
    name,
    theme:state.theme,
    accent:state.accent
  });

  save();
  renderSavedThemes();
  toast("Your theme has been saved.");
  $("themeName").value="";
});

// THEME EXPORT / IMPORT

$("exportTheme").addEventListener("click",()=>{
  const data={
    theme:state.theme,
    accent:state.accent,
    animations:state.animations,
    compact:state.compact,
    images:state.images,
    savedThemes:state.savedThemes
  };

  downloadJSON(data,"nexora-theme.json");
});

$("importTheme").addEventListener("change",async e=>{
  const file=e.target.files[0];
  if(!file) return;

  try{
    const data=JSON.parse(await file.text());

    if(!["dark","light","amoled","ocean","forest","sunset","rose","galaxy"].includes(data.theme)){
      throw new Error("Invalid theme");
    }

    if(!/^#[0-9a-f]{6}$/i.test(data.accent)){
      throw new Error("Invalid colour");
    }

    state.theme=data.theme;
    state.accent=data.accent;
    state.animations=data.animations!==false;
    state.compact=!!data.compact;
    state.images=data.images!==false;
    state.savedThemes=Array.isArray(data.savedThemes)?data.savedThemes:[];

    save();
    applyTheme();
    renderSavedThemes();
    toast("Theme imported!");
  }catch{
    toast("Invalid theme file.");
  }

  e.target.value="";
});

$("resetTheme").addEventListener("click",()=>{
  if(!confirm("Reset appearance to defaults?")) return;

  state.theme="dark";
  state.accent="#8b72ff";
  state.animations=true;
  state.compact=false;
  state.images=true;

  save();
  applyTheme();
  toast("Theme reset.");
});

// DATA EXPORT

function downloadJSON(data,filename){
  const blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"});
  const url=URL.createObjectURL(blob);
  const a=document.createElement("a");
  a.href=url;
  a.download=filename;
  a.click();
  URL.revokeObjectURL(url);
}

$("downloadData").addEventListener("click",()=>{
  downloadJSON(state,"nexora-my-data.json");
  toast("Data export prepared.");
});

// RESET

$("resetData").addEventListener("click",()=>{
  if(!confirm("This will remove your local Nexora data. Continue?")) return;

  localStorage.removeItem(KEY);
  localStorage.removeItem("nexora_accounts");
  location.reload();
});

// INITIALIZE

applyTheme();
updateDashboard();
renderProfile();
renderNotifications();
renderActivity();
renderFavorites();
renderSavedThemes();
renderPremium();
updateSubscription();

document.querySelectorAll(".page").forEach(p=>p.classList.remove("active"));
$("dashboard").classList.add("active");

document.querySelectorAll(".nav-item").forEach(b=>{
  b.classList.toggle("active",b.dataset.page==="dashboard");
});

console.log("NEXORA initialized successfully.");
