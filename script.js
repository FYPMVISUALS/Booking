// ---------------- Video Cycling ----------------
function setupVideoCycle(columnSelector, interval = 5000) {
  const frames = Array.from(document.querySelectorAll(`${columnSelector} .video-frame`));
  const wrapper = document.querySelector(`${columnSelector} .video-wrapper`);
  if (!frames.length || !wrapper) return;

  let index = 0;
  let paused = false;

  frames.forEach((frame, i) => frame.style.opacity = i === 0 ? 1 : 0);

  function cycle() {
    if (paused) return;
    frames[index].style.opacity = 0;
    index = (index + 1) % frames.length;
    frames[index].style.opacity = 1;
  }

  setInterval(cycle, interval);

  wrapper.addEventListener('click', () => {
    paused = !paused;
    wrapper.style.outline = paused ? "2px solid #00ff66" : "none";
  });
}

// ---------------- Booking Form ----------------
const WEBAPP_URL = "https://script.google.com/macros/s/AKfycbzVwZEKQjeQ9iS38FORd7lGlcx7E4l1xOap_jJbdTY0oMuW9qblYaKYW3P0QcI-D69-/exec";

document.addEventListener("DOMContentLoaded", () => {
  // Initialize video cycles
  document.querySelectorAll('.samples').forEach((card, i) => setupVideoCycle(`.samples:nth-child(${i+1})`));

  // Autofill event type and scroll
  document.querySelectorAll('.samples').forEach(card => {
    card.addEventListener('click', () => {
      const eventType = card.dataset.type;
      const select = document.getElementById('eventType');
      select.value = eventType;
      document.getElementById('booking').scrollIntoView({ behavior: 'smooth' });
      select.focus();

      card.style.boxShadow = '0 0 25px #ffffff';
      setTimeout(() => (card.style.boxShadow = ''), 800);
    });
  });

  // Form submission
  const form = document.getElementById('quickBookingForm');
  const status = document.getElementById('status');
  const popup = document.getElementById('popup');

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const data = {
      name: document.getElementById('name').value.trim(),
      email: document.getElementById('email').value.trim(),
      date: document.getElementById('date').value,
      eventType: document.getElementById('eventType').value
    };

    status.textContent = "⏳ Sending...";
    status.style.color = "#888";

    try {
      // Use no-cors mode to prevent network error
      await fetch(WEBAPP_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      // Show success immediately since we can't read response in no-cors
      status.textContent = "✅ Booking submitted!";
      status.style.color = "limegreen";
      form.reset();

      popup.classList.add('show');
      setTimeout(() => popup.classList.remove('show'), 2500);

    } catch (err) {
      console.error(err);
      status.textContent = "❌ Network error, try again.";
      status.style.color = "red";
    }
  });
});
1