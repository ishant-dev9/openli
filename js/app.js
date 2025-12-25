// =====================================
// OPENLI — STEP 7 FINAL STABLE BUILD
// Identity + Posts + Likes + Comments + Reposts + Notifications
// =====================================

// ---------- DOM ----------
const onboarding = document.getElementById("onboarding");
const joinBtn = document.getElementById("joinBtn");
const clubSelect = document.getElementById("clubSelect");

const postInput = document.getElementById("postInput");
const postBtn = document.getElementById("postBtn");
const postsContainer = document.getElementById("postsContainer");

const notifyBtn = document.getElementById("notifyBtn");
const notifyPanel = document.getElementById("notificationPanel");
const notifyList = document.getElementById("notificationList");
const notifyDot = document.getElementById("notifyDot");
const markAllReadBtn = document.getElementById("markAllRead");

// ---------- STORAGE KEYS ----------
const USER_KEY = "openli_user";
const POST_KEY = "openli_posts";
const NOTIF_KEY = "openli_notifications";
const COUNT_PREFIX = "openli_count_";

// =====================================
// USER SYSTEM
// =====================================
function getUser() {
  return JSON.parse(localStorage.getItem(USER_KEY));
}

function saveUser(user) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

function generateUserId(club) {
  const key = COUNT_PREFIX + club;
  let count = Number(localStorage.getItem(key) || 0) + 1;
  localStorage.setItem(key, count);
  return `${club}-${count}`;
}

function showUser(user) {
  document.getElementById("userName").textContent = user.id;
  document.getElementById("userGroup").textContent = `Group: ${user.club}`;
}

// =====================================
// ONBOARDING
// =====================================
joinBtn.onclick = () => {
  const club = clubSelect.value;
  if (!club) return alert("Select a club");

  const user = { club, id: generateUserId(club) };
  saveUser(user);
  onboarding.classList.add("hidden");
  location.reload();
};

// =====================================
// TIME FORMAT
// =====================================
function formatTime(time) {
  const diff = Math.floor((Date.now() - time) / 1000);
  if (diff < 10) return "just now";
  if (diff < 60) return `${diff} sec ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
  return new Date(time).toLocaleDateString();
}

// =====================================
// NOTIFICATIONS
// =====================================
function getNotifications() {
  return JSON.parse(localStorage.getItem(NOTIF_KEY)) || [];
}

function saveNotifications(list) {
  localStorage.setItem(NOTIF_KEY, JSON.stringify(list));
}

function addNotification(type, from, postAuthor) {
  const user = getUser();
  if (!user || postAuthor === user.id) return;

  const list = getNotifications();
  list.unshift({
    type,
    from,
    time: Date.now(),
    read: false
  });

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

    div.innerHTML = `${text} <span class="notif-time">· ${formatTime(n.time)}</span>`;
    notifyList.appendChild(div);
  });

  notifyDot.classList.toggle("hidden", !unread);
}

markAllReadBtn.onclick = () => {
  const list = getNotifications().map(n => ({ ...n, read: true }));
  saveNotifications(list);
  renderNotifications();
};

notifyBtn.onclick = () => {
  notifyPanel.classList.toggle("hidden");
};

// =====================================
// POSTS STORAGE
// =====================================
function getPosts() {
  return JSON.parse(localStorage.getItem(POST_KEY)) || [];
}

function savePosts(posts) {
  localStorage.setItem(POST_KEY, JSON.stringify(posts));
}

// =====================================
// RENDER POSTS
// =====================================
function renderAllPosts() {
  postsContainer.innerHTML = "";
  const posts = getPosts().sort((a, b) => b.time - a.time);
  const currentUser = getUser();

  posts.forEach((post, index) => {
    const liked = currentUser && post.likes.includes(currentUser.id);

    const article = document.createElement("article");
    article.className = "post";

    article.innerHTML = `
      ${post.repostOf ? `<div class="repost-info">🔁 Reposted from ${post.repostOf}</div>` : ""}
      ${post.quoteText ? `<div class="quote-box">${post.quoteText}</div>` : ""}

      <div class="post-header">
        <strong>${post.id}</strong>
        <span class="post-time">· ${formatTime(post.time)}</span>
      </div>

      <p class="post-text">${post.text}</p>

      <div class="post-actions">
        <button class="like-btn ${liked ? "liked" : ""}">❤️ ${post.likes.length}</button>
        <button class="comment-toggle">💬 ${post.comments.length}</button>
        <button class="repost-btn">🔁</button>
        <button class="quote-btn">💬🔁</button>
      </div>

      <div class="comments-box hidden">
        <div class="comments-list"></div>
        <div class="comment-input">
          <input type="text" placeholder="Write a comment…" />
          <button>Send</button>
        </div>
      </div>
    `;

    // LIKE (ONE TIME ONLY)
    article.querySelector(".like-btn").onclick = () => {
      if (!currentUser) return alert("Join a club first");
      if (post.likes.includes(currentUser.id)) return;

      post.likes.push(currentUser.id);
      savePosts(posts);
      addNotification("like", currentUser.id, post.id);
      renderAllPosts();
    };

    // COMMENTS
    const commentsBox = article.querySelector(".comments-box");
    article.querySelector(".comment-toggle").onclick = () => {
      commentsBox.classList.toggle("hidden");
    };

    const commentsList = article.querySelector(".comments-list");
    post.comments.forEach(c => {
      const div = document.createElement("div");
      div.className = "comment";
      div.innerHTML = `
        <strong>${c.id}</strong>
        <span> · ${formatTime(c.time)}</span>
        <p>${c.text}</p>
      `;
      commentsList.appendChild(div);
    });

    const input = article.querySelector(".comment-input input");
    const send = article.querySelector(".comment-input button");

    send.onclick = () => {
      const text = input.value.trim();
      if (!text) return;

      post.comments.push({
        id: currentUser.id,
        text,
        time: Date.now()
      });

      savePosts(posts);
      addNotification("comment", currentUser.id, post.id);
      renderAllPosts();
    };

    // REPOST
    article.querySelector(".repost-btn").onclick = () => {
      posts.push({
        id: currentUser.id,
        text: post.text,
        time: Date.now(),
        likes: [],
        comments: [],
        repostOf: post.id,
        quoteText: null
      });

      savePosts(posts);
      addNotification("repost", currentUser.id, post.id);
      renderAllPosts();
    };

    // QUOTE
    article.querySelector(".quote-btn").onclick = () => {
      const quote = prompt("Add your quote");
      if (quote === null) return;

      posts.push({
        id: currentUser.id,
        text: post.text,
        time: Date.now(),
        likes: [],
        comments: [],
        repostOf: post.id,
        quoteText: quote.trim()
      });

      savePosts(posts);
      addNotification("repost", currentUser.id, post.id);
      renderAllPosts();
    };

    postsContainer.appendChild(article);
  });
}

// =====================================
// CREATE POST
// =====================================
function createPost() {
  const text = postInput.value.trim();
  if (!text) return;

  const user = getUser();
  if (!user) return alert("Join a club first");

  const posts = getPosts();
  posts.push({
    id: user.id,
    text,
    time: Date.now(),
    likes: [],
    comments: [],
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

// =====================================
// INIT
// =====================================
document.addEventListener("DOMContentLoaded", () => {
  const user = getUser();
  if (!user) onboarding.classList.remove("hidden");
  else showUser(user);

  renderAllPosts();
  renderNotifications();
});
