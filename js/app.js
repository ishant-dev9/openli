// Check if user already onboarded
const userData = localStorage.getItem("openliUser");

const onboarding = document.getElementById("onboarding");
const joinBtn = document.getElementById("joinBtn");
const clubSelect = document.getElementById("clubSelect");

if (!userData) {
  onboarding.classList.remove("hidden");
}

// Generate unique ID per club
function generateId(club) {
  const key = `openli_${club}_count`;
  let count = localStorage.getItem(key);

  if (!count) {
    count = 1;
  } else {
    count = parseInt(count) + 1;
  }

  localStorage.setItem(key, count);
  return `${club}-${count}`;
}

joinBtn.addEventListener("click", () => {
  const club = clubSelect.value;

  if (!club) {
    alert("Please select a club");
    return;
  }

  const id = generateId(club);

  const user = {
    club,
    id
  };

  localStorage.setItem("openliUser", JSON.stringify(user));
  onboarding.classList.add("hidden");

  location.reload(); // refresh to apply identity
});
