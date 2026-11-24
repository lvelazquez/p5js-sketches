/**
 * Shared sketch runtime (global-mode p5). Load after p5, before sketch.js.
 *
 *   function setup() { createCanvas(Kit.size(), Kit.size()); Kit.init(); }
 *
 * Kit.init() provides, for every sketch:
 *  - canvas role="img" + aria-label taken from the page <title> and <meta name="description">
 *  - Pause/Play button and Space key (Kit.millis() is a clock that excludes paused time)
 *  - prefers-reduced-motion: the sketch runs a short warm-up then starts paused
 * Audio sketches then call Kit.audio.init() (after Kit.init()): nothing touches the microphone until the
 * visitor presses "Start microphone"; until then a built-in demo signal drives the visuals.
 */
const Kit = (() => {
  // Tokens
  const REDUCED_MOTION_WARMUP_FRAMES = 90; // frames drawn before a reduced-motion start pauses
  const DEMO_PEAK_INTERVAL_MS = 1400; // synthetic "beat" cadence while the mic is off
  const DEMO_BANDS = {
    // period (ms) and phase of the synthetic energy per frequency band
    bass: { periodMs: 900, phase: 0 },
    lowMid: { periodMs: 1300, phase: 1 },
    mid: { periodMs: 1100, phase: 2 },
    highMid: { periodMs: 700, phase: 3 },
    treble: { periodMs: 500, phase: 4 },
  };
  const ENERGY_MAX = 255; // p5.FFT.getEnergy range
  const PEAK_DETECT = { lowHz: 20, highHz: 2000, threshold: 0.2 };

  const reducedQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const state = { paused: false, reducedMotion: reducedQuery.matches, pausedMs: 0, pausedAt: 0 };
  const root = new URL("../", document.currentScript.src).href;

  let controls, pauseButton, statusEl;

  function metaDescription() {
    return document.querySelector('meta[name="description"]')?.content ?? "";
  }

  function setStatus(text) {
    if (statusEl) statusEl.textContent = text;
  }

  function setPaused(paused, reason) {
    if (paused === state.paused) return;
    state.paused = paused;
    if (paused) {
      state.pausedAt = millis();
      noLoop();
    } else {
      state.pausedMs += millis() - state.pausedAt;
      loop();
    }
    pauseButton.textContent = paused ? "Play" : "Pause";
    pauseButton.setAttribute("aria-pressed", String(paused));
    setStatus(paused ? (reason ?? "Paused. Press Space to play.") : "Playing");
  }

  function makeButton(label, onClick) {
    const b = document.createElement("button");
    b.type = "button";
    b.textContent = label;
    b.addEventListener("click", onClick);
    return b;
  }

  // ---- audio ----------------------------------------------------------------
  const audio = {
    live: false,
    mic: null,
    fft: null,
    peak: null,
    button: null,
    onPeak: () => {},
    nextDemoPeakMs: 0,

    /** Create (but do not start) the mic pipeline and add the Start/Stop button. */
    init(onPeak) {
      audio.onPeak = onPeak ?? audio.onPeak;
      audio.mic = new p5.AudioIn();
      audio.fft = new p5.FFT();
      audio.fft.setInput(audio.mic);
      audio.peak = new p5.PeakDetect(PEAK_DETECT.lowHz, PEAK_DETECT.highHz, PEAK_DETECT.threshold);
      audio.peak.onPeak(() => audio.onPeak());
      audio.button = makeButton("Start microphone", () => (audio.live ? audio.stop() : audio.start()));
      audio.button.setAttribute("aria-pressed", "false");
      controls.insertBefore(audio.button, statusEl);
      setStatus("Demo signal. Start the microphone to react to sound.");
    },

    /** Must run from a user gesture (the button click). */
    async start() {
      try {
        await userStartAudio();
        audio.mic.start(
          () => {
            audio.live = true;
            audio.button.textContent = "Stop microphone";
            audio.button.setAttribute("aria-pressed", "true");
            setStatus("Microphone on");
          },
          () => setStatus("Microphone unavailable (permission denied or no input device).")
        );
      } catch {
        setStatus("Microphone unavailable.");
      }
    },

    stop() {
      audio.mic.stop();
      audio.live = false;
      audio.button.textContent = "Start microphone";
      audio.button.setAttribute("aria-pressed", "false");
      setStatus("Microphone stopped. Showing demo signal.");
    },

    /** Call once per frame before reading energy. */
    update() {
      if (audio.live) {
        audio.fft.analyze();
        audio.peak.update(audio.fft);
      } else if (Kit.millis() >= audio.nextDemoPeakMs) {
        audio.nextDemoPeakMs = Kit.millis() + DEMO_PEAK_INTERVAL_MS;
        audio.onPeak();
      }
    },

    /** 0..255 energy for a p5.FFT band name; synthetic when the mic is off. */
    energy(band) {
      if (audio.live) return audio.fft.getEnergy(band);
      const { periodMs, phase } = DEMO_BANDS[band] ?? DEMO_BANDS.mid;
      const wave = 0.5 + 0.5 * Math.sin((Kit.millis() / periodMs) * Math.PI * 2 + phase);
      return wave * ENERGY_MAX;
    },
  };

  // ---- public ---------------------------------------------------------------
  return {
    state,
    audio,

    /** Largest square that fits the window; optionally rounded down to a multiple of `step`. */
    size(step = 1) {
      return Math.floor(Math.min(windowWidth, windowHeight) / step) * step;
    },

    /** p5.Color from a palette hex plus alpha (0-255 in default colour mode). */
    withAlpha(hex, alpha) {
      const c = color(hex);
      c.setAlpha(alpha);
      return c;
    },

    /** Milliseconds since start, excluding time spent paused. */
    millis() {
      const running = state.paused ? state.pausedAt : millis();
      return running - state.pausedMs;
    },

    /** Call at the end of setup(). */
    init() {
      const canvas = document.querySelector("canvas");
      const title = document.title;
      canvas.setAttribute("role", "img");
      canvas.setAttribute("aria-label", `${title}. ${metaDescription()}`);
      canvas.tabIndex = 0;

      controls = document.createElement("nav");
      controls.className = "kit-controls";
      controls.setAttribute("aria-label", "Sketch controls");
      const home = document.createElement("a");
      home.href = root;
      home.textContent = "Gallery";
      pauseButton = makeButton("Pause", () => setPaused(!state.paused));
      pauseButton.setAttribute("aria-pressed", "false");
      pauseButton.title = "Pause or play (Space)";
      statusEl = document.createElement("span");
      statusEl.className = "kit-status";
      statusEl.setAttribute("role", "status");
      controls.append(home, pauseButton, statusEl);
      document.body.append(controls);

      document.addEventListener("keydown", (e) => {
        if (e.code !== "Space" || e.target.closest?.("button, a, input, select, textarea")) return;
        e.preventDefault();
        setPaused(!state.paused);
      });

      // Reduced motion: draw a short warm-up (so trails/fades settle), then start paused.
      let warmupFrames = 0;
      const sketchDraw = window.draw;
      window.draw = function () {
        sketchDraw();
        if (state.reducedMotion && !state.paused && ++warmupFrames >= REDUCED_MOTION_WARMUP_FRAMES) {
          setPaused(true, "Paused (reduced motion). Press Space or Play to animate.");
        }
      };
      reducedQuery.addEventListener("change", (e) => {
        state.reducedMotion = e.matches;
        if (e.matches) setPaused(true, "Paused (reduced motion). Press Space or Play to animate.");
      });
    },
  };
})();
