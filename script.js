// ---------------- Video Cycling ----------------

// Store pending video cycles for when API loads
const pendingVideoCycles = [];

function setupVideoCycle(sectionSelector, interval = 20000) {
  const section = document.querySelector(sectionSelector);
  if (!section) return;

  const frames = Array.from(section.querySelectorAll('.video-frame'));
  if (!frames.length) return;

  let index = 0;
  const players = [];

  // Assign unique IDs and initial opacity
  frames.forEach((frame, i) => {
    if (!frame.id) frame.id = `yt-player-${Math.random().toString(36).substr(2, 9)}`;
    frame.style.opacity = i === 0 ? 1 : 0;
  });

  // Save initializer until YouTube API loads
  pendingVideoCycles.push(() => {
    frames.forEach((frame, i) => {
      players[i] = new YT.Player(frame.id, {
        events: {
          onReady: (event) => {
            if (i === 0) event.target.playVideo();
          }
        }
      });
    });

    // Cycle videos every 'interval' milliseconds
    setInterval(() => {
      players[index]?.pauseVideo();
      frames[index].style.opacity = 0;

      index = (index + 1) % frames.length;

      frames[index].style.opacity = 1;
      players[index]?.playVideo();
    }, interval);
  });
}

// ---------------- YouTube API Callback ----------------
window.onYouTubeIframeAPIReady = function () {
  pendingVideoCycles.forEach(init => init());
};

// ---------------- DOMContentLoaded ----------------
const WEBAPP_URL = "https://script.google.com/macros/s/AKfycbzVwZEKQjeQ9iS38FORd7lGlcx7E4l1xOap_jJbdTY0oMuW9qblYaKYW3P0QcI-D69-/exec";

document.addEventListener("DOMContentLoaded", () => {

  // Load YouTube API once
  if (!window.YT) {
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    document.body.appendChild(tag);
  }

  // Initialize all video cycles
  document.querySelectorAll(".samples").forEach((section, i) => {
    setupVideoCycle(`.samples:nth-child(${i + 1})`, 20000);
  });

  // Playlist links
  const playlistLinks = {
    "Promote the Brand":
      "https://youtube.com/playlist?list=PLLDO58AOnWdXisVF_9A4K5OlRAMx2jqg7&si=hDqBRY96TSuLWWwK",
    "Celebrate the Day":
      "https://youtube.com/playlist?list=PLLDO58AOnWdXacw6-Jivj5QtjT3loJOgX&si=MYPOyO2dTn6muyU7",
    "Record the Action":
      "https://youtube.com/playlist?list=PLLDO58AOnWdXJRqiOr9416VvSM2hICYmW&si=PAgeF66EU26LTWy0",
  };

  // Make entire sample card clickable
  document.querySelectorAll(".samples").forEach(card => {
    card.addEventListener("click", () => {
      const eventType = card.dataset.type;

      // Autofill event type
      const select = document.getElementById("eventType");
      select.value = eventType;
      document.getElementById("booking").scrollIntoView({ behavior: "smooth" });
      select.focus();

      // Highlight effect
      card.style.boxShadow = "0 0 25px #ffffff";
      setTimeout(() => card.style.boxShadow = "", 800);

      // Open playlist in new tab
      window.open(playlistLinks[eventType], "_blank");
    });
  });

  // Form submission
  const form = document.getElementById("quickBookingForm");
  const status = document.getElementById("status");
  const popup = document.getElementById("popup");

  form.addEventListener("submit", async e => {
    e.preventDefault();

    const data = {
      name: document.getElementById("name").value.trim(),
      email: document.getElementById("email").value.trim(),
      date: document.getElementById("date").value,
      eventType: document.getElementById("eventType").value,
    };

    status.textContent = "⏳ Sending...";
    status.style.color = "#888";

    try {
      await fetch(WEBAPP_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      status.textContent = "✅ Booking submitted!";
      status.style.color = "limegreen";
      form.reset();

      popup.classList.add("show");
      setTimeout(() => popup.classList.remove("show"), 2500);
    } catch (err) {
      console.error(err);
      status.textContent = "❌ Network error, try again.";
      status.style.color = "red";
    }
  });
});
