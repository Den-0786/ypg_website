/**
 * Auto-logout utility for the YPG Website admin dashboard.
 * Monitors user activity and logs out after a period of inactivity.
 */

const INACTIVITY_TIMEOUT = 15 * 60 * 1000; // 15 minutes
const WARNING_BEFORE = 2 * 60 * 1000; // Show warning 2 minutes before logout

let inactivityTimer = null;
let warningTimer = null;
let warningOverlay = null;
let countdownInterval = null;
let onLogoutCallback = null;

const ACTIVITY_EVENTS = [
  "mousedown",
  "mousemove",
  "keydown",
  "scroll",
  "touchstart",
  "click",
];

function resetTimers() {
  clearTimeout(inactivityTimer);
  clearTimeout(warningTimer);
  clearInterval(countdownInterval);
  removeWarning();

  warningTimer = setTimeout(() => {
    showWarning();
  }, INACTIVITY_TIMEOUT - WARNING_BEFORE);

  inactivityTimer = setTimeout(() => {
    performLogout();
  }, INACTIVITY_TIMEOUT);
}

function showWarning() {
  if (warningOverlay) return;

  warningOverlay = document.createElement("div");
  warningOverlay.id = "auto-logout-warning";
  warningOverlay.style.cssText = `
    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0,0,0,0.7); z-index: 99999;
    display: flex; align-items: center; justify-content: center;
  `;

  let secondsLeft = Math.ceil(WARNING_BEFORE / 1000);

  warningOverlay.innerHTML = `
    <div style="background: white; border-radius: 12px; padding: 32px; max-width: 400px; width: 90%; text-align: center; box-shadow: 0 20px 60px rgba(0,0,0,0.3);">
      <div style="width: 48px; height: 48px; background: #f59e0b; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px;">
        <svg width="24" height="24" fill="none" stroke="white" stroke-width="2" viewBox="0 0 24 24"><path d="M12 9v4m0 4h.01M10.29 3.86l-8.58 14.85A2 2 0 003.44 21h17.12a2 2 0 001.73-2.99L13.71 3.86a2 2 0 00-3.42 0z"/></svg>
      </div>
      <h3 style="font-size: 18px; font-weight: 700; color: #1a1a2e; margin-bottom: 8px;">Session Expiring Soon</h3>
      <p style="color: #666; font-size: 14px; margin-bottom: 16px;">You will be logged out in <strong id="logout-countdown">${secondsLeft}</strong> seconds due to inactivity.</p>
      <button id="stay-logged-in-btn" style="background: #3b82f6; color: white; border: none; padding: 10px 24px; border-radius: 8px; font-weight: 600; cursor: pointer; font-size: 14px;">
        Stay Logged In
      </button>
    </div>
  `;

  document.body.appendChild(warningOverlay);

  document.getElementById("stay-logged-in-btn")?.addEventListener("click", () => {
    resetTimers();
  });

  countdownInterval = setInterval(() => {
    secondsLeft--;
    const el = document.getElementById("logout-countdown");
    if (el) el.textContent = secondsLeft;
    if (secondsLeft <= 0) {
      clearInterval(countdownInterval);
    }
  }, 1000);
}

function removeWarning() {
  if (warningOverlay) {
    warningOverlay.remove();
    warningOverlay = null;
  }
  clearInterval(countdownInterval);
}

function performLogout() {
  destroy();
  localStorage.removeItem("ypg_admin_authenticated");
  localStorage.removeItem("ypg_admin_user");
  localStorage.removeItem("ypg_admin_login_time");

  if (onLogoutCallback) {
    onLogoutCallback();
  } else {
    window.location.href = "/admin/login";
  }
}

function handleActivity() {
  // Only reset if no warning is showing (user must click "Stay Logged In" to dismiss)
  if (!warningOverlay) {
    resetTimers();
  }
}

function init(logoutCallback) {
  onLogoutCallback = logoutCallback || null;

  const isAuthenticated = localStorage.getItem("ypg_admin_authenticated");
  if (isAuthenticated !== "true") return;

  ACTIVITY_EVENTS.forEach((event) => {
    document.addEventListener(event, handleActivity, { passive: true });
  });

  resetTimers();
}

function destroy() {
  clearTimeout(inactivityTimer);
  clearTimeout(warningTimer);
  clearInterval(countdownInterval);
  removeWarning();

  ACTIVITY_EVENTS.forEach((event) => {
    document.removeEventListener(event, handleActivity);
  });

  onLogoutCallback = null;
}

const autoLogout = { init, destroy };
export default autoLogout;
