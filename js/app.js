// ===============================
// OPENLI — STEP 4 (FINAL, STABLE)
// Identity + Posts System
// ===============================

// ---------- DOM ----------
const onboarding = document.getElementById("onboarding");
const joinBtn = document.getElementById("joinBtn");
const clubSelect = document.getElementById("clubSelect");

const textarea = document.querySelector(".composer textarea");
const postBtn = document.querySelector(".composer button");
const postsContainer = document.querySelector(".posts-container");

// ---------- STORAGE KEYS ----------
const USER_KEY = "openli_user";
const POST_KEY = "openli_posts";
const COUNT_PREFIX = "openli_count_";

// ===============================
// USER SYSTEM
// ===============================
function getUser() {
  return JSON.parse(localStorage.getItem(USER_KEY));
}

function saveUser(user) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

function generateUserId(club) {
  const key = `${COUNT_PREFIX}${club}`;
  let count = localStorage.getItem(key);
  count = count ? Number(count) + 1 : 1;
  localStorage.setItem(key, count);
  return `${club}-${count}`;
}

function showUser(user) {
  document.querySelector(".user-info strong").textContent = user.id;
  document.querySelector(".user-info span").textContent = `Group: ${user.club}`;
}

// ===============================
// ONBOARDING
// ===============================
joinBtn.addEventListener("click", () => {
  const club = clubSelect.value;
  if (!club) return alert("Please select a club");

  const user = {
    club,
    id: generateUserId(club)
  };

  saveUser(user);
  onboarding.classList.add("hidden");
  location.reload();
});

// ===============================
// TIME FORMATTER
// ===============================
function formatTime(timestamp) {
  const diff = Date.now() - timestamp;
  const sec = Math.floor(diff / 1000);

  if (sec < 10) return "just now";
  if (sec < 60) return `${sec} sec ago`;

  const min = Math.floor(sec / 60);
  if (min < 60) return `${min} min ago`;

  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} hr ago`;

  const day = Math.floor(hr / 24);
  if (day < 7) return `${day} day${day > 1 ? "s" : ""} ago`;

  return new Date(timestamp).toLocaleDateString();
}

// ===============================
// POSTS SYSTEM
// ===============================
function getPosts() {
  return JSON.parse(localStorage.getItem(POST_KEY)) || [];
}

function savePosts(posts) {
  localStorage.setItem(POST_KEY, JSON.stringify(posts));
}

function renderPost(post) {
  const article = document.createElement("article");
  article.className = "post";

  article.innerHTML = `
    <p class="post-id">
      <strong>${post.id}</strong>
      <span class="post-time"> · ${formatTime(post.time)}</span>
    </p>
    <p class="post-text">${post.text}</p>
    <button class="like-btn">❤️ ${post.likes}</button>
  `;

  postsContainer.appendChild(article);
}

function renderAllPosts() {
  postsContainer.innerHTML = "";

  const posts = getPosts()
    .sort((a, b) => b.time - a.time); // 🔥 ALWAYS newest first

  posts.forEach(renderPost);
}

// ===============================
// CREATE POST
// ===============================
function createPost() {
  const text = textarea.value.trim();
  if (!text) return;

  const user = getUser();
  if (!user) return alert("Please join a club first.");

  const post = {
    id: user.id,
    club: user.club,
    text,
    likes: 0,
    time: Date.now()
  };

  const posts = getPosts();
  posts.push(post); // order fixed by sorting
  savePosts(posts);

  textarea.value = "";
  renderAllPosts();
}

// Button click
postBtn.addEventListener("click", createPost);

// ENTER to post (Shift+Enter = new line)
textarea.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    createPost();
  }
});

// ===============================
// INIT
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  const user = getUser();

  if (!user) {
    onboarding.classList.remove("hidden");
  } else {
    showUser(user);
  }

  renderAllPosts(); // 🔥 symmetry NEVER breaks now
});
