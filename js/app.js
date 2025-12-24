// =====================================
// OPENLI — STEP 5.5 (FINAL COMMENTS FIX)
// Identity + Posts + Flat Comments
// =====================================

// ---------- DOM ----------
const onboarding = document.getElementById("onboarding");
const joinBtn = document.getElementById("joinBtn");
const clubSelect = document.getElementById("clubSelect");

const postInput = document.getElementById("postInput");
const postBtn = document.getElementById("postBtn");
const postsContainer = document.getElementById("postsContainer");

// ---------- STORAGE ----------
const USER_KEY = "openli_user";
const POST_KEY = "openli_posts";
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
function formatTime(t) {
  const s = Math.floor((Date.now() - t) / 1000);
  if (s < 10) return "just now";
  if (s < 60) return `${s} sec ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} hr ago`;
  return new Date(t).toLocaleDateString();
}

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

  posts.forEach((post, index) => {
    const article = document.createElement("article");
    article.className = "post";

    article.innerHTML = `
      <p class="post-id">
        <strong>${post.id}</strong>
        <span class="post-time"> · ${formatTime(post.time)}</span>
      </p>

      <p class="post-text">${post.text}</p>

      <div class="post-actions">
        <button class="like-btn">❤️ ${post.likes}</button>
        <button class="comment-btn">💬 ${post.comments.length}</button>
      </div>

      <div class="comments-box hidden">
        <div class="comments-list"></div>

        <div class="comment-input">
          <input type="text" placeholder="Write a comment…" />
          <button>Send</button>
        </div>
      </div>
    `;

    // ----- LIKE -----
    article.querySelector(".like-btn").onclick = () => {
      post.likes++;
      savePosts(posts);
      renderAllPosts();
    };

    // ----- COMMENT TOGGLE -----
    const commentsBox = article.querySelector(".comments-box");
    article.querySelector(".comment-btn").onclick = () => {
      commentsBox.classList.toggle("hidden");
    };

    // ----- RENDER COMMENTS -----
    const list = article.querySelector(".comments-list");
    post.comments.forEach(c => {
      const div = document.createElement("div");
      div.className = "comment";
      div.innerHTML = `<strong>${c.id}</strong> ${c.text}
        <span> · ${formatTime(c.time)}</span>`;
      list.appendChild(div);
    });

    // ----- ADD COMMENT -----
    const input = article.querySelector(".comment-input input");
    const send = article.querySelector(".comment-input button");

    const addComment = () => {
      const text = input.value.trim();
      if (!text) return;

      const user = getUser();
      post.comments.push({
        id: user.id,
        text,
        time: Date.now()
      });

      savePosts(posts);
      renderAllPosts();
    };

    send.onclick = addComment;
    input.onkeydown = e => {
      if (e.key === "Enter") addComment();
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
  if (!user) return alert("Join club first");

  const posts = getPosts();
  posts.push({
    id: user.id,
    text,
    time: Date.now(),
    likes: 0,
    comments: []
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
});
