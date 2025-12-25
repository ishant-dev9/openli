// =====================================
// OPENLI — FINAL STABLE CORE
// Identity • Posts • Likes • Comments
// Repost • Quote • Notifications • Filters
// =====================================

// ---------- DOM ----------
const onboarding = document.getElementById("onboarding");
const joinBtn = document.getElementById("joinBtn");
const clubSelect = document.getElementById("clubSelect");

const postInput = document.getElementById("postInput");
const postBtn = document.getElementById("postBtn");
const postsContainer = document.getElementById("postsContainer");

const userNameEl = document.getElementById("userName");
const userGroupEl = document.getElementById("userGroup");

const notifyBtn = document.getElementById("notifyBtn");
const notifyPanel = document.getElementById("notificationPanel");
const notifyList = document.getElementById("notificationList");
const notifyDot = document.getElementById("notifyDot");
const markAllReadBtn = document.getElementById("markAllRead");

const quoteModal = document.getElementById("quoteModal");
const quoteInput = document.getElementById("quoteInput");
const confirmQuote = document.getElementById("confirmQuote");
const cancelQuote = document.getElementById("cancelQuote");

// ---------- STORAGE KEYS ----------
const USER_KEY = "openli_user";
const POST_KEY = "openli_posts";
const NOTIF_KEY = "openli_notifications";
const COUNT_PREFIX = "openli_count_";

// ---------- HELPERS ----------
function getUser() {
  return JSON.parse(localStorage.getItem(USER_KEY));
}

function saveUser(user) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

function getPosts() {
  return JSON.parse(localStorage.getItem(POST_KEY)) || [];
}

function savePosts(posts) {
  localStorage.setItem(POST_KEY, JSON.stringify(posts));
}

// ---------- USER ID ----------
function generateUserId(club) {
  const key = COUNT_PREFIX + club;
  const count = Number(localStorage.getItem(key) || 0) + 1;
  localStorage.setItem(key, count);
  return `${club}-${count}`;
}

function showUser(user) {
  userNameEl.textContent = user.id;
  userGroupEl.textContent = `Group: ${user.club}`;
}

// ---------- ONBOARDING ----------
joinBtn.onclick = () => {
  const club = clubSelect.value;
  if (!club) return alert("Please select a club");

  const user = { club, id: generateUserId(club) };
  saveUser(user);
  onboarding.classList.add("hidden");
  location.reload();
};

// ---------- TIME ----------
function formatTime(t) {
  const s = Math.floor((Date.now() - t) / 1000);
  if (s < 10) return "just now";
  if (s < 60) return `${s} sec ago`;
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} hr ago`;
  return new Date(t).toLocaleDateString();
}

// ---------- NOTIFICATIONS ----------
function getNotifications() {
  return JSON.parse(localStorage.getItem(NOTIF_KEY)) || [];
}

function saveNotifications(list) {
  localStorage.setItem(NOTIF_KEY, JSON.stringify(list));
}

function addNotification(type, from, to) {
  if (from === to) return;
  const list = getNotifications();
  list.unshift({ type, from, time: Date.now(), read: false });
  saveNotifications(list);
  renderNotifications();
}

function renderNotifications() {
  const list = getNotifications();
  notifyList.innerHTML = "";
  let unread = false;

  list.forEach(n => {
    if (!n.read) unread = true;
    const div = document.createElement("div");
    div.className = `notification-item ${n.read ? "" : "unread"}`;

    let text = "";
    if (n.type === "like") text = `${n.from} liked your post`;
    if (n.type === "comment") text = `${n.from} commented on your post`;
    if (n.type === "repost") text = `${n.from} reposted your thought`;

    div.innerHTML = `${text} <span>· ${formatTime(n.time)}</span>`;
    notifyList.appendChild(div);
  });

  notifyDot.classList.toggle("hidden", !unread);
}

notifyBtn.onclick = () => notifyPanel.classList.toggle("hidden");

markAllReadBtn.onclick = () => {
  const list = getNotifications().map(n => ({ ...n, read: true }));
  saveNotifications(list);
  renderNotifications();
};

// ---------- POSTS ----------
let quoteTarget = null;

function renderAllPosts() {
  postsContainer.innerHTML = "";
  const posts = getPosts().sort((a, b) => b.time - a.time);
  const user = getUser();

  posts.forEach(post => {
    const liked = user && post.likes.includes(user.id);

    const article = document.createElement("article");
    article.className = "post";

    article.innerHTML = `
      ${post.repostOf ? `<div class="repost-label">🔁 Reposted from ${post.repostOf}</div>` : ""}

      <div class="post-header">
        <strong>${post.id}</strong>
        <span>· ${formatTime(post.time)}</span>
      </div>

      ${post.quoteText ? `<div class="quote-box">${post.quoteText}</div>` : ""}
      <p class="post-text">${post.text}</p>

      <div class="post-actions">
        <button class="like-btn ${liked ? "liked" : ""}">❤️ ${post.likes.length}</button>
        <button class="comment-btn">💬 ${post.comments.length}</button>
        <button class="repost-btn">🔁 ${post.repostedBy.length}</button>
        <button class="quote-btn">📝</button>
      </div>

      <div class="comments hidden">
        ${post.comments.map(c => `
          <div class="comment">
            <strong>${c.id}</strong>
            <span>· ${formatTime(c.time)}</span>
            <p>${c.text}</p>
          </div>
        `).join("")}

        <div class="comment-input">
          <input placeholder="Write a comment…" />
          <button>Send</button>
        </div>
      </div>
    `;

    // LIKE (ONE PER USER)
    article.querySelector(".like-btn").onclick = () => {
      if (!user || liked) return;
      post.likes.push(user.id);
      savePosts(posts);
      addNotification("like", user.id, post.id);
      renderAllPosts();
    };

    // COMMENTS
    const commentsBox = article.querySelector(".comments");
    article.querySelector(".comment-btn").onclick = () =>
      commentsBox.classList.toggle("hidden");

    article.querySelector(".comment-input button").onclick = () => {
      const input = article.querySelector(".comment-input input");
      if (!input.value.trim()) return;

      post.comments.push({
        id: user.id,
        text: input.value.trim(),
        time: Date.now()
      });

      savePosts(posts);
      addNotification("comment", user.id, post.id);
      renderAllPosts();
    };

    // REPOST
    article.querySelector(".repost-btn").onclick = () => {
      if (!user || post.repostedBy.includes(user.id)) return;

      posts.push({
        id: user.id,
        club: user.club,
        text: post.text,
        repostOf: post.id,
        quoteText: null,
        likes: [],
        comments: [],
        repostedBy: [],
        time: Date.now()
      });

      post.repostedBy.push(user.id);
      savePosts(posts);
      addNotification("repost", user.id, post.id);
      renderAllPosts();
    };

    // QUOTE
    article.querySelector(".quote-btn").onclick = () => {
      quoteTarget = post;
      quoteInput.value = "";
      quoteModal.classList.remove("hidden");
    };

    postsContainer.appendChild(article);
  });
}

// ---------- QUOTE CONFIRM ----------
confirmQuote.onclick = () => {
  if (!quoteTarget) return;
  const user = getUser();
  const posts = getPosts();

  posts.push({
    id: user.id,
    club: user.club,
    text: quoteTarget.text,
    quoteText: quoteInput.value.trim(),
    repostOf: quoteTarget.id,
    likes: [],
    comments: [],
    repostedBy: [],
    time: Date.now()
  });

  savePosts(posts);
  addNotification("repost", user.id, quoteTarget.id);
  quoteModal.classList.add("hidden");
  renderAllPosts();
};

cancelQuote.onclick = () => quoteModal.classList.add("hidden");

// ---------- CREATE POST ----------
function createPost() {
  const text = postInput.value.trim();
  if (!text) return;

  const user = getUser();
  if (!user) return alert("Join a club first");

  const posts = getPosts();
  posts.push({
    id: user.id,
    club: user.club,
    text,
    time: Date.now(),
    likes: [],
    comments: [],
    repostedBy: [],
    repostOf: null,
    quoteText: null
  });

  savePosts(posts);
  postInput.value = "";
  renderAllPosts();
}

postBtn.onclick = createPost;
postInput.onkeydown = e => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    createPost();
  }
};

// ---------- INIT ----------
document.addEventListener("DOMContentLoaded", () => {
  const user = getUser();
  if (!user) onboarding.classList.remove("hidden");
  else showUser(user);

  renderAllPosts();
  renderNotifications();
});