import {
  getInteractionText,
  getMiniGameHint,
  getMiniGameInfo,
  getMiniGameMode,
  getMiniGameProgress,
  getRoomBounds,
  getWorldObjects,
  WorldRenderer
} from "./world-renderer.js";

const MOVEMENT_KEYS = ["w", "a", "s", "d", "arrowup", "arrowleft", "arrowdown", "arrowright"];
const MINI_GAME_TIME_LIMIT = 20;

export class GameWorld {
  constructor(canvas, main) {
    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("The game needs a 2D canvas.");
    }

    this.canvas = canvas;
    this.context = context;
    this.renderer = new WorldRenderer(context);
    this.gameState = {};
    this.pixelRatio = 1;
    this.worldWidth = 0;
    this.worldHeight = 0;
    this.animationTime = 0;
    this.lastFrameTime = 0;
    this.storyPlayer = null;
    this.playerPosition = { x: 0.23, y: 0.9 };
    this.playerFacing = 1;
    this.playerTarget = null;
    this.pendingInteraction = null;
    this.heldKeys = new Set();
    this.activeGameKey = "";
    this.gameTimerRemaining = null;
    this.lastTimerSecond = null;

    canvas.className = "game-world";
    canvas.tabIndex = 0;
    canvas.setAttribute(
      "aria-label",
      "Game room. Tap to move, inspect, or play; use WASD or arrow keys and press E near a marker."
    );

    this.worldHint = document.createElement("p");
    this.worldHint.className = "world-hint";
    this.worldHint.textContent = this.getMovementHint();

    this.storyRoot = document.createElement("section");
    this.storyRoot.className = "story-overlay";
    this.storyRoot.setAttribute("aria-label", "Story dialogue");
    main.append(this.worldHint, this.storyRoot);

    this.handlePointerDown = this.handlePointerDown.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
    this.handleResize = this.handleResize.bind(this);
    this.handleBlur = () => this.heldKeys.clear();
    this.animate = this.animate.bind(this);

    canvas.addEventListener("pointerdown", this.handlePointerDown);
    window.addEventListener("keydown", this.handleKeyDown);
    window.addEventListener("keyup", this.handleKeyUp);
    window.addEventListener("blur", this.handleBlur);
    window.addEventListener("resize", this.handleResize);
    this.handleResize();
    window.requestAnimationFrame(this.animate);
  }

  setStoryPlayer(storyPlayer) {
    this.storyPlayer = storyPlayer;
  }

  update(state) {
    this.gameState = state;
    const gameMode = getMiniGameMode(state);
    const gameKey = gameMode === "free" ? "" : `${state.worldFeature}:${gameMode}`;
    if (gameKey !== this.activeGameKey) {
      this.activeGameKey = gameKey;
      this.gameTimerRemaining = null;
      this.lastTimerSecond = null;
    }
    this.worldHint.textContent = this.getMovementHint();
    this.draw();
  }

  getRoomBounds() {
    return getRoomBounds(this.worldWidth, this.worldHeight, window.innerWidth);
  }

  getObjects(room = this.getRoomBounds()) {
    return getWorldObjects(room, this.gameState, this.playerPosition, this.animationTime);
  }

  getMovementHint() {
    const game = getMiniGameInfo(this.gameState.worldFeature);
    const mode = getMiniGameMode(this.gameState);
    if (game && mode !== "free") {
      const progress = getMiniGameProgress(this.gameState);
      const instruction = mode === "sequence"
        ? `Follow markers 1 to ${game.targets.length} in order.`
        : "Start the 20-second timed challenge.";
      const action = mode === "sequence"
        ? window.innerWidth <= 960 ? "Tap the next number." : "Walk to it and press E, or click it."
        : window.innerWidth <= 960 ? "Tap any target to start." : "Walk to a target and press E, or click it.";
      return `${game.name}: ${progress}/${game.targets.length}. ${instruction} ${action} ${getMiniGameHint(this.gameState)}`;
    }

    return window.innerWidth <= 960
      ? "Tap the room to walk; tap a glowing marker to inspect it."
      : "Move with WASD or arrows. Press E near a marker, or click / tap one.";
  }

  draw() {
    const room = this.getRoomBounds();
    this.renderer.draw({
      width: this.worldWidth,
      height: this.worldHeight,
      state: this.gameState,
      playerPosition: this.playerPosition,
      playerFacing: this.playerFacing,
      time: this.animationTime,
      objects: this.getObjects(room),
      gameTimerRemaining: this.gameTimerRemaining
    });
  }

  interactWithObject(key) {
    if (!this.storyPlayer) return;
    const object = this.getObjects().find((item) => item.key === key);
    if (!object) return;

    const game = getMiniGameInfo(this.gameState.worldFeature);
    const mode = getMiniGameMode(this.gameState);
    if (key.startsWith("game:") && mode === "sequence") {
      const progress = getMiniGameProgress(this.gameState);
      const targetId = key.slice(key.lastIndexOf(":") + 1);
      const expectedTarget = game.targets[progress];
      if (!expectedTarget || expectedTarget.id !== targetId) {
        this.worldHint.textContent = `Not yet! Number ${progress + 1} is next. Follow the sequence to keep your streak.`;
        return;
      }
    }

    if (key.startsWith("game:") && mode === "timed" && this.gameTimerRemaining === null) {
      this.gameTimerRemaining = MINI_GAME_TIME_LIMIT;
      this.lastTimerSecond = MINI_GAME_TIME_LIMIT;
    }
    const recorded = this.storyPlayer.recordWorldInteraction(key, getInteractionText(key, this.gameState));
    if (key === "bonus:door") {
      this.worldHint.textContent = recorded
        ? "Bonus room unlocked! The hidden challenge is yours."
        : "You already found the bonus room.";
      return;
    }

    if (key.startsWith("game:")) {
      const progress = getMiniGameProgress(this.gameState);
      this.worldHint.textContent = recorded
        ? progress === game.targets.length
          ? `${game.name} complete!`
          : mode === "sequence"
            ? `Nice! Number ${progress + 1} is next.`
            : `${game.name}: ${progress}/${game.targets.length}. ${Math.ceil(this.gameTimerRemaining)}s left.`
        : `You already completed that ${game.name.toLowerCase()} activity.`;
      if (progress === game.targets.length && mode === "timed") {
        this.gameTimerRemaining = 0;
        this.lastTimerSecond = 0;
      }
      return;
    }

    this.worldHint.textContent = recorded
      ? `You inspected ${object.label}. The conversation log has a new entry.`
      : `You have already inspected ${object.label}. Try another glowing marker.`;
  }

  interactWithNearestObject() {
    const room = this.getRoomBounds();
    const playerX = room.x + room.width * this.playerPosition.x;
    const playerY = room.y + room.height * this.playerPosition.y;
    const nearest = this.getObjects(room)
      .map((object) => ({
        object,
        distance: Math.hypot(object.x - playerX, object.y - playerY)
      }))
      .sort((left, right) => left.distance - right.distance)[0];

    if (nearest && nearest.distance <= Math.max(56, Math.min(room.width, room.height) * 0.22)) {
      this.interactWithObject(nearest.object.key);
    } else {
      this.worldHint.textContent = "Move closer to a glowing marker, then press E again.";
    }
  }

  handlePointerDown(event) {
    const bounds = this.canvas.getBoundingClientRect();
    const room = this.getRoomBounds();
    if (!bounds.width || !bounds.height) return;

    const canvasX = (event.clientX - bounds.left) * this.worldWidth / bounds.width;
    const canvasY = (event.clientY - bounds.top) * this.worldHeight / bounds.height;
    if (canvasX < room.x ||
        canvasX > room.x + room.width ||
        canvasY < room.y ||
        canvasY > room.y + room.height) {
      return;
    }

    const clickedObject = this.getObjects(room).find((object) =>
      Math.hypot(object.markerX - canvasX, object.markerY - canvasY) <= 24 ||
      Math.hypot(object.x - canvasX, object.y - canvasY) <= 24
    );
    this.canvas.focus();
    if (clickedObject) {
      this.playerTarget = {
        x: clamp(
          clickedObject.roomX + (clickedObject.roomX > 0.5 ? -0.1 : 0.1),
          0.05,
          0.95
        ),
        y: clamp(clickedObject.roomY + 0.2, 0.76, 0.94)
      };
      this.pendingInteraction = clickedObject.key;
      this.worldHint.textContent = `Walking to the ${clickedObject.label}...`;
    } else {
      this.playerTarget = {
        x: clamp((canvasX - room.x) / room.width, 0.05, 0.95),
        y: clamp((canvasY - room.y) / room.height, 0.76, 0.94)
      };
      this.pendingInteraction = null;
    }
    event.preventDefault();
  }

  handleKeyDown(event) {
    const target = event.target instanceof HTMLElement ? event.target : null;
    if (target && target.closest("input, textarea, select, [contenteditable='true']")) return;
    const key = event.key.toLowerCase();
    if (MOVEMENT_KEYS.includes(key)) {
      this.heldKeys.add(key);
      event.preventDefault();
    } else if ((key === "e" || (key === "enter" && !(target && target.closest("button, a")))) &&
               !event.repeat) {
      event.preventDefault();
      this.interactWithNearestObject();
    }
  }

  handleKeyUp(event) {
    this.heldKeys.delete(event.key.toLowerCase());
  }

  movePlayer(deltaSeconds) {
    const room = this.getRoomBounds();
    const moveX = Number(this.heldKeys.has("d") || this.heldKeys.has("arrowright")) -
      Number(this.heldKeys.has("a") || this.heldKeys.has("arrowleft"));
    const moveY = Number(this.heldKeys.has("s") || this.heldKeys.has("arrowdown")) -
      Number(this.heldKeys.has("w") || this.heldKeys.has("arrowup"));
    const moveLength = Math.hypot(moveX, moveY);

    if (moveLength > 0) {
      this.playerTarget = null;
      this.pendingInteraction = null;
      if (moveX !== 0) this.playerFacing = Math.sign(moveX);
      this.playerPosition.x = clamp(
        this.playerPosition.x + moveX / moveLength * 190 * deltaSeconds / room.width,
        0.05,
        0.95
      );
      this.playerPosition.y = clamp(
        this.playerPosition.y + moveY / moveLength * 190 * deltaSeconds / room.height,
        0.76,
        0.94
      );
      return;
    }

    if (!this.playerTarget) return;
    const dx = (this.playerTarget.x - this.playerPosition.x) * room.width;
    const dy = (this.playerTarget.y - this.playerPosition.y) * room.height;
    const distance = Math.hypot(dx, dy);
    const step = 190 * deltaSeconds;
    if (distance <= step || distance === 0) {
      this.playerPosition = this.playerTarget;
      this.playerTarget = null;
      const interaction = this.pendingInteraction;
      this.pendingInteraction = null;
      if (interaction) this.interactWithObject(interaction);
      return;
    }

    if (dx !== 0) this.playerFacing = Math.sign(dx);
    this.playerPosition.x += dx / distance * step / room.width;
    this.playerPosition.y += dy / distance * step / room.height;
  }

  handleResize() {
    this.pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    this.worldWidth = this.canvas.clientWidth;
    this.worldHeight = this.canvas.clientHeight;
    this.canvas.width = Math.round(this.worldWidth * this.pixelRatio);
    this.canvas.height = Math.round(this.worldHeight * this.pixelRatio);
    this.context.setTransform(this.pixelRatio, 0, 0, this.pixelRatio, 0, 0);
    this.worldHint.textContent = this.getMovementHint();
    this.draw();
  }

  animate(timestamp) {
    const deltaSeconds = this.lastFrameTime
      ? Math.min((timestamp - this.lastFrameTime) / 1000, 0.05)
      : 0;
    this.lastFrameTime = timestamp;
    this.animationTime = timestamp / 1000;
    this.updateGameTimer(deltaSeconds);
    this.movePlayer(deltaSeconds);
    this.draw();
    window.requestAnimationFrame(this.animate);
  }

  updateGameTimer(deltaSeconds) {
    const game = getMiniGameInfo(this.gameState.worldFeature);
    if (getMiniGameMode(this.gameState) !== "timed" ||
        !game ||
        this.gameTimerRemaining === null ||
        getMiniGameProgress(this.gameState) >= game.targets.length) {
      return;
    }

    this.gameTimerRemaining = Math.max(0, this.gameTimerRemaining - deltaSeconds);
    if (this.gameTimerRemaining > 0) {
      const remaining = Math.ceil(this.gameTimerRemaining);
      if (remaining !== this.lastTimerSecond) {
        this.lastTimerSecond = remaining;
        const progress = getMiniGameProgress(this.gameState);
        this.worldHint.textContent = `${game.name}: ${progress}/${game.targets.length}. ${remaining} seconds left.`;
      }
      return;
    }

    this.gameTimerRemaining = null;
    const message = this.gameState.worldFeature === "underwater"
      ? "The oxygen ran low. I reset the page rescue; your last run was good practice."
      : "Time ran out. I reset the challenge; your last run still counts as practice.";
    this.storyPlayer.resetMiniGame(message);
    const timeoutLabel = this.gameState.worldFeature === "underwater" ? "Oxygen ran out" : "Time's up";
    this.worldHint.textContent = `${timeoutLabel}! Progress reset. Tap a marker to try again. ${getMiniGameHint(this.gameState)}`;
    this.lastTimerSecond = null;
  }
}

function clamp(value, minimum, maximum) {
  return Math.max(minimum, Math.min(maximum, value));
}
