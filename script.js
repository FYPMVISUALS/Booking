const pendingVideoCycles = [];
const WEBAPP_URL = "https://script.google.com/macros/s/AKfycbzVwZEKQjeQ9iS38FORd7lGlcx7E4l1xOap_jJbdTY0oMuW9qblYaKYW3P0QcI-D69-/exec";

function setupVideoCycle(sectionSelector) {
  const section = document.querySelector(sectionSelector);
  if (!section) return;

  const frames = Array.from(section.querySelectorAll('.video-frame'));
  if (!frames.length) return;

  const logo = section.querySelector('.cycle-logo');
  let index = 0;
  const players = [];

  frames.forEach((frame, i) => {
    if (!frame.id) frame.id = `yt-player-${Math.random().toString(36).substr(2, 9)}`;
    frame.style.opacity = 0;
  });

  frames[0].style.opacity = 1;

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

    function cycleVideos() {
      const current = index;
      const next = (index + 1) % frames.length;

      // Smooth fade out current video
      frames[current].style.transition = "opacity 2s ease-in-out";
      frames[current].style.opacity = 0;

      // Smooth logo fade in
      if (logo) {
        logo.style.transition = "opacity 1.5s ease-in-out, transform 1.5s ease-in-out";
        logo.style.opacity = 1;
        logo.style.transform = "translate(-50%, -50%) scale(1.2) rotate(0deg)";
      }

      // After 3s show next video
      setTimeout(() => {
        frames[next].style.transition = "opacity 2s ease-in-out";
        frames[next].style.opacity = 1;
        players[next]?.playVideo();

        // Smooth logo fade out
        if (logo) {
          logo.style.opacity = 0;
          logo.style.transform = "translate(-50%, -50%) scale(0.8) rotate(-10deg)";
        }

        index = next;

        // Repeat cycle after 28s of video playback
        setTimeout(cycleVideos, 28000);
      }, 3000); // 3s logo display
    }

    setTimeout(cycleVideos, 28000);
  });
}

// YouTube API
window.onYouTubeIframeAPIReady = function () {
  pendingVideoCycles.forEach(init => init());
};

document.addEventListener("DOMContentLoaded", () => {
  if (!window.YT) {
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    document.body.appendChild(tag);
  }

  document.querySelectorAll(".samples").forEach((section, i) => {
    setupVideoCycle(`.samples:nth-child(${i + 1})`);
  });

  const playlistLinks = {
    "Promote the Brand": "https://youtube.com/playlist?list=PLLDO58AOnWdXisVF_9A4K5OlRAMx2jqg7&si=hDqBRY96TSuLWWwK",
    "Celebrate the Day": "https://youtube.com/playlist?list=PLLDO58AOnWdXacw6-Jivj5QtjT3loJOgX&si=MYPOyO2dTn6muyU7",
    "Record the Action": "https://youtube.com/playlist?list=PLLDO58AOnWdXJRqiOr9416VvSM2hICYmW&si=PAgeF66EU26LTWy0",
  };

  document.querySelectorAll(".samples").forEach(card => {
    card.addEventListener("click", () => {
      const eventType = card.dataset.type;
      const select = document.getElementById("eventType");
      select.value = eventType;
      document.getElementById("booking").scrollIntoView({ behavior: "smooth" });
      select.focus();

      card.style.boxShadow = "0 0 25px #ffffff";
      setTimeout(() => card.style.boxShadow = "", 800);

      window.open(playlistLinks[eventType], "_blank");
    });
  });

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
