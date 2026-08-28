const workspace = document.getElementById("workspace");
const splitter = document.getElementById("splitter");
const defaultLeft = new URL("./app/app.html", window.location.href).href;
const defaultRightURL = new URL("./app/app.html", window.location.href);
defaultRightURL.searchParams.set("theme", "dark");
const defaultRight = defaultRightURL.href;
const darkStylesheet = new URL("./app/dark.css", window.location.href).href;
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
const validViews = new Set(["split", "left", "right"]);
let currentView = "split";
let splitPercent = 50;

function normalizeURL(value, fallback) {
  const url = new URL(value || fallback, window.location.href);

  if (url.origin !== window.location.origin && url.protocol !== "https:") {
    throw new Error("External panes must use HTTPS");
  }

  return url;
}

function replaceQueryParam(name, value) {
  const params = new URLSearchParams(window.location.search);
  params.set(name, value);
  history.replaceState(null, "", `${window.location.pathname}?${params}${window.location.hash}`);
}

function applySameOriginTheme(frame, url) {
  if (url.origin !== window.location.origin) {
    return;
  }

  const document = frame.contentDocument;
  const dark = url.searchParams.get("theme") === "dark";
  let stylesheet = document.getElementById("workspace-dark-theme");

  if (dark && !stylesheet) {
    stylesheet = document.createElement("link");
    stylesheet.id = "workspace-dark-theme";
    stylesheet.rel = "stylesheet";
    stylesheet.href = darkStylesheet;
    document.head.appendChild(stylesheet);
  } else if (!dark && stylesheet) {
    stylesheet.remove();
  }

  document.body.classList.toggle("dark-theme", dark);
}

function loadPane(name, value, fallback, updateLocation = true) {
  const frame = document.getElementById(`${name}-frame`);
  const input = document.getElementById(`${name}-url`);
  const url = normalizeURL(value, fallback);

  if (url.origin === window.location.origin) {
    frame.removeAttribute("sandbox");
  } else {
    frame.setAttribute("sandbox", externalSandbox);
  }

  frame.referrerPolicy = "strict-origin-when-cross-origin";
  frame.onload = () => applySameOriginTheme(frame, url);
  frame.src = url.href;
  input.value = url.href;

  if (updateLocation) {
    replaceQueryParam(name, url.href);
  }
}

function updateViewControls() {
  for (const button of document.querySelectorAll(".view-toggle")) {
    const active = currentView === button.dataset.view;
    button.setAttribute("aria-pressed", String(active));
    button.textContent = active ? "Restore" : "Expand";
    button.title = active
      ? "Restore split view"
      : `Show only ${button.dataset.view} pane`;
  }
}

function setView(view, updateLocation = true) {
  currentView = validViews.has(view) ? view : "split";
  workspace.dataset.view = currentView;
  workspace.setAttribute("aria-label", currentView === "split"
    ? "Split browser workspace"
    : `${currentView === "left" ? "Left" : "Right"} browser workspace`);
  updateViewControls();

  if (updateLocation) {
    replaceQueryParam("view", currentView);
  }
}

for (const form of document.querySelectorAll(".pane-control")) {
  form.addEventListener("submit", event => {
    event.preventDefault();
    const name = form.dataset.pane;
    const fallback = name === "left" ? defaultLeft : defaultRight;

    try {
      loadPane(name, new FormData(form).get("url"), fallback);
    } catch (error) {
      window.alert(error.message);
    }
  });
}

for (const button of document.querySelectorAll(".view-toggle")) {
  button.addEventListener("click", () => {
    setView(currentView === button.dataset.view ? "split" : button.dataset.view);
  });
}

const initialParams = new URLSearchParams(window.location.search);
loadPane("left", initialParams.get("left"), defaultLeft, false);
loadPane("right", initialParams.get("right"), defaultRight, false);
setView(initialParams.get("view") || "split", false);

function applySplit(percent) {
  splitPercent = Math.min(85, Math.max(15, percent));
  workspace.style.setProperty("--left", `${splitPercent}%`);
}

function setSplit(clientX) {
  if (currentView !== "split") {
    return;
  }

  const rect = workspace.getBoundingClientRect();
  applySplit(((clientX - rect.left) / rect.width) * 100);
}

splitter.addEventListener("pointerdown", event => {
  if (currentView !== "split") {
    return;
  }

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
  if (currentView !== "split") {
    return;
  }

  if (event.key === "ArrowLeft") {
    applySplit(splitPercent - 2);
    event.preventDefault();
  } else if (event.key === "ArrowRight") {
    applySplit(splitPercent + 2);
    event.preventDefault();
  }
});
