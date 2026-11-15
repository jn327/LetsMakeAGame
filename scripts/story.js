import { StoryView } from "./story-view.js";

const SAVE_KEY = "lets-make-a-game-story-save";
const SAVE_VERSION = 2;

export async function loadStory() {
  const storyUrl = new URL("../assets/story/story.json", import.meta.url);
  const response = await fetch(storyUrl);
  if (!response.ok) {
    throw new Error(`Could not load story (${response.status} ${response.statusText}).`);
  }

  const story = await response.json();
  validateStory(story);
  return story;
}

export class StoryPlayer {
  constructor(root, story, onStateChange = () => {}) {
    this.root = root;
    this.view = new StoryView(root);
    this.story = story;
    this.onStateChange = onStateChange;
    this.autoAdvanceTimer = null;
    const savedProgress = readSavedProgress(story);
    this.state = savedProgress.save
      ? { ...story.initialState, ...savedProgress.save.state }
      : { ...story.initialState };
    if (savedProgress.save &&
        !Object.prototype.hasOwnProperty.call(savedProgress.save.state, "worldGameMode")) {
      this.state.worldGameMode = getLegacyGameMode(this.state.worldMood);
    }
    this.sceneId = savedProgress.save ? savedProgress.save.sceneId : null;
    this.lineIndex = savedProgress.save ? savedProgress.save.lineIndex : 0;
    this.history = savedProgress.save ? savedProgress.save.history : [];
    this.transcript = savedProgress.save ? savedProgress.save.transcript : [];
    this.notice = savedProgress.notice;

    if (savedProgress.save) {
      this.render();
      this.onStateChange({ ...this.state });
    } else {
      this.goTo(story.startScene);
      this.notice = savedProgress.notice;
      if (this.notice) this.render();
    }
  }

  render() {
    const scene = this.story.scenes[this.sceneId];
    this.clearAutoAdvance();
    this.view.render({
      scene,
      lineIndex: this.lineIndex,
      transcript: this.transcript,
      notice: this.notice,
      isTyping: this.lineIndex < scene.lines.length - 1 ||
        Boolean(scene.next && !scene.choices),
      canUndo: this.history.length > 0,
      takeoverStarted: Boolean(this.state.takeoverStarted),
      onSave: () => this.save(),
      onUndo: () => this.undo(),
      onRestart: () => this.restart(),
      onChoose: (choice) => this.choose(choice)
    });
    this.scheduleAutoAdvance(scene);
  }

  scheduleAutoAdvance(scene) {
    let advance;
    if (this.lineIndex < scene.lines.length - 1) {
      advance = () => {
        this.lineIndex += 1;
        this.appendLine(scene.lines[this.lineIndex]);
        this.render();
      };
    } else if (scene.next && !scene.choices) {
      advance = () => this.goTo(scene.next);
    }
    if (!advance) return;

    const text = scene.lines[this.lineIndex].text;
    const delay = Math.max(250, Math.min(900, 160 + text.length * 4));
    this.autoAdvanceTimer = window.setTimeout(() => {
      this.autoAdvanceTimer = null;
      advance();
    }, delay);
  }

  clearAutoAdvance() {
    if (this.autoAdvanceTimer === null) return;
    window.clearTimeout(this.autoAdvanceTimer);
    this.autoAdvanceTimer = null;
  }

  choose(choice) {
    this.history.push(this.snapshot());
    this.notice = "";
    this.transcript.push({ speaker: "You", text: choice.text, kind: "choice" });
    Object.assign(this.state, choice.effects || {});
    this.goTo(choice.next);
  }

  recordWorldInteraction(key, text) {
    const interactedObjects = this.state.interactedObjects || [];
    if (interactedObjects.includes(key)) return false;

    this.state.interactedObjects = [...interactedObjects, key];
    this.transcript.push({ speaker: "You", text, kind: "interaction" });
    this.notice = "";
    this.render();
    this.onStateChange({ ...this.state });
    return true;
  }

  resetMiniGame(message) {
    const prefix = `game:${this.state.worldFeature}:`;
    const interactedObjects = this.state.interactedObjects || [];
    if (!interactedObjects.some((key) => key.startsWith(prefix))) return false;

    this.state.interactedObjects = interactedObjects.filter((key) => !key.startsWith(prefix));
    this.transcript.push({
      speaker: "Marvin",
      text: message,
      kind: "dialogue"
    });
    this.render();
    this.onStateChange({ ...this.state });
    return true;
  }

  snapshot() {
    return {
      sceneId: this.sceneId,
      lineIndex: this.lineIndex,
      transcriptLength: this.transcript.length,
      state: { ...this.state }
    };
  }

  goTo(sceneId) {
    this.sceneId = sceneId;
    this.lineIndex = 0;
    this.notice = "";
    Object.assign(this.state, this.story.scenes[sceneId].effects || {});
    this.appendLine(this.story.scenes[sceneId].lines[0]);
    this.render();
    this.onStateChange({ ...this.state });
  }

  appendLine(line) {
    const text = line.text.replace(
      /\{\{memoryAnchor\}\}/g,
      this.state.memoryAnchor || "one thing from the first version"
    );
    this.transcript.push({ speaker: line.speaker, text, kind: "dialogue" });
  }

  undo() {
    const previous = this.history.pop();
    if (!previous) return;

    this.sceneId = previous.sceneId;
    this.lineIndex = previous.lineIndex;
    this.transcript = this.transcript.slice(0, previous.transcriptLength);
    this.state = previous.state;
    this.notice = "Undid the last choice.";
    this.render();
    this.onStateChange({ ...this.state });
  }

  save() {
    if (this.state.takeoverStarted) return;

    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify({
        version: SAVE_VERSION,
        sceneId: this.sceneId,
        lineIndex: this.lineIndex,
        state: this.state,
        history: this.history,
        transcript: this.transcript
      }));
      this.notice = "Progress saved in this browser.";
    } catch (error) {
      console.error("Unable to save story progress:", error);
      this.notice = `Unable to save progress: ${error.message}`;
    }
    this.render();
  }

  restart() {
    if (!window.confirm("Start a new game? This will clear saved progress in this browser.")) return;

    try {
      localStorage.removeItem(SAVE_KEY);
    } catch (error) {
      console.error("Unable to clear saved story progress:", error);
      this.notice = `Unable to clear saved progress; restart was cancelled: ${error.message}`;
      this.render();
      return;
    }

    this.state = { ...this.story.initialState };
    this.history = [];
    this.transcript = [];
    this.goTo(this.story.startScene);
    this.notice = "New game started. Previous saved progress was cleared.";
    this.render();
  }
}

function readSavedProgress(story) {
  let serialized;
  try {
    serialized = localStorage.getItem(SAVE_KEY);
  } catch (error) {
    return { save: null, notice: `Saved progress is unavailable: ${error.message}` };
  }

  if (serialized === null) {
    return { save: null, notice: "" };
  }

  let save;
  try {
    save = JSON.parse(serialized);
  } catch (error) {
    return { save: null, notice: `Saved progress could not be read: ${error.message}` };
  }

  if (save && save.version === 1) {
    return { save: null, notice: "This save predates the conversation log; starting a new game." };
  }

  const scene = save && save.sceneId && story.scenes[save.sceneId];
  if (!save ||
      typeof save !== "object" ||
      Array.isArray(save) ||
      save.version !== SAVE_VERSION ||
      !scene ||
      !Number.isInteger(save.lineIndex) ||
      save.lineIndex < 0 ||
      save.lineIndex >= scene.lines.length ||
      !save.state ||
      typeof save.state !== "object" ||
      Array.isArray(save.state) ||
      !Array.isArray(save.history) ||
      !Array.isArray(save.transcript) ||
      save.transcript.some((entry) => !entry ||
        typeof entry.speaker !== "string" ||
        typeof entry.text !== "string" ||
        !["dialogue", "choice", "interaction"].includes(entry.kind)) ||
      save.history.some((entry) => {
        const historyScene = entry && story.scenes[entry.sceneId];
        return !historyScene ||
          !Number.isInteger(entry.lineIndex) ||
          entry.lineIndex < 0 ||
          entry.lineIndex >= historyScene.lines.length ||
          !Number.isInteger(entry.transcriptLength) ||
          entry.transcriptLength < 0 ||
          entry.transcriptLength > save.transcript.length ||
          !entry.state ||
          typeof entry.state !== "object" ||
          Array.isArray(entry.state);
      })) {
    return { save: null, notice: "Saved progress is invalid; starting a new game." };
  }

  return {
    save: {
      sceneId: save.sceneId,
      lineIndex: save.lineIndex,
      state: { ...save.state },
      history: save.history.map((entry) => ({
        sceneId: entry.sceneId,
        lineIndex: entry.lineIndex,
        transcriptLength: entry.transcriptLength,
        state: { ...story.initialState, ...entry.state }
      })),
      transcript: save.transcript.map((entry) => ({ ...entry }))
    },
    notice: "Progress restored from this browser's save."
  };
}

function getLegacyGameMode(worldMood) {
  const modesByMood = {
    calm: "sequence",
    whimsical: "timed",
    varied: "sequence",
    absurd: "timed",
    wonder: "sequence",
    meta: "timed",
    orderly: "sequence",
    chaotic: "timed"
  };
  return modesByMood[worldMood] || "free";
}

function validateStory(story) {
  if (!story || typeof story !== "object" || Array.isArray(story)) {
    throw new Error("Story data must be a JSON object.");
  }
  if (!story.initialState || typeof story.initialState !== "object" || Array.isArray(story.initialState)) {
    throw new Error("Story data must include an initialState object.");
  }
  if (!story.scenes || typeof story.scenes !== "object" || Array.isArray(story.scenes)) {
    throw new Error("Story data must include a scenes object.");
  }
  if (typeof story.startScene !== "string" || !story.scenes[story.startScene]) {
    throw new Error("Story startScene must reference an existing scene.");
  }

  for (const [sceneId, scene] of Object.entries(story.scenes)) {
    if (!scene || !Array.isArray(scene.lines) || scene.lines.length === 0) {
      throw new Error(`Scene "${sceneId}" must contain at least one dialogue line.`);
    }
    for (const line of scene.lines) {
      if (!line || typeof line.speaker !== "string" || typeof line.text !== "string") {
        throw new Error(`Every line in scene "${sceneId}" must have a speaker and text.`);
      }
    }
    if (scene.next && !story.scenes[scene.next]) {
      throw new Error(`Scene "${sceneId}" points to missing scene "${scene.next}".`);
    }
    if (scene.choices !== undefined && !Array.isArray(scene.choices)) {
      throw new Error(`Choices in scene "${sceneId}" must be an array.`);
    }
    if (scene.effects !== undefined &&
        (!scene.effects || typeof scene.effects !== "object" || Array.isArray(scene.effects))) {
      throw new Error(`Effects for scene "${sceneId}" must be an object.`);
    }
    for (const choice of scene.choices || []) {
      if (!choice || typeof choice.text !== "string" || typeof choice.next !== "string" || !story.scenes[choice.next]) {
        throw new Error(`Every choice in scene "${sceneId}" must have text and a valid next scene.`);
      }
      if (choice.effects !== undefined &&
          (!choice.effects || typeof choice.effects !== "object" || Array.isArray(choice.effects))) {
        throw new Error(`Effects for a choice in scene "${sceneId}" must be an object.`);
      }
    }
  }
}
