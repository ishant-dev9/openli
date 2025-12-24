// ===============================
// STEP 4 – Unified Identity System
// ===============================

// DOM Elements
const onboarding = document.getElementById("onboarding");
const joinBtn = document.getElementById("joinBtn");
const clubSelect = document.getElementById("clubSelect");

// Storage keys (single source of truth)
const USER_KEY = "openli_user";
const COUNT_PREFIX = "openli_count_";

// Get user from storage
function getUser() {
  return JSON.parse(localStorage.getItem(USER_KEY));
}

// Save user to storage
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

// Show user info in UI
function showUser(user) {
  const nameEl = document.querySelector(".user-info strong");
  const groupEl = document.querySelector(".user-info span");

  if (nameEl && groupEl) {
    nameEl.textContent = user.id;
    groupEl.textContent = `Group: ${user.club}`;
  }
}

// Handle onboarding join
joinBtn.addEventListener("click", () => {
  const club = clubSelect.value;

  if (!club) {
    alert("Please select a club");
    return;
  }

  const id = generateUserId(club);

  const user = { club, id };
  saveUser(user);

  onboarding.classList.add("hidden");
  location.reload();
});

// On page load
document.addEventListener("DOMContentLoaded", () => {
  const user = getUser();

  if (!user) {
    onboarding.classList.remove("hidden");
  } else {
    showUser(user);
  }
});
