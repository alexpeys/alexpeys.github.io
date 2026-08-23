const SONGS = [
  { slug: "better-than-revenge", title: "Better Than Revenge" },
  { slug: "eyes-open-tv", title: "Eyes Open (Taylor's Version)" },
  { slug: "back-to-december-tv", title: "Back To December (Taylor's Version)" },
  { slug: "guilty-as-sin", title: "Guilty as Sin?" },
  { slug: "red", title: "Red" },
  { slug: "style-tv", title: "Style (Taylor's Version)" },
  { slug: "fate-of-ophelia", title: "The Fate of Ophelia" },
  { slug: "story-of-us-tv", title: "The Story of Us (Taylor's Version)" },
  { slug: "never-ever", title: "We Are Never Ever Getting Back Together" },
  { slug: "you-belong-with-me", title: "You Belong With Me" }
];

const STEMS = [
  { name: "vocals", label: "Vocals", color: "#f27a62" },
  { name: "drums", label: "Drums", color: "#f2c95f" },
  { name: "bass", label: "Bass", color: "#5acdb0" },
  { name: "guitar", label: "Guitar", color: "#72a4ef" },
  { name: "piano", label: "Piano", color: "#ac86ed" },
  { name: "other", label: "Other", color: "#e47fba" }
];

const songSelect = document.querySelector("#song-select");
const songTitle = document.querySelector("#song-title");
const statusLabel = document.querySelector("#load-status");
const tracksNode = document.querySelector("#tracks");
const trackTemplate = document.querySelector("#track-template");
const playButton = document.querySelector("#play");
const timeline = document.querySelector("#timeline");
const currentTimeLabel = document.querySelector("#current-time");
const durationTimeLabel = document.querySelector("#duration-time");
const resetMixButton = document.querySelector("#reset-mix");
const loopToggle = document.querySelector("#loop-toggle");
const loopPanel = document.querySelector("#loop-panel");
const loopStartRange = document.querySelector("#loop-start");
const loopEndRange = document.querySelector("#loop-end");
const loopStartLabel = document.querySelector("#loop-start-time");
const loopEndLabel = document.querySelector("#loop-end-time");
const loopSummary = document.querySelector("#loop-summary");
const loopSelection = document.querySelector("#loop-selection");
const markStartButton = document.querySelector("#mark-start");
const markEndButton = document.querySelector("#mark-end");
const wholeSongButton = document.querySelector("#whole-song");

let activeSong = SONGS[0];
let playing = false;
let seeking = false;
let loopEnabled = false;
let loopStart = 0;
let loopEnd = 0;
let duration = 0;
let audioContext = null;

for (const song of SONGS) {
  const option = document.createElement("option");
  option.value = song.slug;
  option.textContent = song.title;
  songSelect.appendChild(option);
}

const tracks = STEMS.map(stem => {
  const fragment = trackTemplate.content.cloneNode(true);
  const row = fragment.querySelector(".track");
  const name = fragment.querySelector(".identity strong");
  const slider = fragment.querySelector(".volume input");
  const output = fragment.querySelector(".volume output");
  const muteButton = fragment.querySelector(".mute");
  const soloButton = fragment.querySelector(".solo");
  const audio = new Audio();
  audio.preload = "metadata";
  row.style.setProperty("--track-color", stem.color);
  name.textContent = stem.label;
  slider.setAttribute("aria-label", `${stem.label} volume`);
  muteButton.setAttribute("aria-label", `Mute ${stem.label}`);
  soloButton.setAttribute("aria-label", `Solo ${stem.label}`);

  const track = { ...stem, audio, row, slider, output, muteButton, soloButton, volume: 1, muted: false, solo: false, sourceNode: null, gainNode: null };
  slider.addEventListener("input", () => {
    track.volume = Number(slider.value) / 100;
    output.value = slider.value;
    applyMix();
  });
  muteButton.addEventListener("click", () => {
    track.muted = !track.muted;
    muteButton.setAttribute("aria-pressed", String(track.muted));
    applyMix();
  });
  soloButton.addEventListener("click", () => {
    track.solo = !track.solo;
    soloButton.setAttribute("aria-pressed", String(track.solo));
    applyMix();
  });
  tracksNode.appendChild(fragment);
  return track;
});

const master = tracks[0].audio;

function selectSong(slug) {
  pauseAll();
  activeSong = SONGS.find(song => song.slug === slug) || SONGS[0];
  songTitle.textContent = activeSong.title;
  statusLabel.textContent = "Loading stems…";
  statusLabel.className = "";
  duration = 0;
  currentTimeLabel.textContent = "0:00";
  durationTimeLabel.textContent = "0:00";
  timeline.value = "0";
  for (const track of tracks) {
    track.audio.src = `./tswift-audio/${activeSong.slug}/${track.name}.mp3`;
    track.audio.load();
  }
}

master.addEventListener("loadedmetadata", () => {
  duration = master.duration;
  durationTimeLabel.textContent = formatTime(duration);
  statusLabel.textContent = "6 stems ready";
  statusLabel.className = "ready";
  setWholeSongLoop();
});

master.addEventListener("error", () => {
  statusLabel.textContent = "Stem files unavailable";
  statusLabel.className = "error";
});

master.addEventListener("ended", () => {
  if (loopEnabled) {
    seekAll(loopStart);
    playAll();
  } else {
    pauseAll();
  }
});

songSelect.addEventListener("change", () => selectSong(songSelect.value));

function applyMix() {
  const anySolo = tracks.some(track => track.solo);
  for (const track of tracks) {
    const silent = track.muted || (anySolo && !track.solo);
    if (track.gainNode && audioContext) {
      track.audio.volume = 1;
      track.audio.muted = false;
      track.gainNode.gain.setTargetAtTime(silent ? 0 : track.volume, audioContext.currentTime, 0.005);
    } else {
      track.audio.volume = Math.min(1, track.volume);
      track.audio.muted = silent;
    }
    track.row.classList.toggle("muted", silent);
    track.row.classList.toggle("soloed", track.solo);
  }
}

async function ensureAudioGraph() {
  if (!audioContext) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    audioContext = new AudioContextClass();
    for (const track of tracks) {
      track.sourceNode = audioContext.createMediaElementSource(track.audio);
      track.gainNode = audioContext.createGain();
      track.sourceNode.connect(track.gainNode).connect(audioContext.destination);
    }
  }
  if (audioContext.state === "suspended") await audioContext.resume();
  applyMix();
}

async function playAll() {
  if (!duration) return;
  await ensureAudioGraph();
  let startAt = master.currentTime;
  if (master.ended || startAt >= duration - 0.05) startAt = loopEnabled ? loopStart : 0;
  if (loopEnabled && (startAt < loopStart || startAt >= loopEnd)) startAt = loopStart;
  seekAll(startAt);
  const results = await Promise.allSettled(tracks.map(track => track.audio.play()));
  if (results.some(result => result.status === "rejected")) {
    pauseAll();
    statusLabel.textContent = "Could not start every stem";
    statusLabel.className = "error";
    return;
  }
  playing = true;
  playButton.textContent = "Ⅱ";
  playButton.setAttribute("aria-label", "Pause all stems");
}

function pauseAll() {
  tracks.forEach(track => track.audio.pause());
  playing = false;
  playButton.textContent = "▶";
  playButton.setAttribute("aria-label", "Play all stems");
}

function seekAll(time) {
  const safeTime = Math.max(0, Math.min(duration || 0, time));
  for (const track of tracks) {
    try { track.audio.currentTime = safeTime; } catch (_) { /* Metadata is still loading. */ }
  }
}

playButton.addEventListener("click", () => playing ? pauseAll() : playAll());
timeline.addEventListener("pointerdown", () => { seeking = true; });
timeline.addEventListener("input", () => {
  currentTimeLabel.textContent = formatTime((Number(timeline.value) / 1000) * duration);
});
function commitSeek() {
  seekAll((Number(timeline.value) / 1000) * duration);
  seeking = false;
}
timeline.addEventListener("change", commitSeek);
timeline.addEventListener("pointerup", commitSeek);

resetMixButton.addEventListener("click", () => {
  for (const track of tracks) {
    track.volume = 1;
    track.muted = false;
    track.solo = false;
    track.slider.value = "100";
    track.output.value = "100";
    track.muteButton.setAttribute("aria-pressed", "false");
    track.soloButton.setAttribute("aria-pressed", "false");
  }
  applyMix();
});

loopToggle.addEventListener("click", () => {
  loopEnabled = !loopEnabled;
  loopToggle.setAttribute("aria-pressed", String(loopEnabled));
  loopPanel.hidden = !loopEnabled;
  if (loopEnabled && (!loopEnd || loopEnd <= loopStart)) setWholeSongLoop();
});

loopStartRange.addEventListener("input", () => {
  if (!duration) return;
  const minimumGap = Math.max(1, 1000 / duration);
  let startValue = Number(loopStartRange.value);
  const endValue = Number(loopEndRange.value);
  if (startValue >= endValue - minimumGap) startValue = Math.max(0, endValue - minimumGap);
  loopStartRange.value = String(startValue);
  loopStart = (startValue / 1000) * duration;
  updateLoopDisplay();
});

loopEndRange.addEventListener("input", () => {
  if (!duration) return;
  const minimumGap = Math.max(1, 1000 / duration);
  const startValue = Number(loopStartRange.value);
  let endValue = Number(loopEndRange.value);
  if (endValue <= startValue + minimumGap) endValue = Math.min(1000, startValue + minimumGap);
  loopEndRange.value = String(endValue);
  loopEnd = (endValue / 1000) * duration;
  updateLoopDisplay();
});

markStartButton.addEventListener("click", () => {
  if (!duration) return;
  loopStart = Math.min(master.currentTime, Math.max(0, loopEnd - 1));
  loopStartRange.value = String((loopStart / duration) * 1000);
  updateLoopDisplay();
});

markEndButton.addEventListener("click", () => {
  if (!duration) return;
  loopEnd = Math.max(master.currentTime, Math.min(duration, loopStart + 1));
  loopEndRange.value = String((loopEnd / duration) * 1000);
  updateLoopDisplay();
});

wholeSongButton.addEventListener("click", setWholeSongLoop);

function setWholeSongLoop() {
  loopStart = 0;
  loopEnd = duration || 0;
  loopStartRange.value = "0";
  loopEndRange.value = "1000";
  updateLoopDisplay();
}

function updateLoopDisplay() {
  loopStartLabel.value = formatTime(loopStart);
  loopEndLabel.value = formatTime(loopEnd);
  loopSummary.textContent = `${formatTime(loopStart)} — ${formatTime(loopEnd)}`;
  const left = duration ? (loopStart / duration) * 100 : 0;
  const right = duration ? (loopEnd / duration) * 100 : 100;
  loopSelection.style.setProperty("--loop-left", `${left}%`);
  loopSelection.style.setProperty("--loop-width", `${Math.max(0, right - left)}%`);
}

document.addEventListener("keydown", event => {
  const interactive = ["INPUT", "SELECT", "BUTTON"].includes(document.activeElement?.tagName);
  if (event.code === "Space" && !interactive) {
    event.preventDefault();
    playing ? pauseAll() : playAll();
  }
});

setInterval(() => {
  if (!seeking && duration) {
    timeline.value = String((master.currentTime / duration) * 1000);
    currentTimeLabel.textContent = formatTime(master.currentTime);
  }

  if (!playing) return;
  if (loopEnabled && master.currentTime >= loopEnd - 0.08) {
    seekAll(loopStart);
    tracks.forEach(track => { if (track.audio.paused) track.audio.play(); });
    return;
  }
  for (const track of tracks.slice(1)) {
    if (Math.abs(track.audio.currentTime - master.currentTime) > 0.12) {
      track.audio.currentTime = master.currentTime;
    }
  }
}, 120);

function formatTime(seconds) {
  const safe = Math.max(0, Math.round(Number.isFinite(seconds) ? seconds : 0));
  return `${Math.floor(safe / 60)}:${String(safe % 60).padStart(2, "0")}`;
}

selectSong(SONGS[0].slug);
applyMix();
