// ===============================
// STEP 4 – IDENTITY + POSTS (CLEAN & FINAL)
// ===============================

// DOM Elements
const onboarding = document.getElementById("onboarding");
const joinBtn = document.getElementById("joinBtn");
const clubSelect = document.getElementById("clubSelect");

const textarea = document.querySelector(".composer textarea");
const postBtn = document.querySelector(".composer button");
const postsContainer = document.querySelector(".posts-container");

// Storage keys (single source of truth)
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
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (seconds < 60) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  if (hours < 24) return `${hours} hr ago`;

  return new Date(timestamp).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
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
      <span style="color:#6b7280;font-size:12px;">
        · ${formatTime(post.time)}
      </span>
    </p>
    <p>${post.text}</p>
    <button class="like-btn">❤️ ${post.likes}</button>
  `;

  postsContainer.prepend(article); // ✅ latest on top, profile stays fixed
}

function loadPosts() {
  const posts = getPosts();
  posts.forEach(renderPost);
}

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
  posts.unshift(post);
  savePosts(posts);

  renderPost(post);
  textarea.value = "";
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

  loadPosts();
});
