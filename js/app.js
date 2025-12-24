// ===============================
// STEP 4 – UNIFIED IDENTITY + POSTS
// ===============================

// DOM Elements
const onboarding = document.getElementById("onboarding");
const joinBtn = document.getElementById("joinBtn");
const clubSelect = document.getElementById("clubSelect");
const postBtn = document.querySelector(".composer button");
const textarea = document.querySelector(".composer textarea");
const feed = document.querySelector(".feed");

// Storage keys (SINGLE SOURCE OF TRUTH)
const USER_KEY = "openli_user";
const POST_KEY = "openli_posts";
const COUNT_PREFIX = "openli_count_";

// ===============================
// USER SYSTEM
// ===============================

// Get user
function getUser() {
  return JSON.parse(localStorage.getItem(USER_KEY));
}

// Save user
function saveUser(user) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

// Generate unique ID per club
function generateUserId(club) {
  const key = `${COUNT_PREFIX}${club}`;
  let count = localStorage.getItem(key);
  count = count ? Number(count) + 1 : 1;
  localStorage.setItem(key, count);
  return `${club}-${count}`;
}

// Show user in UI
function showUser(user) {
  const nameEl = document.querySelector(".user-info strong");
  const groupEl = document.querySelector(".user-info span");

  if (nameEl && groupEl) {
    nameEl.textContent = user.id;
    groupEl.textContent = `Group: ${user.club}`;
  }
}

// ===============================
// ONBOARDING
// ===============================

joinBtn.addEventListener("click", () => {
  const club = clubSelect.value;

  if (!club) {
    alert("Please select a club");
    return;
  }

  const user = {
    club,
    id: generateUserId(club)
  };

  saveUser(user);
  onboarding.classList.add("hidden");
  location.reload();
});

// ===============================
// POSTS SYSTEM
// ===============================

// Save post
function savePost(post) {
  const posts = JSON.parse(localStorage.getItem(POST_KEY)) || [];
  posts.unshift(post);
  localStorage.setItem(POST_KEY, JSON.stringify(posts));
}

// Load posts
function loadPosts() {
  const posts = JSON.parse(localStorage.getItem(POST_KEY)) || [];
  posts.forEach(renderPost);
}

// Render post
function renderPost(post) {
  const article = document.createElement("article");
  article.className = "post";

  article.innerHTML = `
    <p class="post-id"><strong>${post.id}</strong></p>
    <p>${post.text}</p>
    <button class="like-btn">❤️ ${post.likes}</button>
  `;

  feed.appendChild(article);
}

// Post button
postBtn.addEventListener("click", () => {
  const text = textarea.value.trim();
  if (!text) return;

  const user = getUser();
  if (!user) {
    alert("Please join a club first.");
    return;
  }

  const post = {
    id: user.id,
    club: user.club,
    text,
    likes: 0,
    time: Date.now()
  };

  savePost(post);
  renderPost(post);
  textarea.value = "";
});

// ===============================
// INIT ON LOAD
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
