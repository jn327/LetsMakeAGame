(() => {
const FLOOR_COLORS = {
  garden: ["#29585b", "#183c43"],
  arcade: ["#393454", "#211e3b"],
  observatory: ["#3c4467", "#252a49"],
  underwater: ["#20586c", "#143a51"]
};

const FEATURE_OBJECTS = {
  empty: { label: "workbench", x: 0.48, y: 0.62 },
  garden: { label: "frog", x: 0.55, y: 0.7 },
  arcade: { label: "arcade cabinet", x: 0.55, y: 0.56 },
  observatory: { label: "telescope", x: 0.55, y: 0.55 },
  underwater: { label: "archive", x: 0.55, y: 0.53 }
};

const ADDON_LABELS = {
  companion: "clockwork moth",
  secret: "hidden door",
  weather: "weather machine"
};

const ADDON_MESSAGES = {
  "addon:companion": "The clockwork moth flutters beside you. A tiny label reads: 'I am leading.'",
  "addon:secret": "The hidden door has a keyhole and a very small key. The key is labeled 'later'.",
  "addon:weather": "The cloud follows its schedule precisely. It is raining on one very small patch of floor."
};

const FEATURE_MESSAGES = {
  empty: "The workbench has a half-built prototype and a note that says: 'Ask before adding lasers.'",
  garden: "The frog hands you a tiny bug report: 'The path is good. Could we add a pond?'",
  arcade: "One cabinet wakes up and starts a race between two loading bars.",
  observatory: "Through the telescope, an uncharted cluster of stars spells out a tiny 'hello'.",
  underwater: "A fish nudges a book toward you. Its title is 'How to Find the Exit'."
};

const MINI_GAMES = {
  garden: {
    name: "George's garden",
    sequenceHint: "Water the sprout, plant the seed, then find George's badge.",
    timedHint: "Finish all three garden jobs before the timer runs out.",
    targets: [
      { id: "sprout", label: "sprout", x: 0.3, y: 0.69, message: "You water a thirsty sprout. It perks up immediately." },
      { id: "seed", label: "seed patch", x: 0.72, y: 0.69, message: "You plant a seed beside the garden path." },
      { id: "badge", label: "frog badge", x: 0.9, y: 0.69, message: "You find George's flower badge. He wears it with great seriousness." }
    ]
  },
  arcade: {
    name: "Arcade challenge",
    sequenceHint: "Clear the maze, catch the beat, and finish the settings cabinet in order.",
    timedHint: "Beat all three loading-bar cabinets before the timer ends.",
    targets: [
      { id: "maze", label: "maze cabinet", timedLabel: "loading bar 1", x: 0.35, y: 0.69, message: "Maze cleared! The exit was, appropriately, on the screen.", timedMessage: "You boost the first loading bar. It jumps ahead, then looks smug." },
      { id: "rhythm", label: "rhythm cabinet", timedLabel: "loading bar 2", x: 0.58, y: 0.69, message: "Beat matched. Marvin counts it as a 12/8 time signature.", timedMessage: "You boost the second bar on the beat. Marvin calls it a combo." },
      { id: "race", label: "settings cabinet", timedLabel: "loading bar 3", x: 0.81, y: 0.69, message: "You finish the settings cabinet. It asks if you are sure.", timedMessage: "You nudge the last bar over the finish line. It asks to appeal." }
    ]
  },
  observatory: {
    name: "Star mapper",
    sequenceHint: "Trace the three stars in number order to reveal a constellation.",
    timedHint: "Chart three passing satellites before they vanish.",
    targets: [
      { id: "star-a", label: "first star", timedLabel: "satellite 1", x: 0.34, y: 0.69, message: "You mark the first star in the constellation.", timedMessage: "Satellite one logged. It may be a weather balloon, but it counts." },
      { id: "star-b", label: "second star", timedLabel: "satellite 2", x: 0.55, y: 0.69, message: "You connect another star. The pattern starts to look familiar.", timedMessage: "Satellite two logged. Marvin has named it Dennis." },
      { id: "star-c", label: "final star", timedLabel: "satellite 3", x: 0.76, y: 0.69, message: "The last star completes the map. It looks a little like a frog.", timedMessage: "The last satellite is logged just before it disappears." }
    ]
  },
  underwater: {
    name: "Archive rescue",
    sequenceHint: "Recover the archive pages in numbered order.",
    timedHint: "Rescue three loose pages before the current scatters them.",
    targets: [
      { id: "page-a", label: "floating page", timedLabel: "loose page 1", x: 0.3, y: 0.69, message: "You catch a page before it drifts behind the shelves.", timedMessage: "You catch a loose page before the current sweeps it away." },
      { id: "page-b", label: "tangled page", timedLabel: "loose page 2", x: 0.55, y: 0.69, message: "You free a page tangled in a strand of seaweed.", timedMessage: "You grab a second page from the current." },
      { id: "page-c", label: "last page", timedLabel: "loose page 3", x: 0.8, y: 0.69, message: "You rescue the last page. The fish approves with a bubble.", timedMessage: "You rescue the last page just in time. The fish cheers in bubbles." }
    ]
  }
};

function getMiniGameInfo(feature) {
  return MINI_GAMES[feature] || null;
}

function getMiniGameMode(state) {
  return state.worldGameMode === "sequence" || state.worldGameMode === "timed"
    ? state.worldGameMode
    : "free";
}

function getMiniGameHint(state) {
  const game = getMiniGameInfo(state.worldFeature);
  if (!game) return "";
  return getMiniGameMode(state) === "timed" ? game.timedHint : game.sequenceHint;
}

function getMiniGameProgress(state) {
  const game = getMiniGameInfo(state.worldFeature);
  if (!game || getMiniGameMode(state) === "free") return 0;
  const interacted = state.interactedObjects || [];
  return game.targets.filter((target) =>
    interacted.includes(`game:${state.worldFeature}:${target.id}`)
  ).length;
}

function getRoomBounds(width, height, viewportWidth) {
  const splitLayout = viewportWidth > 960;
  return {
    x: width * (splitLayout ? 0.04 : 0.08),
    y: height * 0.1,
    width: width * (splitLayout ? 0.52 : 0.84),
    height: height * (splitLayout ? 0.78 : 0.82)
  };
}

function getWorldObjects(room, state, playerPosition, time = 0) {
  const feature = FEATURE_OBJECTS[state.worldFeature] || FEATURE_OBJECTS.empty;
  const objects = [
    {
      key: `feature:${state.worldFeature || "empty"}`,
      label: feature.label,
      roomX: feature.x,
      roomY: feature.y,
      x: room.x + room.width * feature.x,
      y: room.y + room.height * feature.y
    }
  ];
  const game = getMiniGameInfo(state.worldFeature);
  const interactedObjects = state.interactedObjects || [];
  if (game && getMiniGameMode(state) !== "free") {
    for (const [index, target] of game.targets.entries()) {
      const key = `game:${state.worldFeature}:${target.id}`;
      if (interactedObjects.includes(key)) continue;
      const shifting = state.worldAddon === "weather" && getMiniGameMode(state) === "timed";
      const roomX = clamp(
        target.x + (shifting ? Math.sin(time * 1.8 + index) * 0.065 : 0),
        0.18,
        0.86
      );
      objects.push({
        key,
        label: getMiniGameMode(state) === "timed" && target.timedLabel
          ? target.timedLabel
          : target.label,
        marker: String(index + 1),
        roomX,
        roomY: target.y,
        x: room.x + room.width * roomX,
        y: room.y + room.height * target.y
      });
    }
  }

  const gameComplete = game &&
    getMiniGameMode(state) !== "free" &&
    getMiniGameProgress(state) === game.targets.length;
  const addonPosition = getAddonPosition(state.worldAddon, playerPosition);
  if (addonPosition) {
    if (state.worldAddon === "secret" && gameComplete) {
      if (!interactedObjects.includes("bonus:door")) {
        objects.push({
          key: "bonus:door",
          label: "bonus room",
          ...addonPosition,
          x: room.x + room.width * addonPosition.roomX,
          y: room.y + room.height * addonPosition.roomY
        });
      }
    } else {
      objects.push({
        key: `addon:${state.worldAddon}`,
        label: ADDON_LABELS[state.worldAddon],
        ...addonPosition,
        x: room.x + room.width * addonPosition.roomX,
        y: room.y + room.height * addonPosition.roomY
      });
    }
  }
  return objects.map((object) => ({
    ...object,
    markerX: clamp(object.x + 18, room.x + 16, room.x + room.width - 16),
    markerY: clamp(object.y - 22, room.y + 16, room.y + room.height - 16)
  }));
}

function getInteractionText(key, state) {
  if (key === "bonus:door") {
    return "The door opens to a tiny bonus room. George is already inside, wearing his badge.";
  }
  if (key === "addon:secret") {
    const game = getMiniGameInfo(state.worldFeature);
    if (game &&
        getMiniGameMode(state) !== "free" &&
        getMiniGameProgress(state) < game.targets.length) {
      return "The hidden door is locked. Finish the main challenge to open its bonus room.";
    }
  }
  if (key.startsWith("game:")) {
    const targetId = key.slice(key.lastIndexOf(":") + 1);
    const game = getMiniGameInfo(state.worldFeature);
    const target = game && game.targets.find((item) => item.id === targetId);
    if (target) {
      return getMiniGameMode(state) === "timed" && target.timedMessage
        ? target.timedMessage
        : target.message;
    }
  }
  if (key.startsWith("addon:")) {
    return ADDON_MESSAGES[key] || "The added detail looks carefully made. Marvin has filed its label alphabetically.";
  }
  return FEATURE_MESSAGES[state.worldFeature] || FEATURE_MESSAGES.empty;
}

class WorldRenderer {
  constructor(context) {
    this.context = context;
  }

  draw({ width, height, state, playerPosition, playerFacing, time, objects, gameTimerRemaining }) {
    if (!width || !height) return;
    const ctx = this.context;
    const room = getRoomBounds(width, height, window.innerWidth);
    const feature = state.worldFeature || "empty";
    const takeoverStarted = Boolean(state.takeoverStarted);
    const takeoverAccents = {
      challenge: "#ffad69",
      negotiate: "#84dff0",
      accept: "#ff76bf"
    };
    const accent = takeoverStarted
      ? takeoverAccents[state.takeoverApproach] || "#ff76bf"
      : accentForMood(state.worldMood);
    const floorY = room.y + room.height * 0.72;
    const interactedObjects = state.interactedObjects || [];

    this.drawBackdrop(width, height, time, takeoverStarted, state.takeoverApproach);
    this.drawRoom(room, floorY, feature, accent, time);
    this.drawFeature(room, floorY, feature, time, state);
    this.drawMiniGameProgress(room, state, gameTimerRemaining);
    this.drawChoiceDecor(room, feature, state, time);
    this.drawRoomAddon(room, state.worldAddon, playerPosition, time, state);
    this.drawCompanionGuide(room, state, playerPosition, objects);
    this.drawPlayer(
      room.x + room.width * playerPosition.x,
      room.y + room.height * playerPosition.y,
      playerFacing,
      height
    );
    this.drawAmbientParticles(room, feature, time);
    if (state.worldGlitched) {
      const glitchIntensity = {
        challenge: 0.58,
        negotiate: 0.18,
        accept: 0.4
      }[state.takeoverApproach] || 0.42;
      this.drawGlitchMarks(
        room,
        takeoverStarted ? glitchIntensity : 0.12,
        time,
        takeoverStarted ? accent : "#ff43af"
      );
    }
    this.drawInteractionMarkers(objects, interactedObjects, time, state);
  }

  drawBackdrop(width, height, time, takeoverStarted, takeoverApproach) {
    const ctx = this.context;
    const background = ctx.createLinearGradient(0, 0, width, height);
    background.addColorStop(0, "#11162d");
    const takeoverBackgrounds = {
      challenge: "#493126",
      negotiate: "#193d4a",
      accept: "#351c48"
    };
    background.addColorStop(
      1,
      takeoverStarted ? takeoverBackgrounds[takeoverApproach] || "#351c48" : "#1d2341"
    );
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = takeoverStarted
      ? "rgba(255, 67, 175, 0.16)"
      : "rgba(119, 227, 255, 0.11)";
    ctx.lineWidth = 1;
    const gridSize = Math.max(28, Math.min(54, width / 18));
    for (let x = 0; x < width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    for (let index = 0; index < 28; index += 1) {
      const x = (index * 173.7 + 41) % width;
      const y = (index * 89.3 + 17) % (height * 0.82);
      const alpha = 0.25 + (Math.sin(time * 1.4 + index) + 1) * 0.18;
      ctx.fillStyle = `rgba(191, 226, 255, ${alpha})`;
      ctx.beginPath();
      ctx.arc(x, y, index % 5 === 0 ? 1.7 : 1, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  drawRoom(room, floorY, feature, accent, time) {
    const ctx = this.context;
    const wall = ctx.createLinearGradient(room.x, room.y, room.x, floorY);
    wall.addColorStop(0, "rgba(34, 41, 73, 0.96)");
    wall.addColorStop(1, "rgba(17, 24, 50, 0.94)");
    ctx.fillStyle = wall;
    ctx.fillRect(room.x, room.y, room.width, room.height);

    ctx.save();
    ctx.shadowColor = accent;
    ctx.shadowBlur = 18;
    ctx.strokeStyle = accent;
    ctx.lineWidth = 2;
    ctx.strokeRect(room.x, room.y, room.width, room.height);
    ctx.restore();

    ctx.fillStyle = "rgba(124, 232, 239, 0.08)";
    ctx.fillRect(room.x + 1, room.y + 1, room.width - 2, room.height * 0.1);
    ctx.fillStyle = "rgba(255, 255, 255, 0.16)";
    ctx.fillRect(room.x + 12, room.y + 12, room.width * 0.18, 2);
    ctx.fillRect(room.x + room.width * 0.78, room.y + 12, room.width * 0.12, 2);

    const floorColors = FLOOR_COLORS[feature] || ["#34304e", "#1d1b35"];
    const floor = ctx.createLinearGradient(room.x, floorY, room.x, room.y + room.height);
    floor.addColorStop(0, floorColors[0]);
    floor.addColorStop(1, floorColors[1]);
    ctx.fillStyle = floor;
    ctx.fillRect(room.x + 1, floorY, room.width - 2, room.y + room.height - floorY - 1);
    ctx.strokeStyle = "rgba(224, 240, 255, 0.09)";
    ctx.lineWidth = 1;
    for (let x = room.x + room.width / 8; x < room.x + room.width; x += room.width / 8) {
      ctx.beginPath();
      ctx.moveTo(x, floorY);
      ctx.lineTo(x, room.y + room.height);
      ctx.stroke();
    }
    for (let row = 1; row <= 2; row += 1) {
      const y = floorY + (room.height * 0.28 * row) / 3;
      ctx.beginPath();
      ctx.moveTo(room.x, y);
      ctx.lineTo(room.x + room.width, y);
      ctx.stroke();
    }

    ctx.fillStyle = accent;
    ctx.globalAlpha = 0.5 + (Math.sin(time * 2) + 1) * 0.12;
    for (let index = 0; index < 3; index += 1) {
      ctx.beginPath();
      ctx.arc(room.x + 18 + index * 10, room.y + 23, 2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  drawChoiceDecor(room, feature, state, time) {
    const ctx = this.context;
    const mood = state.worldMood;
    const ceilingY = room.y + 20;
    const floorBase = room.y + room.height * 0.94;

    ctx.save();
    if (feature === "garden") {
      ctx.strokeStyle = "rgba(146, 239, 155, 0.55)";
      ctx.lineWidth = 2;
      for (const fraction of [0.17, 0.82]) {
        const x = room.x + room.width * fraction;
        ctx.beginPath();
        ctx.moveTo(x, room.y);
        ctx.quadraticCurveTo(x + 5, room.y + 19, x - 2, room.y + 37);
        ctx.stroke();
        ctx.fillStyle = "#92ef9b";
        ctx.beginPath();
        ctx.ellipse(x - 4, room.y + 19, 5, 2.5, -0.5, 0, Math.PI * 2);
        ctx.ellipse(x + 3, room.y + 28, 5, 2.5, 0.5, 0, Math.PI * 2);
        ctx.fill();
      }
      this.drawFloorGrass(room, floorBase, mood === "whimsical", time);
    } else if (feature === "arcade") {
      for (let index = 0; index < 5; index += 1) {
        const x = room.x + room.width * (0.12 + index * 0.19);
        ctx.fillStyle = index % 2 ? "#f06bd5" : "#67e8ff";
        ctx.globalAlpha = 0.42 + Math.sin(time * 3 + index) * 0.12;
        ctx.fillRect(x, ceilingY, room.width * 0.1, 3);
      }
      ctx.globalAlpha = 0.5;
      ctx.fillStyle = mood === "absurd" ? "#f06bd5" : "#67e8ff";
      for (let index = 0; index < 4; index += 1) {
        const x = room.x + room.width * (0.16 + index * 0.2);
        ctx.fillRect(x, floorBase - 3, room.width * 0.09, 2);
      }
    } else if (feature === "observatory") {
      const stars = [
        [0.18, 0.18], [0.29, 0.27], [0.43, 0.16],
        [0.57, 0.25], [0.71, 0.14], [0.84, 0.24]
      ].map(([x, y]) => ({ x: room.x + room.width * x, y: room.y + room.height * y }));
      ctx.strokeStyle = "rgba(198, 213, 255, 0.42)";
      ctx.fillStyle = "#c6d5ff";
      ctx.lineWidth = 1;
      if (mood === "wonder") {
        ctx.beginPath();
        ctx.moveTo(stars[0].x, stars[0].y);
        ctx.lineTo(stars[1].x, stars[1].y);
        ctx.lineTo(stars[2].x, stars[2].y);
        ctx.moveTo(stars[3].x, stars[3].y);
        ctx.lineTo(stars[4].x, stars[4].y);
        ctx.lineTo(stars[5].x, stars[5].y);
        ctx.stroke();
      }
      for (const [index, star] of stars.entries()) {
        ctx.globalAlpha = 0.45 + (Math.sin(time * 2 + index) + 1) * 0.2;
        ctx.beginPath();
        ctx.arc(star.x, star.y, index % 2 ? 2 : 3, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 0.28;
      ctx.strokeStyle = "#c6d5ff";
      ctx.beginPath();
      ctx.moveTo(room.x + room.width * 0.2, floorBase);
      ctx.lineTo(room.x + room.width * 0.8, floorBase);
      ctx.stroke();
      if (mood === "meta") this.drawChangelogPanel(room);
    } else if (feature === "underwater") {
      ctx.strokeStyle = "rgba(132, 223, 240, 0.4)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(room.x + 1, ceilingY + 8);
      for (let index = 0; index <= 8; index += 1) {
        const x = room.x + room.width * index / 8;
        const y = ceilingY + 8 + Math.sin(time * 1.2 + index) * 3;
        ctx.lineTo(x, y);
      }
      ctx.stroke();
      this.drawCoral(room.x + room.width * 0.16, floorBase, mood === "chaotic");
      this.drawCoral(room.x + room.width * 0.84, floorBase, mood === "chaotic");
      if (mood === "orderly") {
        ctx.strokeStyle = "rgba(132, 223, 240, 0.65)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(room.x + room.width * 0.28, floorBase - 3);
        ctx.lineTo(room.x + room.width * 0.72, floorBase - 3);
        ctx.stroke();
        for (const fraction of [0.28, 0.72]) {
          ctx.beginPath();
          ctx.arc(room.x + room.width * fraction, floorBase - 3, 3, 0, Math.PI * 2);
          ctx.stroke();
        }
      } else if (mood === "chaotic") {
        ctx.fillStyle = "rgba(255, 173, 105, 0.72)";
        ctx.beginPath();
        ctx.ellipse(room.x + room.width * 0.73, floorBase - 5, 6, 3, -0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#fff1bd";
        ctx.fillRect(room.x + room.width * 0.73 - 2, floorBase - 6, 4, 1);
      }
    } else {
      ctx.fillStyle = "rgba(255, 173, 105, 0.5)";
      for (let index = 0; index < 3; index += 1) {
        ctx.fillRect(room.x + room.width * (0.2 + index * 0.3), ceilingY, 20, 2);
      }
    }

    if (state.worldLights) {
      const lightColor = state.takeoverStarted ? "#ff76bf" : "#ffe38a";
      for (const fraction of [0.32, 0.68]) {
        const x = room.x + room.width * fraction;
        const glow = 0.13 + (Math.sin(time * 1.7 + fraction) + 1) * 0.04;
        ctx.fillStyle = lightColor;
        ctx.globalAlpha = 0.8;
        ctx.fillRect(x - 9, ceilingY - 2, 18, 3);
        ctx.globalAlpha = glow;
        ctx.beginPath();
        ctx.ellipse(x, ceilingY + 10, 23, 12, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    this.drawKeepsake(room, state.worldKeepsake, time);
    const movedDetailX = room.x + room.width * 0.77 + (state.worldQuietlyChanged ? 5 : 0);
    ctx.globalAlpha = 0.7;
    ctx.fillStyle = state.worldQuietlyChanged
      ? state.worldInspection === "reviewed" ? "#ffe38a" : "#ffb8dc"
      : feature === "garden" ? "#d4bd7b" : accentForMood(mood);
    ctx.fillRect(movedDetailX, floorBase - 5, 7, 3);
    this.drawBranchDetails(room, feature, state, time, floorBase);
    ctx.restore();
  }

  drawBranchDetails(room, feature, state, time, floorBase) {
    const ctx = this.context;
    const x = room.x + room.width * 0.5;
    const y = room.y + room.height * 0.4;

    if (state.collaborationStyle === "careful") {
      ctx.save();
      ctx.strokeStyle = "rgba(255, 227, 138, 0.65)";
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.strokeRect(room.x + room.width * 0.27, floorBase - 20, room.width * 0.46, 16);
      ctx.restore();
    } else if (state.collaborationStyle === "collaborative") {
      ctx.strokeStyle = "#78dce7";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(x - 5, room.y + room.height * 0.19, 5, 0, Math.PI * 2);
      ctx.arc(x + 5, room.y + room.height * 0.19, 5, 0, Math.PI * 2);
      ctx.stroke();
    } else if (state.collaborationStyle === "playful") {
      this.drawDoodleStar(x, room.y + room.height * 0.2, 11, "#ffb8dc");
      this.drawDoodleStar(x + room.width * 0.12, y, 7, "#ffe38a");
    }

    if (state.worldAddon === "negative-space") {
      const emptyX = room.x + room.width * 0.84;
      const emptyY = room.y + room.height * 0.58;
      ctx.strokeStyle = "rgba(198, 213, 255, 0.55)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(emptyX - 10, emptyY - 8);
      ctx.lineTo(emptyX - 10, emptyY - 3);
      ctx.moveTo(emptyX - 10, emptyY - 8);
      ctx.lineTo(emptyX - 5, emptyY - 8);
      ctx.moveTo(emptyX + 10, emptyY - 8);
      ctx.lineTo(emptyX + 10, emptyY - 3);
      ctx.moveTo(emptyX + 10, emptyY - 8);
      ctx.lineTo(emptyX + 5, emptyY - 8);
      ctx.moveTo(emptyX - 10, emptyY + 8);
      ctx.lineTo(emptyX - 10, emptyY + 3);
      ctx.moveTo(emptyX - 10, emptyY + 8);
      ctx.lineTo(emptyX - 5, emptyY + 8);
      ctx.moveTo(emptyX + 10, emptyY + 8);
      ctx.lineTo(emptyX + 10, emptyY + 3);
      ctx.moveTo(emptyX + 10, emptyY + 8);
      ctx.lineTo(emptyX + 5, emptyY + 8);
      ctx.stroke();
    }

    if (state.worldPathGuide) {
      ctx.strokeStyle = "rgba(132, 223, 240, 0.62)";
      ctx.fillStyle = "#84dff0";
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 4]);
      ctx.beginPath();
      ctx.moveTo(room.x + room.width * 0.14, floorBase - 22);
      ctx.lineTo(room.x + room.width * 0.86, floorBase - 22);
      ctx.stroke();
      ctx.setLineDash([]);
      for (let index = 0; index < 5; index += 1) {
        const x = room.x + room.width * (0.18 + index * 0.16);
        ctx.beginPath();
        ctx.arc(x, floorBase - 22, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    this.drawCreativeDetail(room, state.worldDetail, feature, time);
    this.drawPermissionDetail(room, state.permissionLevel, floorBase);
    this.drawInspectionDetail(room, state.worldInspection, state.worldQuietlyChanged, floorBase);
    this.drawRelationshipDetail(room, state.worldRelationship, time);
    this.drawWarningDetail(room, state.worldWarningResponse, floorBase);
  }

  drawCreativeDetail(room, detail, feature, time) {
    const ctx = this.context;
    if (detail === "sign") {
      const x = room.x + room.width * 0.83;
      const y = room.y + room.height * 0.34;
      ctx.fillStyle = "#4b4260";
      ctx.fillRect(x - 37, y - 10, 74, 20);
      ctx.strokeStyle = "#ffe38a";
      ctx.lineWidth = 1.5;
      ctx.strokeRect(x - 37, y - 10, 74, 20);
      ctx.fillStyle = "#fff1bd";
      ctx.font = "5px monospace";
      ctx.textAlign = "center";
      ctx.fillText("EXACTLY WHAT YOU MEANT", x, y + 2);
    } else if (detail === "reversible") {
      ctx.save();
      ctx.strokeStyle = "rgba(255, 227, 138, 0.8)";
      ctx.lineWidth = 1.5;
      ctx.setLineDash([3, 3]);
      const centerX = room.x + room.width * (feature === "garden" ? 0.55 : 0.5);
      const centerY = room.y + room.height * 0.68;
      ctx.strokeRect(centerX - 18, centerY - 9, 36, 18);
      ctx.restore();
    } else if (detail === "oversized") {
      const pulse = 1 + Math.sin(time * 2) * 0.08;
      this.drawDoodleStar(
        room.x + room.width * 0.82,
        room.y + room.height * 0.22,
        14 * pulse,
        "#ffad69"
      );
    }
  }

  drawPermissionDetail(room, permission, floorBase) {
    const ctx = this.context;
    const x = room.x + room.width * 0.12;
    const y = room.y + room.height * 0.42;
    if (permission === "organize") {
      ctx.strokeStyle = "rgba(132, 223, 240, 0.75)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(room.x + room.width * 0.24, floorBase - 13);
      ctx.lineTo(room.x + room.width * 0.76, floorBase - 13);
      for (const fraction of [0.3, 0.5, 0.7]) {
        const tickX = room.x + room.width * fraction;
        ctx.moveTo(tickX, floorBase - 17);
        ctx.lineTo(tickX, floorBase - 9);
      }
      ctx.stroke();
    } else if (permission === "review") {
      ctx.save();
      ctx.strokeStyle = "rgba(255, 227, 138, 0.8)";
      ctx.lineWidth = 1.5;
      ctx.setLineDash([3, 3]);
      ctx.strokeRect(x - 10, y - 9, 20, 18);
      ctx.restore();
      ctx.fillStyle = "#ffe38a";
      ctx.beginPath();
      ctx.arc(x, y, 2, 0, Math.PI * 2);
      ctx.fill();
    } else if (permission === "ask-first") {
      ctx.strokeStyle = "#ffb8dc";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, y, 8, 0, Math.PI * 2);
      ctx.moveTo(x - 4, y);
      ctx.lineTo(x + 4, y);
      ctx.stroke();
    }
  }

  drawInspectionDetail(room, inspection, changed, floorBase) {
    if (inspection === "none") return;
    const ctx = this.context;
    const x = room.x + room.width * 0.77 + (changed ? 5 : 0);
    const y = floorBase - 12;
    ctx.strokeStyle = inspection === "restored" ? "#92ef9b" : "#ffe38a";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    if (inspection === "reviewed") {
      ctx.arc(x + 8, y - 2, 4, 0, Math.PI * 2);
      ctx.moveTo(x + 11, y + 1);
      ctx.lineTo(x + 14, y + 4);
    } else {
      ctx.arc(x + 4, y - 1, 4, 0, Math.PI * 2);
      if (inspection === "restored") {
        ctx.moveTo(x + 1, y - 1);
        ctx.lineTo(x + 3, y + 1);
        ctx.lineTo(x + 7, y - 3);
      }
    }
    ctx.stroke();
  }

  drawRelationshipDetail(room, relationship, time) {
    if (!relationship || relationship === "none") return;
    const ctx = this.context;
    const x = room.x + room.width * 0.88;
    const y = room.y + room.height * 0.16;
    ctx.save();
    ctx.lineWidth = 1.5;
    if (relationship === "boundary") {
      ctx.strokeStyle = "#ffe38a";
      ctx.strokeRect(x - 7, y - 6, 14, 12);
      ctx.beginPath();
      ctx.moveTo(x - 3, y);
      ctx.lineTo(x + 3, y);
      ctx.stroke();
    } else if (relationship === "uneasy") {
      ctx.strokeStyle = "#ff89aa";
      ctx.beginPath();
      ctx.moveTo(x - 9, y);
      ctx.lineTo(x - 4, y - 4);
      ctx.lineTo(x, y + 4);
      ctx.lineTo(x + 4, y - 4);
      ctx.lineTo(x + 9, y);
      ctx.stroke();
    } else {
      ctx.strokeStyle = "#ffb8dc";
      ctx.beginPath();
      ctx.arc(x - 4, y, 4, 0, Math.PI * 2);
      ctx.arc(x + 4, y, 4, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = `rgba(255, 184, 220, ${0.22 + (Math.sin(time * 2) + 1) * 0.08})`;
      ctx.beginPath();
      ctx.arc(x, y, 13, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  drawWarningDetail(room, response, floorBase) {
    const ctx = this.context;
    if (response === "reviewer") {
      ctx.strokeStyle = "#ffe38a";
      ctx.lineWidth = 2;
      ctx.strokeRect(room.x + room.width * 0.24, room.y + room.height * 0.3, room.width * 0.52, room.height * 0.44);
    } else if (response === "housekeeping") {
      ctx.fillStyle = "#84dff0";
      for (let index = 0; index < 4; index += 1) {
        ctx.fillRect(room.x + room.width * (0.32 + index * 0.1), floorBase - 7, 5, 3);
      }
    } else if (response === "optimize") {
      ctx.strokeStyle = "rgba(132, 223, 240, 0.75)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(room.x + room.width * 0.2, floorBase - 18);
      ctx.lineTo(room.x + room.width * 0.5, floorBase - 5);
      ctx.lineTo(room.x + room.width * 0.8, floorBase - 18);
      ctx.stroke();
    }
  }

  drawDoodleStar(x, y, radius, color) {
    const ctx = this.context;
    ctx.fillStyle = color;
    ctx.beginPath();
    for (let point = 0; point < 10; point += 1) {
      const angle = -Math.PI / 2 + point * Math.PI / 5;
      const pointRadius = point % 2 === 0 ? radius : radius * 0.42;
      const starX = x + Math.cos(angle) * pointRadius;
      const starY = y + Math.sin(angle) * pointRadius;
      if (point === 0) ctx.moveTo(starX, starY);
      else ctx.lineTo(starX, starY);
    }
    ctx.closePath();
    ctx.fill();
  }

  drawChangelogPanel(room) {
    const ctx = this.context;
    const x = room.x + room.width * 0.78;
    const y = room.y + room.height * 0.33;
    ctx.save();
    ctx.globalAlpha = 1;
    ctx.fillStyle = "rgba(20, 25, 50, 0.92)";
    ctx.fillRect(x - 24, y - 28, 48, 56);
    ctx.strokeStyle = "#ffad69";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x - 24, y - 28, 48, 56);
    ctx.fillStyle = "#ffe2bd";
    ctx.font = "5px monospace";
    ctx.textAlign = "center";
    ctx.fillText("CHANGELOG", x, y - 19);
    for (let index = 0; index < 4; index += 1) {
      const lineY = y - 10 + index * 8;
      ctx.fillStyle = index === 3 ? "#ffad69" : "#c6d5ff";
      ctx.fillRect(x - 17, lineY, 5, 3);
      ctx.fillStyle = "rgba(224, 232, 255, 0.65)";
      ctx.fillRect(x - 9, lineY + 1, 22 - index * 2, 1.5);
    }
    ctx.restore();
  }

  drawFloorGrass(room, floorBase, flowers, time) {
    const ctx = this.context;
    ctx.strokeStyle = "#92ef9b";
    ctx.lineWidth = 2;
    for (let index = 0; index < 7; index += 1) {
      const x = room.x + room.width * (0.12 + index * 0.12);
      const height = 5 + (index % 3) * 2;
      ctx.beginPath();
      ctx.moveTo(x, floorBase);
      ctx.lineTo(x + Math.sin(time + index) * 2, floorBase - height);
      ctx.stroke();
      if (flowers && index % 2 === 0) {
        ctx.fillStyle = index % 4 === 0 ? "#ffb8dc" : "#ffe38a";
        ctx.beginPath();
        ctx.arc(x, floorBase - height - 2, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  drawCoral(x, floorBase, lively) {
    const ctx = this.context;
    const coralHeight = lively ? 16 : 12;
    ctx.strokeStyle = lively ? "#ffad69" : "#84dff0";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, floorBase);
    ctx.lineTo(x, floorBase - coralHeight);
    ctx.moveTo(x, floorBase - 7);
    ctx.lineTo(x - 6, floorBase - 12);
    ctx.moveTo(x, floorBase - 9);
    ctx.lineTo(x + 7, floorBase - 15);
    ctx.stroke();
  }

  drawKeepsake(room, keepsake, time) {
    if (!keepsake || keepsake === "none") return;
    const ctx = this.context;
    const positions = {
      landmark: [0.15, 0.45],
      quiet: [0.85, 0.45],
      credit: [0.5, 0.34]
    };
    const position = positions[keepsake];
    if (!position) return;

    const x = room.x + room.width * position[0];
    const y = room.y + room.height * position[1];
    const pulse = 0.75 + (Math.sin(time * 2) + 1) * 0.12;
    ctx.save();
    ctx.globalAlpha = pulse;
    ctx.strokeStyle = "#ffe38a";
    ctx.fillStyle = "rgba(255, 227, 138, 0.16)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(x, y, 13, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    if (keepsake === "landmark") {
      ctx.fillStyle = "#ffb8dc";
      ctx.beginPath();
      for (let point = 0; point < 10; point += 1) {
        const angle = -Math.PI / 2 + point * Math.PI / 5;
        const radius = point % 2 === 0 ? 8 : 3.5;
        const starX = x + Math.cos(angle) * radius;
        const starY = y + Math.sin(angle) * radius;
        if (point === 0) ctx.moveTo(starX, starY);
        else ctx.lineTo(starX, starY);
      }
      ctx.closePath();
      ctx.fill();
    } else if (keepsake === "quiet") {
      ctx.strokeStyle = "#ffe38a";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x - 7, y + 6);
      ctx.lineTo(x + 7, y + 6);
      ctx.moveTo(x - 4, y + 6);
      ctx.lineTo(x - 4, y + 1);
      ctx.lineTo(x + 4, y + 1);
      ctx.lineTo(x + 4, y + 6);
      ctx.stroke();
      ctx.fillStyle = "#fff1bd";
      ctx.beginPath();
      ctx.arc(x, y - 3, 4, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.strokeStyle = "#78dce7";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x - 4, y, 5, 0, Math.PI * 2);
      ctx.arc(x + 4, y, 5, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }

  drawFeature(room, floorY, feature, time, state) {
    const ctx = this.context;
    if (feature === "garden") {
      ctx.strokeStyle = "rgba(226, 196, 128, 0.35)";
      ctx.lineWidth = Math.max(8, room.width * 0.025);
      ctx.beginPath();
      ctx.moveTo(room.x + room.width * 0.3, floorY);
      ctx.bezierCurveTo(
        room.x + room.width * 0.4,
        floorY - 24,
        room.x + room.width * 0.53,
        floorY - 18,
        room.x + room.width * 0.7,
        floorY
      );
      ctx.stroke();
      this.drawPlant(room.x + room.width * 0.39, floorY, room.height * 0.38, time);
      this.drawPlant(room.x + room.width * 0.7, floorY, room.height * 0.3, time + 1);
      this.drawFrog(room.x + room.width * 0.55, floorY - 2, time);
      if (state.worldMood === "whimsical") {
        this.drawFrogOffice(room.x + room.width * 0.83, floorY, room.height * 0.2);
      }
    } else if (feature === "arcade") {
      if (state.worldMood === "varied") {
        this.drawArcadeCabinet(room.x + room.width * 0.38, floorY - room.height * 0.28, room.height * 0.28, time, "maze");
        this.drawArcadeCabinet(room.x + room.width * 0.6, floorY - room.height * 0.25, room.height * 0.25, time + 1, "rhythm");
        this.drawArcadeCabinet(room.x + room.width * 0.82, floorY - room.height * 0.23, room.height * 0.23, time + 2, "settings");
      } else {
        this.drawArcadeCabinet(room.x + room.width * 0.38, floorY - room.height * 0.29, room.height * 0.29, time, "loading");
        this.drawArcadeCabinet(room.x + room.width * 0.6, floorY - room.height * 0.31, room.height * 0.31, time + 1, "loading");
        this.drawArcadeCabinet(room.x + room.width * 0.82, floorY - room.height * 0.26, room.height * 0.26, time + 2, "loading");
      }
      ctx.fillStyle = "rgba(240, 107, 213, 0.15)";
      ctx.fillRect(room.x + room.width * 0.2, floorY - 5, room.width * 0.68, 4);
    } else if (feature === "observatory") {
      this.drawObservatory(room.x + room.width * 0.55, floorY, room.height * 0.48, time);
    } else if (feature === "underwater") {
      this.drawArchiveCabinet(room.x + room.width * 0.55, floorY, room.height * 0.43, time, state.worldMood);
      this.drawFish(room.x + room.width * 0.28, floorY - room.height * 0.34, time);
    } else {
      this.drawWorkbench(room.x + room.width * 0.48, floorY - room.height * 0.15, room.height * 0.22);
    }
  }

  drawMiniGameProgress(room, state, gameTimerRemaining) {
    const game = getMiniGameInfo(state.worldFeature);
    const mode = getMiniGameMode(state);
    if (!game || mode === "free") return;

    const ctx = this.context;
    const progress = getMiniGameProgress(state);
    const remaining = gameTimerRemaining === null ? null : Math.ceil(gameTimerRemaining);
    const status = progress === game.targets.length
      ? "DONE"
      : mode === "timed"
        ? remaining === null
          ? "READY"
          : state.worldFeature === "underwater"
            ? `O2 ${remaining}s`
            : state.worldFeature === "arcade"
              ? `${progress * 100}pt ${remaining}s`
              : `${remaining}s`
        : `NEXT ${progress + 1}/${game.targets.length}`;
    const width = Math.min(room.width * 0.56, 190);
    const x = room.x + (room.width - width) / 2;
    const y = room.y + 8;
    ctx.save();
    ctx.fillStyle = "rgba(12, 15, 33, 0.92)";
    ctx.fillRect(x, y, width, 27);
    ctx.strokeStyle = progress === game.targets.length ? "#92ef9b" : "#7ce8ef";
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, width, 27);
    ctx.fillStyle = "#f5f4ff";
    ctx.font = "bold 8px monospace";
    ctx.textAlign = "left";
    ctx.fillText(game.name.toUpperCase(), x + 7, y + 10);
    ctx.textAlign = "right";
    ctx.fillText(status, x + width - 7, y + 10);
    const segmentGap = 3;
    const segmentWidth = (width - 14 - segmentGap * (game.targets.length - 1)) / game.targets.length;
    for (let index = 0; index < game.targets.length; index += 1) {
      ctx.fillStyle = index < progress ? "#92ef9b" : "rgba(124, 232, 239, 0.2)";
      ctx.fillRect(x + 7 + index * (segmentWidth + segmentGap), y + 16, segmentWidth, 5);
    }
    ctx.restore();
  }

  drawCompanionGuide(room, state, playerPosition, objects) {
    if (state.worldAddon !== "companion" || getMiniGameMode(state) === "free") return;
    const target = objects.find((object) => object.key.startsWith("game:"));
    if (!target) return;

    const ctx = this.context;
    ctx.save();
    ctx.strokeStyle = "rgba(255, 184, 220, 0.45)";
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 5]);
    ctx.beginPath();
    ctx.moveTo(
      room.x + room.width * playerPosition.x,
      room.y + room.height * playerPosition.y - 8
    );
    ctx.lineTo(target.markerX, target.markerY);
    ctx.stroke();
    ctx.restore();
  }

  drawPlayer(x, floorY, facing, worldHeight) {
    const ctx = this.context;
    const scale = clamp(worldHeight / 480, 0.7, 1.15);
    ctx.save();
    ctx.translate(x, floorY);
    ctx.scale(scale * (facing < 0 ? -1 : 1), scale);

    ctx.fillStyle = "rgba(8, 12, 25, 0.38)";
    ctx.beginPath();
    ctx.ellipse(0, 1, 14, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#263650";
    ctx.fillRect(-7, -15, 5, 11);
    ctx.fillRect(2, -15, 5, 11);
    ctx.fillStyle = "#78dce7";
    ctx.fillRect(-9, -6, 9, 4);
    ctx.fillRect(1, -6, 9, 4);
    ctx.fillStyle = "#d8edf0";
    ctx.fillRect(-10, -3, 10, 3);
    ctx.fillRect(1, -3, 10, 3);

    ctx.strokeStyle = "#263650";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-9, -35);
    ctx.lineTo(-14, -26);
    ctx.moveTo(9, -35);
    ctx.lineTo(14, -26);
    ctx.stroke();
    ctx.fillStyle = "#ffd98e";
    ctx.beginPath();
    ctx.arc(-14, -25, 3, 0, Math.PI * 2);
    ctx.arc(14, -25, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#405675";
    ctx.beginPath();
    ctx.moveTo(-11, -41);
    ctx.quadraticCurveTo(-11, -44, -7, -44);
    ctx.lineTo(7, -44);
    ctx.quadraticCurveTo(11, -44, 11, -41);
    ctx.lineTo(10, -22);
    ctx.quadraticCurveTo(0, -18, -10, -22);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#78dce7";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = "#17243d";
    ctx.fillRect(-7, -38, 14, 9);
    ctx.fillStyle = "#78dce7";
    ctx.fillRect(-4, -35, 3, 2);
    ctx.fillRect(2, -35, 3, 2);
    ctx.fillStyle = "#ffd98e";
    ctx.fillRect(-3, -31, 6, 1.5);
    ctx.fillStyle = "#e6b96d";
    ctx.fillRect(-8, -25, 16, 2);
    ctx.fillStyle = "#92ef9b";
    ctx.fillRect(-2, -24, 4, 1.5);

    ctx.strokeStyle = "#d8edf0";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, -44);
    ctx.lineTo(0, -51);
    ctx.stroke();
    ctx.fillStyle = "#ffb8dc";
    ctx.beginPath();
    ctx.arc(0, -53, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#405675";
    ctx.beginPath();
    ctx.moveTo(-10, -58);
    ctx.quadraticCurveTo(-10, -64, -5, -64);
    ctx.lineTo(5, -64);
    ctx.quadraticCurveTo(10, -64, 10, -58);
    ctx.lineTo(9, -48);
    ctx.quadraticCurveTo(0, -45, -9, -48);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#78dce7";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = "#17243d";
    ctx.fillRect(-7, -59, 14, 6);
    ctx.fillStyle = "#78e6f0";
    ctx.shadowColor = "#78e6f0";
    ctx.shadowBlur = 4;
    ctx.fillRect(-4, -57, 2, 2);
    ctx.fillRect(2, -57, 2, 2);
    ctx.shadowBlur = 0;
    ctx.fillStyle = "#ffd98e";
    ctx.fillRect(-1, -50, 2, 2);

    for (const boltX of [-7, 7]) {
      ctx.fillStyle = "#ffd98e";
      ctx.beginPath();
      ctx.arc(boltX, -40, 1, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  drawPlant(x, floorY, plantHeight, time) {
    const ctx = this.context;
    const sway = Math.sin(time * 1.7 + x) * 3;
    ctx.fillStyle = "rgba(8, 20, 27, 0.22)";
    ctx.beginPath();
    ctx.ellipse(x, floorY, 14, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#92ef9b";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(x, floorY);
    ctx.lineTo(x + sway, floorY - plantHeight);
    ctx.moveTo(x + sway * 0.45, floorY - plantHeight * 0.45);
    ctx.lineTo(x - plantHeight * 0.22, floorY - plantHeight * 0.62);
    ctx.moveTo(x + sway * 0.7, floorY - plantHeight * 0.65);
    ctx.lineTo(x + plantHeight * 0.22, floorY - plantHeight * 0.81);
    ctx.stroke();
    ctx.fillStyle = "#ffb8d2";
    ctx.beginPath();
    ctx.arc(x + sway, floorY - plantHeight, 6, 0, Math.PI * 2);
    ctx.fill();
  }

  drawFrog(x, floorY, time) {
    const ctx = this.context;
    const hop = Math.max(0, Math.sin(time * 2.4)) * 3;
    ctx.save();
    ctx.translate(x, floorY - hop);
    ctx.fillStyle = "rgba(8, 20, 27, 0.25)";
    ctx.beginPath();
    ctx.ellipse(0, 4 + hop, 14, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#92ef9b";
    ctx.beginPath();
    ctx.ellipse(0, -5, 12, 8, 0, 0, Math.PI * 2);
    ctx.arc(-6, -12, 4, 0, Math.PI * 2);
    ctx.arc(6, -12, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#fff1bd";
    ctx.beginPath();
    ctx.arc(-6, -12, 2, 0, Math.PI * 2);
    ctx.arc(6, -12, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#28324a";
    ctx.beginPath();
    ctx.arc(-6, -12, 1, 0, Math.PI * 2);
    ctx.arc(6, -12, 1, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#365a47";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, -5, 5, 0.2, Math.PI - 0.2);
    ctx.stroke();
    ctx.restore();
  }

  drawFrogOffice(x, floorY, officeHeight) {
    const ctx = this.context;
    const width = Math.max(28, officeHeight * 0.58);
    ctx.fillStyle = "rgba(8, 20, 27, 0.25)";
    ctx.beginPath();
    ctx.ellipse(x, floorY + 1, width * 0.62, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#704b70";
    ctx.fillRect(x - width / 2, floorY - 13, width, 4);
    ctx.fillRect(x - width * 0.38, floorY - 9, 3, 9);
    ctx.fillRect(x + width * 0.32, floorY - 9, 3, 9);
    ctx.fillStyle = "#29304d";
    ctx.fillRect(x - width * 0.34, floorY - 24, width * 0.68, 10);
    ctx.strokeStyle = "#ffb8dc";
    ctx.lineWidth = 1;
    ctx.strokeRect(x - width * 0.34, floorY - 24, width * 0.68, 10);
    ctx.fillStyle = "#fff1bd";
    ctx.font = "5px monospace";
    ctx.textAlign = "center";
    ctx.fillText("GEORGE", x, floorY - 18);
    ctx.fillStyle = "#92ef9b";
    ctx.fillRect(x + width * 0.42, floorY - 19, 4, 5);
  }

  drawArcadeCabinet(x, top, cabinetHeight, time, gameType) {
    const ctx = this.context;
    const cabinetWidth = cabinetHeight * 0.57;
    ctx.fillStyle = "rgba(5, 8, 22, 0.38)";
    ctx.beginPath();
    ctx.ellipse(x, top + cabinetHeight + 3, cabinetWidth * 0.65, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#34305e";
    ctx.fillRect(x - cabinetWidth / 2, top, cabinetWidth, cabinetHeight);
    ctx.strokeStyle = "#f06bd5";
    ctx.lineWidth = 2;
    ctx.strokeRect(x - cabinetWidth / 2, top, cabinetWidth, cabinetHeight);
    const screenX = x - cabinetWidth * 0.34;
    const screenY = top + cabinetHeight * 0.12;
    const screenWidth = cabinetWidth * 0.68;
    const screenHeight = cabinetHeight * 0.28;
    ctx.fillStyle = "#111a35";
    ctx.fillRect(screenX, screenY, screenWidth, screenHeight);
    if (gameType === "maze") {
      ctx.strokeStyle = "#67e8ff";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(screenX + 3, screenY + 3);
      ctx.lineTo(screenX + screenWidth * 0.42, screenY + 3);
      ctx.lineTo(screenX + screenWidth * 0.42, screenY + screenHeight * 0.52);
      ctx.lineTo(screenX + screenWidth - 3, screenY + screenHeight * 0.52);
      ctx.lineTo(screenX + screenWidth - 3, screenY + screenHeight - 3);
      ctx.moveTo(screenX + 3, screenY + screenHeight - 3);
      ctx.lineTo(screenX + 3, screenY + screenHeight * 0.52);
      ctx.lineTo(screenX + screenWidth * 0.7, screenY + screenHeight * 0.52);
      ctx.stroke();
      ctx.fillStyle = "#ffe38a";
      ctx.beginPath();
      ctx.arc(screenX + screenWidth * 0.22, screenY + screenHeight * 0.28, 1.5, 0, Math.PI * 2);
      ctx.fill();
    } else if (gameType === "rhythm") {
      for (let beat = 0; beat < 4; beat += 1) {
        ctx.fillStyle = beat === Math.floor((time * 3) % 4) ? "#ffb8dc" : "#67e8ff";
        ctx.fillRect(
          screenX + 3 + beat * (screenWidth - 8) / 4,
          screenY + 2,
          3,
          screenHeight - 4
        );
      }
    } else if (gameType === "settings") {
      ctx.fillStyle = "#c6d5ff";
      for (let row = 0; row < 3; row += 1) {
        const rowY = screenY + 3 + row * (screenHeight - 5) / 3;
        ctx.fillRect(screenX + 3, rowY, 2, 2);
        ctx.fillRect(screenX + 7, rowY + 0.5, screenWidth - 10, 1);
      }
    } else {
      ctx.fillStyle = "rgba(103, 232, 255, 0.25)";
      ctx.fillRect(screenX + 3, screenY + 3, screenWidth - 6, screenHeight - 6);
      const progress = 0.15 + (Math.sin(time * 2.4 + x) + 1) * 0.35;
      ctx.fillStyle = Math.sin(time * 2.4 + x) > 0 ? "#67e8ff" : "#f06bd5";
      ctx.fillRect(screenX + 3, screenY + screenHeight / 2 - 2, (screenWidth - 6) * progress, 4);
    }
    ctx.fillStyle = "#1e2140";
    ctx.fillRect(x - cabinetWidth * 0.38, top + cabinetHeight * 0.47, cabinetWidth * 0.76, cabinetHeight * 0.11);
    ctx.fillStyle = "#ffe38a";
    ctx.beginPath();
    ctx.arc(x - cabinetWidth * 0.2, top + cabinetHeight * 0.53, 3, 0, Math.PI * 2);
    ctx.arc(x + cabinetWidth * 0.14, top + cabinetHeight * 0.54, 2, 0, Math.PI * 2);
    ctx.fill();
  }

  drawWorkbench(x, top, tableHeight) {
    const ctx = this.context;
    ctx.fillStyle = "rgba(6, 10, 25, 0.3)";
    ctx.beginPath();
    ctx.ellipse(x, top + tableHeight * 0.7, 43, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#a85f8f";
    ctx.fillRect(x - 38, top, 76, 8);
    ctx.fillStyle = "#704b70";
    ctx.fillRect(x - 30, top + 8, 6, tableHeight * 0.68);
    ctx.fillRect(x + 24, top + 8, 6, tableHeight * 0.68);
    ctx.fillStyle = "#77e8ee";
    ctx.fillRect(x - 14, top - 18, 28, 18);
    ctx.fillStyle = "#1c2948";
    ctx.fillRect(x - 10, top - 14, 20, 9);
    ctx.fillStyle = "#fff1bd";
    ctx.fillRect(x - 7, top - 11, 12, 2);
    ctx.fillStyle = "#ffad69";
    ctx.fillRect(x + 19, top - 4, 8, 4);
  }

  drawObservatory(x, floorY, telescopeHeight, time) {
    const ctx = this.context;
    const domeTop = floorY - telescopeHeight * 0.66;
    ctx.fillStyle = "rgba(167, 193, 255, 0.08)";
    ctx.beginPath();
    ctx.arc(x, domeTop, telescopeHeight * 0.58, Math.PI, 0);
    ctx.fill();
    ctx.fillStyle = "#414775";
    ctx.fillRect(x - 32, floorY - telescopeHeight * 0.62, 64, telescopeHeight * 0.62);
    ctx.strokeStyle = "#c6d5ff";
    ctx.lineWidth = 2;
    ctx.strokeRect(x - 32, floorY - telescopeHeight * 0.62, 64, telescopeHeight * 0.62);

    ctx.save();
    ctx.translate(x, floorY - telescopeHeight * 0.62);
    ctx.rotate(-Math.PI / 5);
    ctx.fillStyle = "#242949";
    ctx.fillRect(-8, -telescopeHeight * 0.42, 16, telescopeHeight * 0.46);
    ctx.strokeStyle = "#c6d5ff";
    ctx.strokeRect(-8, -telescopeHeight * 0.42, 16, telescopeHeight * 0.46);
    ctx.fillStyle = "#ffe38a";
    ctx.beginPath();
    ctx.arc(0, -telescopeHeight * 0.4, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.fillStyle = "#ffe38a";
    ctx.globalAlpha = 0.55 + (Math.sin(time * 2.4) + 1) * 0.2;
    for (let index = 0; index < 5; index += 1) {
      ctx.beginPath();
      ctx.arc(x - 38 + index * 19, floorY - telescopeHeight * (0.78 + (index % 2) * 0.1), 2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  drawArchiveCabinet(x, floorY, cabinetHeight, time, mood) {
    const ctx = this.context;
    const cabinetWidth = cabinetHeight * 0.76;
    const top = floorY - cabinetHeight;
    ctx.fillStyle = "rgba(4, 18, 36, 0.3)";
    ctx.beginPath();
    ctx.ellipse(x, floorY + 2, cabinetWidth * 0.65, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#173b56";
    ctx.fillRect(x - cabinetWidth / 2, top, cabinetWidth, cabinetHeight);
    ctx.strokeStyle = "#84dff0";
    ctx.lineWidth = 2;
    ctx.strokeRect(x - cabinetWidth / 2, top, cabinetWidth, cabinetHeight);

    for (let shelf = 1; shelf <= 2; shelf += 1) {
      const shelfY = top + cabinetHeight * shelf / 3;
      ctx.fillStyle = "#84dff0";
      ctx.fillRect(x - cabinetWidth * 0.42, shelfY, cabinetWidth * 0.84, 3);
      for (let book = 0; book < 4; book += 1) {
        const bookX = x - cabinetWidth * 0.34 + book * cabinetWidth * 0.18;
        const bookHeight = cabinetHeight * (mood === "chaotic" ? 0.1 + ((book + shelf) % 3) * 0.025 : 0.14);
        const bookColors = mood === "chaotic"
          ? ["#ffad69", "#ffb8dc", "#92ef9b", "#ffe38a"]
          : ["#ffb8dc", "#ffe38a", "#84dff0", "#c6d5ff"];
        ctx.save();
        if (mood === "chaotic") {
          ctx.translate(bookX, shelfY);
          ctx.rotate((book % 2 === 0 ? -1 : 1) * 0.12);
          ctx.fillStyle = bookColors[(book + shelf) % bookColors.length];
          ctx.fillRect(-cabinetWidth * 0.06, -bookHeight, cabinetWidth * 0.12, bookHeight);
          ctx.restore();
        } else {
          ctx.fillStyle = bookColors[book];
          ctx.fillRect(bookX, shelfY - bookHeight, cabinetWidth * 0.12, bookHeight);
          ctx.fillStyle = "#173b56";
          ctx.fillRect(bookX + cabinetWidth * 0.02, shelfY - bookHeight * 0.55, cabinetWidth * 0.08, 1);
          ctx.restore();
        }
      }
    }

    if (mood === "chaotic") {
      ctx.fillStyle = "#ffad69";
      ctx.beginPath();
      ctx.ellipse(x + cabinetWidth * 0.3, floorY - 5, 7, 4, -0.15, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#fff1bd";
      ctx.fillRect(x + cabinetWidth * 0.3 - 3, floorY - 6, 6, 1);
    }

    ctx.fillStyle = "rgba(164, 237, 255, 0.8)";
    for (let index = 0; index < 4; index += 1) {
      ctx.beginPath();
      const bubbleX = x - cabinetWidth * 0.7 + index * 13 + Math.sin(time + index) * 4;
      const bubbleY = top + ((time * 14 + index * 19) % cabinetHeight);
      ctx.arc(bubbleX, bubbleY, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  drawFish(x, y, time) {
    const ctx = this.context;
    const swimX = x + Math.sin(time * 1.3) * 16;
    const swimY = y + Math.sin(time * 2.2) * 5;
    ctx.save();
    ctx.translate(swimX, swimY);
    ctx.fillStyle = "#ffad69";
    ctx.beginPath();
    ctx.ellipse(0, 0, 13, 7, 0, 0, Math.PI * 2);
    ctx.moveTo(-11, 0);
    ctx.lineTo(-20, -7);
    ctx.lineTo(-20, 7);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#243451";
    ctx.beginPath();
    ctx.arc(6, -1, 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  drawRoomAddon(room, addon, playerPosition, time, state) {
    const position = getAddonPosition(addon, playerPosition);
    if (!position || addon === "none") return;
    const ctx = this.context;
    const x = room.x + room.width * position.roomX;
    const y = room.y + room.height * position.roomY;

    if (addon === "companion") {
      const bob = Math.sin(time * 3) * 4;
      ctx.fillStyle = "rgba(255, 184, 220, 0.16)";
      ctx.beginPath();
      ctx.arc(x, y + bob, 17, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#ffb8dc";
      ctx.beginPath();
      ctx.ellipse(x - 7, y + bob, 5, 8, -0.5, 0, Math.PI * 2);
      ctx.ellipse(x + 7, y + bob, 5, 8, 0.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#ffe38a";
      ctx.beginPath();
      ctx.arc(x, y + bob, 4, 0, Math.PI * 2);
      ctx.fill();
    } else if (addon === "secret") {
      const doorWidth = Math.max(34, room.width * 0.09);
      const doorHeight = Math.max(48, room.height * 0.19);
      const opened = (state.interactedObjects || []).includes("bonus:door");
      ctx.fillStyle = opened ? "rgba(5, 10, 28, 0.95)" : "rgba(18, 20, 42, 0.88)";
      ctx.fillRect(x - doorWidth / 2, y - doorHeight / 2, doorWidth, doorHeight);
      ctx.strokeStyle = opened ? "#92ef9b" : "#c6d5ff";
      ctx.lineWidth = 2;
      ctx.strokeRect(x - doorWidth / 2, y - doorHeight / 2, doorWidth, doorHeight);
      if (opened) {
        ctx.fillStyle = "rgba(120, 232, 239, 0.28)";
        ctx.fillRect(x - doorWidth * 0.32, y - doorHeight * 0.42, doorWidth * 0.64, doorHeight * 0.84);
      }
      ctx.fillStyle = "#ffe38a";
      ctx.beginPath();
      ctx.arc(x + doorWidth * 0.27, y + 3, 2.5, 0, Math.PI * 2);
      ctx.fill();
    } else if (addon === "weather") {
      this.drawWeatherMachine(x, y, time);
    }
  }

  drawWeatherMachine(x, y, time) {
    const ctx = this.context;
    const drift = Math.sin(time * 0.7) * 7;
    ctx.fillStyle = "#d1e8ff";
    ctx.beginPath();
    ctx.arc(x - 11 + drift, y, 10, Math.PI, 0);
    ctx.arc(x + drift, y - 5, 13, Math.PI, 0);
    ctx.arc(x + 12 + drift, y, 9, Math.PI, 0);
    ctx.fillRect(x - 20 + drift, y, 40, 8);
    ctx.fill();
    ctx.strokeStyle = "rgba(124, 232, 239, 0.8)";
    ctx.lineWidth = 2;
    for (let index = 0; index < 3; index += 1) {
      const dropY = y + 12 + ((time * 18 + index * 11) % 18);
      ctx.beginPath();
      ctx.moveTo(x - 10 + index * 10 + drift, dropY);
      ctx.lineTo(x - 13 + index * 10 + drift, dropY + 5);
      ctx.stroke();
    }
    ctx.fillStyle = "#454563";
    ctx.fillRect(x + 25, y + 10, 13, 20);
    ctx.strokeStyle = "#ffad69";
    ctx.strokeRect(x + 25, y + 10, 13, 20);
    ctx.fillStyle = "#92ef9b";
    ctx.beginPath();
    ctx.arc(x + 31.5, y + 16, 2, 0, Math.PI * 2);
    ctx.fill();
  }

  drawAmbientParticles(room, feature, time) {
    const ctx = this.context;
    const colors = {
      garden: "146, 239, 155",
      arcade: "103, 232, 255",
      observatory: "198, 213, 255",
      underwater: "164, 237, 255"
    };
    const color = colors[feature] || "255, 227, 138";
    for (let index = 0; index < 9; index += 1) {
      const x = room.x + room.width * (0.1 + ((index * 0.173) % 0.8));
      const drift = Math.sin(time * (0.7 + index * 0.04) + index) * 5;
      const y = room.y + room.height * (0.19 + ((index * 0.117) % 0.38)) + drift;
      const alpha = 0.25 + (Math.sin(time * 2 + index) + 1) * 0.2;
      ctx.fillStyle = `rgba(${color}, ${alpha})`;
      ctx.beginPath();
      ctx.arc(x, y, index % 3 === 0 ? 2 : 1.3, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  drawGlitchMarks(room, intensity, time, color) {
    const ctx = this.context;
    const red = parseInt(color.slice(1, 3), 16);
    const green = parseInt(color.slice(3, 5), 16);
    const blue = parseInt(color.slice(5, 7), 16);
    ctx.fillStyle = `rgba(${red}, ${green}, ${blue}, ${intensity})`;
    for (let index = 0; index < 4; index += 1) {
      const y = room.y + room.height * (0.2 + index * 0.15);
      const x = room.x + room.width * (0.08 + (index % 2) * 0.74) + Math.sin(time * 2 + index) * 4;
      ctx.fillRect(x, y, room.width * 0.08, 2);
    }
  }

  drawInteractionMarkers(objects, interactedObjects, time, state) {
    const ctx = this.context;
    const mode = getMiniGameMode(state);
    const game = getMiniGameInfo(state.worldFeature);
    const progress = getMiniGameProgress(state);
    const expectedTarget = game && game.targets[progress];
    const expectedKey = mode === "sequence" && expectedTarget
      ? `game:${state.worldFeature}:${expectedTarget.id}`
      : "";
    for (const object of objects) {
      const interacted = interactedObjects.includes(object.key);
      const isGameTarget = object.key.startsWith("game:");
      const isExpected = isGameTarget && object.key === expectedKey;
      const isLocked = isGameTarget && mode === "sequence" && !isExpected;
      const pulse = Math.sin(time * 3 + object.x) * 2;
      ctx.save();
      ctx.globalAlpha = interacted ? 0.55 : isLocked ? 0.4 : 0.9;
      ctx.strokeStyle = interacted
        ? "#92ef9b"
        : isExpected ? "#ffb8dc" : isLocked ? "#78849d" : "#ffe38a";
      ctx.fillStyle = "rgba(14, 18, 38, 0.9)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(object.markerX, object.markerY, 12 + pulse, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = interacted
        ? "#92ef9b"
        : isExpected ? "#ffb8dc" : isLocked ? "#a3adc0" : "#ffe38a";
      ctx.font = "bold 10px monospace";
      ctx.textAlign = "center";
      ctx.fillText(interacted ? "OK" : object.marker || "E", object.markerX, object.markerY + 3);
      ctx.restore();
    }
  }

}

function getAddonPosition(addon, playerPosition) {
  if (addon === "companion") {
    return {
      roomX: clamp(playerPosition.x + 0.12, 0.08, 0.92),
      roomY: clamp(playerPosition.y - 0.16, 0.2, 0.76)
    };
  }
  if (addon === "secret") return { roomX: 0.88, roomY: 0.42 };
  if (addon === "weather") return { roomX: 0.34, roomY: 0.28 };
  return null;
}

function clamp(value, minimum, maximum) {
  return Math.max(minimum, Math.min(maximum, value));
}

function accentForMood(mood) {
  const colors = {
    calm: "#92ef9b",
    whimsical: "#ffb8dc",
    varied: "#67e8ff",
    absurd: "#f06bd5",
    wonder: "#c6d5ff",
    meta: "#ffad69",
    orderly: "#84dff0",
    chaotic: "#ff89aa"
  };
  return colors[mood] || "#57d9eb";
}

window.WorldRendererExports = {
  getInteractionText,
  getMiniGameHint,
  getMiniGameInfo,
  getMiniGameMode,
  getMiniGameProgress,
  getRoomBounds,
  getWorldObjects,
  WorldRenderer
};
})();
