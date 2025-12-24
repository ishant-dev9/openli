// ===============================
// STEP 4 – UNIFIED IDENTITY + POSTS + TIME
// ===============================

// DOM Elements
const onboarding = document.getElementById("onboarding");
const joinBtn = document.getElementById("joinBtn");
const clubSelect = document.getElementById("clubSelect");
const postBtn = document.querySelector(".composer button");
const textarea = document.querySelector(".composer textarea");
const feed = document.querySelector(".feed");

// Storage keys
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
// TIME UTILITIES
// ===============================

function getRelativeTime(timestamp) {
    const diff = Date.now() - timestamp;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    if (seconds < 10) return "Just now";
    if (seconds < 60) return `${seconds} sec ago`;
    if (minutes < 60) return `${minutes} min ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    if (weeks < 5) return `${weeks} week${weeks > 1 ? "s" : ""} ago`;
    if (months < 12) return `${months} month${months > 1 ? "s" : ""} ago`;
    return `${years} year${years > 1 ? "s" : ""} ago`;
}

function formatFullDate(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric"
    });
}

// ===============================
// POSTS SYSTEM
// ===============================

function savePost(post) {
    const posts = JSON.parse(localStorage.getItem(POST_KEY)) || [];
    posts.unshift(post);
    localStorage.setItem(POST_KEY, JSON.stringify(posts));
}

function loadPosts() {
    const posts = JSON.parse(localStorage.getItem(POST_KEY)) || [];
    posts.forEach(renderPost);
}

function renderPost(post) {
    const article = document.createElement("article");
    article.className = "post";

    article.innerHTML = `
    <div class="post-meta">
      <strong>${post.id}</strong>
      <span class="post-time" title="Posted on ${formatFullDate(post.time)}">
        • ${getRelativeTime(post.time)}
      </span>
    </div>
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
// Enter key to post (Shift + Enter = new line)
textarea.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault(); // stop new line
        postBtn.click();    // trigger post
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
