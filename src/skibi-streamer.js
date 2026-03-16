let theaterTimer;
const hoverDelay = 500 * 4;

document.addEventListener("DOMContentLoaded", initializeApp);

function initializeApp() {
    const elements = getElements();
    if (!elements) {
        return;
    }

    const {
        addVideosBtn,
        clearVideosBtn,
        audioInput,
        ttsBtn,
        profilePicContainer,
        profilePicInput,
        modalTTSBtn,
        textInput,
        modalTextInput,
        theaterModal,
        theaterCloseBtn,
        themeToggleBtn
    } = elements;

    initializeTheme(themeToggleBtn);

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener("click", function () {
            const isDarkMode = document.body.classList.toggle("dark-theme");
            localStorage.setItem("skibi-theme", isDarkMode ? "dark" : "light");
            updateThemeToggleLabel(themeToggleBtn);
        });
    }

    addVideosBtn.addEventListener("click", function () {
        const youtubeLinks = elements.youtubeInput.value
            .split("\n")
            .map(function (link) { return link.trim(); })
            .filter(Boolean);

        embedYouTubeVideos(youtubeLinks);
    });

    clearVideosBtn.addEventListener("click", function () {
        elements.middleFeed.innerHTML = "";
    });

    audioInput.addEventListener("change", function () {
        const audioFiles = Array.from(audioInput.files || []);
        displayAudioFiles(audioFiles);
    });

    ttsBtn.addEventListener("click", function () {
        const text = textInput.value;
        fetchTextToSpeech(text, elements.saveCheckbox.checked, elements.playCheckbox.checked);
    });

    modalTTSBtn.addEventListener("click", function () {
        const text = modalTextInput.value;
        fetchTextToSpeech(text, elements.saveCheckbox.checked, elements.playCheckbox.checked);
    });

    profilePicContainer.addEventListener("click", function () {
        profilePicInput.click();
    });

    profilePicInput.addEventListener("change", function (event) {
        const file = event.target.files && event.target.files[0];
        if (!file) {
            return;
        }

        const reader = new FileReader();
        reader.onload = function () {
            const imageSrc = String(reader.result);
            elements.profilePic.src = imageSrc;
            if (elements.modalProfilePic) {
                elements.modalProfilePic.src = imageSrc;
            }
        };
        reader.readAsDataURL(file);
    });

    textInput.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
            event.preventDefault();
            ttsBtn.click();
        }
    });

    modalTextInput.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
            event.preventDefault();
            modalTTSBtn.click();
        }
    });

    theaterCloseBtn.addEventListener("click", closeTheaterModal);

    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape") {
            closeTheaterModal();
        }
    });

    theaterModal.addEventListener("click", function (event) {
        if (event.target === theaterModal) {
            closeTheaterModal();
        }
    });
}

function getElements() {
    const ids = {
        addVideosBtn: "addVideosBtn",
        clearVideosBtn: "clearVideosBtn",
        audioInput: "audioInput",
        ttsBtn: "ttsBtn",
        profilePicContainer: "profile-pic-container",
        profilePicInput: "profilePicInput",
        profilePic: "profilePic",
        modalProfilePic: "modalProfilePic",
        youtubeInput: "youtubeInput",
        middleFeed: "middle-feed",
        rightFeed: "right-feed",
        theaterModal: "theaterModal",
        theaterVideo: "theaterVideo",
        textInput: "textInput",
        modalTextInput: "modalTextInput",
        modalTTSBtn: "modalTTSBtn",
        hoverModalCheckbox: "hoverModalCheckbox",
        saveCheckbox: "saveCheckbox",
        playCheckbox: "playCheckbox",
        theaterCloseBtn: "theaterCloseBtn",
        themeToggleBtn: "themeToggleBtn"
    };

    const elements = {};
    Object.keys(ids).forEach(function (key) {
        elements[key] = document.getElementById(ids[key]);
    });

    if (!elements.addVideosBtn || !elements.middleFeed || !elements.rightFeed) {
        return null;
    }

    return elements;
}

function initializeTheme(themeToggleBtn) {
    const savedTheme = localStorage.getItem("skibi-theme");
    if (savedTheme === "dark") {
        document.body.classList.add("dark-theme");
    } else if (savedTheme === "light") {
        document.body.classList.remove("dark-theme");
    }

    updateThemeToggleLabel(themeToggleBtn);
}

function updateThemeToggleLabel(themeToggleBtn) {
    if (!themeToggleBtn) {
        return;
    }

    themeToggleBtn.textContent = document.body.classList.contains("dark-theme")
        ? "Switch to Light Mode"
        : "Switch to Dark Mode";
}

function embedYouTubeVideos(links) {
    const middleFeed = document.getElementById("middle-feed");

    links.forEach(function (link) {
        const videoId = resolveYouTubeVideoId(link);
        if (!videoId) {
            return;
        }

        const tile = createYouTubeTile(videoId);
        middleFeed.appendChild(tile);
    });
}

function resolveYouTubeVideoId(link) {
    if (link.includes("youtube.com/shorts/")) {
        return link.split("youtube.com/shorts/")[1].split(/[?&]/)[0];
    }

    return getYouTubeVideoId(link);
}

function createYouTubeTile(videoId) {
    const tile = document.createElement("div");
    tile.className = "youtube-tile";

    const iframe = document.createElement("iframe");
    iframe.width = "100%";
    iframe.height = "100%";
    iframe.src = "https://www.youtube.com/embed/" + videoId;
    iframe.setAttribute("frameborder", "0");
    iframe.setAttribute("allowfullscreen", "true");

    tile.appendChild(iframe);

    tile.addEventListener("mouseover", function () {
        showTheaterMode(tile);
    });

    tile.addEventListener("mouseleave", function () {
        clearTimeout(theaterTimer);
    });

    return tile;
}

function getYouTubeVideoId(url) {
    const regex = /[?&]([^=#]+)=([^&#]*)/g;
    let match;

    while ((match = regex.exec(url))) {
        if (match[1] === "v") {
            return match[2];
        }
    }

    return null;
}

function displayAudioFiles(files) {
    const rightFeed = document.getElementById("right-feed");

    files.forEach(function (file) {
        const audioTile = createAudioTile(file.name, URL.createObjectURL(file));
        rightFeed.appendChild(audioTile);
    });
}

function fetchTextToSpeech(text, save, play) {
    const trimmedText = text.trim();
    if (!trimmedText) {
        return;
    }

    if (!save && !play) {
        alert("Please select at least one option: Save or Play.");
        return;
    }

    const audioElement = document.createElement("audio");
    audioElement.controls = true;
    audioElement.autoplay = play;

    const sourceElement = document.createElement("source");
    sourceElement.src = "http://tts.cyzon.us/tts?text=" + encodeURIComponent(trimmedText);
    sourceElement.type = "audio/mpeg";
    audioElement.appendChild(sourceElement);

    if (save) {
        const audioTile = createAudioTile(trimmedText.substring(0, 50), sourceElement.src, play);
        document.getElementById("right-feed").appendChild(audioTile);
        return;
    }

    audioElement.addEventListener("ended", function () {
        audioElement.remove();
    });

    audioElement.style.display = "none";
    document.body.appendChild(audioElement);
    audioElement.play().catch(function () {
        audioElement.controls = true;
        audioElement.style.display = "block";
    });
}

function createAudioTile(title, audioSrc, autoplay) {
    const tile = document.createElement("div");
    tile.classList.add("audio-tile");

    const titleSpan = document.createElement("span");
    titleSpan.textContent = title.length > 50 ? title.substring(0, 50) + "..." : title;

    const audioElement = document.createElement("audio");
    audioElement.src = audioSrc;
    audioElement.controls = true;
    audioElement.autoplay = Boolean(autoplay);

    const closeButton = document.createElement("button");
    closeButton.textContent = "x";
    closeButton.addEventListener("click", function () {
        tile.remove();
    });

    tile.appendChild(titleSpan);
    tile.appendChild(audioElement);
    tile.appendChild(closeButton);

    return tile;
}

function showTheaterMode(videoTile) {
    const hoverDisabled = document.getElementById("hoverModalCheckbox").checked;
    if (hoverDisabled) {
        return;
    }

    clearTimeout(theaterTimer);

    theaterTimer = setTimeout(function () {
        const videoFrame = videoTile.querySelector("iframe");
        const theaterModal = document.getElementById("theaterModal");
        const theaterVideo = document.getElementById("theaterVideo");
        const modalTextInput = document.getElementById("modalTextInput");
        const modalProfilePic = document.getElementById("modalProfilePic");
        const profilePic = document.getElementById("profilePic");

        theaterVideo.src = videoFrame.src;
        if (modalProfilePic && profilePic) {
            modalProfilePic.src = profilePic.src;
        }

        theaterModal.style.display = "flex";
        modalTextInput.focus();
    }, hoverDelay);
}

function closeTheaterModal() {
    const theaterModal = document.getElementById("theaterModal");
    const theaterVideo = document.getElementById("theaterVideo");

    theaterModal.style.display = "none";
    theaterVideo.src = "";
}
