const workspace = document.getElementById("workspace");
const splitter = document.getElementById("splitter");
const defaultApp = new URL("./app/app.html", window.location.href).href;
const externalSandbox = [
  "allow-downloads",
  "allow-forms",
  "allow-modals",
  "allow-popups",
  "allow-popups-to-escape-sandbox",
  "allow-presentation",
  "allow-same-origin",
  "allow-scripts"
].join(" ");

function normalizeURL(value) {
  const url = new URL(value || defaultApp, window.location.href);

  if (url.origin !== window.location.origin && url.protocol !== "https:") {
    throw new Error("External panes must use HTTPS");
  }

  return url;
}

function loadPane(name, value, updateLocation = true) {
  const frame = document.getElementById(`${name}-frame`);
  const input = document.getElementById(`${name}-url`);
  const url = normalizeURL(value);

  if (url.origin === window.location.origin) {
    frame.removeAttribute("sandbox");
  } else {
    frame.setAttribute("sandbox", externalSandbox);
  }

  frame.referrerPolicy = "strict-origin-when-cross-origin";
  frame.src = url.href;
  input.value = url.href;

  if (updateLocation) {
    const params = new URLSearchParams(window.location.search);
    params.set(name, url.href);
    history.replaceState(null, "", `${window.location.pathname}?${params}${window.location.hash}`);
  }
}

for (const form of document.querySelectorAll(".pane-control")) {
  form.addEventListener("submit", event => {
    event.preventDefault();
    const name = form.dataset.pane;

    try {
      loadPane(name, new FormData(form).get("url"));
    } catch (error) {
      window.alert(error.message);
    }
  });
}

const initialParams = new URLSearchParams(window.location.search);
loadPane("left", initialParams.get("left") || defaultApp, false);
loadPane("right", initialParams.get("right") || defaultApp, false);

function setSplit(clientX) {
  const rect = workspace.getBoundingClientRect();
  const percent = ((clientX - rect.left) / rect.width) * 100;
  const clamped = Math.min(85, Math.max(15, percent));
  workspace.style.setProperty("--left", `${clamped}%`);
}

splitter.addEventListener("pointerdown", event => {
  splitter.setPointerCapture(event.pointerId);
  document.body.classList.add("dragging");
  setSplit(event.clientX);
});

splitter.addEventListener("pointermove", event => {
  if (splitter.hasPointerCapture(event.pointerId)) {
    setSplit(event.clientX);
  }
});

splitter.addEventListener("pointerup", event => {
  if (splitter.hasPointerCapture(event.pointerId)) {
    splitter.releasePointerCapture(event.pointerId);
  }
  document.body.classList.remove("dragging");
});

splitter.addEventListener("pointercancel", () => {
  document.body.classList.remove("dragging");
});

splitter.addEventListener("keydown", event => {
  const current = Number.parseFloat(getComputedStyle(workspace).getPropertyValue("--left")) || 50;

  if (event.key === "ArrowLeft") {
    workspace.style.setProperty("--left", `${Math.max(15, current - 2)}%`);
    event.preventDefault();
  } else if (event.key === "ArrowRight") {
    workspace.style.setProperty("--left", `${Math.min(85, current + 2)}%`);
    event.preventDefault();
  }
});
