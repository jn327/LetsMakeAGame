(() => {
class StoryView {
  constructor(root) {
    this.root = root;
  }

  render(model) {
    const previousLog = this.root.querySelector(".story-log");
    const atLastLine = model.lineIndex === model.scene.lines.length - 1;
    const showingChoices = atLastLine && (model.scene.choices || !model.scene.next);
    const followLatest = !previousLog ||
      showingChoices ||
      previousLog.scrollHeight - previousLog.scrollTop - previousLog.clientHeight <= 24;
    const previousScrollTop = previousLog ? previousLog.scrollTop : 0;
    const activeButton = document.activeElement instanceof HTMLButtonElement &&
      this.root.contains(document.activeElement)
      ? document.activeElement.textContent
      : null;
    const toolbar = document.createElement("nav");
    toolbar.className = "story-toolbar";
    toolbar.setAttribute("aria-label", "Story controls");

    const saveButton = createButton("Save", model.onSave);
    saveButton.className += " story-button-toolbar";
    saveButton.disabled = model.takeoverStarted;
    if (saveButton.disabled) {
      saveButton.title = "Saving is unavailable right now.";
    }

    const undoButton = createButton("Undo", model.onUndo);
    undoButton.className += " story-button-toolbar";
    undoButton.disabled = !model.canUndo;

    const restartButton = createButton("Restart", model.onRestart);
    restartButton.className += " story-button-toolbar";
    toolbar.append(saveButton, undoButton, restartButton);

    const panel = document.createElement("div");
    panel.className = "story-panel";

    const heading = document.createElement("p");
    heading.className = "story-kicker";
    heading.textContent = "CONVERSATION LOG";
    panel.append(heading);

    const log = document.createElement("div");
    log.className = "story-log";
    log.setAttribute("role", "log");
    log.setAttribute("aria-label", "Conversation history");
    log.setAttribute("aria-live", "polite");
    for (const entry of model.transcript) {
      log.append(createLogEntry(entry));
    }
    panel.append(log);

    if (model.isTyping) {
      const typing = document.createElement("div");
      typing.className = "story-typing";
      typing.setAttribute("role", "status");
      typing.setAttribute("aria-label", "More story text is coming");
      for (let index = 0; index < 3; index += 1) {
        const dot = document.createElement("span");
        dot.className = "story-typing-dot";
        dot.setAttribute("aria-hidden", "true");
        typing.append(dot);
      }
      panel.append(typing);
    }

    if (model.notice) {
      const notice = document.createElement("p");
      notice.className = "story-notice";
      notice.setAttribute("role", "status");
      notice.textContent = model.notice;
      panel.append(notice);
    }

    if (showingChoices) {
      const controls = document.createElement("div");
      controls.className = "story-controls";
      panel.append(controls);

      if (model.scene.choices) {
        model.scene.choices.forEach((choice, index) => {
          controls.append(createButton(`${index + 1}. ${choice.text}`, () => model.onChoose(choice)));
        });
      } else {
        controls.append(createButton("Play again", model.onRestart, true));
      }
    }

    this.root.replaceChildren(toolbar, panel);
    log.scrollTop = followLatest
      ? log.scrollHeight
      : Math.min(previousScrollTop, log.scrollHeight - log.clientHeight);
    if (activeButton) {
      const replacement = [...this.root.querySelectorAll("button")]
        .find((button) => button.textContent === activeButton);
      if (replacement && !replacement.disabled) {
        replacement.focus({ preventScroll: true });
      }
    }
  }
}

function createButton(label, onClick, primary = false) {
  const button = document.createElement("button");
  button.className = primary ? "story-button story-button-primary" : "story-button";
  button.type = "button";
  button.textContent = label;
  button.addEventListener("click", onClick);
  return button;
}

function createLogEntry(entry) {
  const logEntry = document.createElement("article");
  const speakerKind = entry.speaker === "Marvin" ? "marvin" : "player";
  logEntry.className = `story-log-entry story-log-${entry.kind} story-log-speaker-${speakerKind}`;
  logEntry.append(createLogIcon(entry));

  const speaker = document.createElement("span");
  speaker.className = "story-log-speaker";
  speaker.textContent = entry.speaker;
  logEntry.append(speaker);

  const text = document.createElement("p");
  text.className = "story-log-text";
  text.textContent = entry.text;
  logEntry.append(text);
  return logEntry;
}

function createLogIcon(entry) {
  const iconType = entry.kind === "choice"
    ? "choice"
    : entry.kind === "interaction"
      ? "interaction"
      : entry.speaker === "Marvin" ? "marvin" : "player";
  const icon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  icon.setAttribute("class", `story-log-icon story-log-icon-${iconType}`);
  icon.setAttribute("viewBox", "0 0 24 24");
  icon.setAttribute("aria-hidden", "true");

  const shapes = {
    marvin: [
      ["rect", { x: 4, y: 8, width: 16, height: 12, rx: 3 }],
      ["line", { x1: 12, y1: 3, x2: 12, y2: 8 }],
      ["circle", { cx: 12, cy: 3, r: 1 }],
      ["path", { d: "M8 13h.01M16 13h.01M9 17h6" }]
    ],
    player: [
      ["rect", { x: 5, y: 7, width: 14, height: 12, rx: 3 }],
      ["line", { x1: 12, y1: 3, x2: 12, y2: 7 }],
      ["circle", { cx: 12, cy: 3, r: 1 }],
      ["path", { d: "M9 12h.01M15 12h.01M9 16h6M5 12H3m16 0h2" }]
    ],
    choice: [
      ["path", { d: "M6 4v16M6 12h12m-5-5 5 5-5 5" }]
    ],
    interaction: [
      ["circle", { cx: 10.5, cy: 10.5, r: 6.5 }],
      ["path", { d: "m15.5 15.5 5 5" }]
    ]
  };

  for (const [tag, attributes] of shapes[iconType]) {
    const shape = document.createElementNS("http://www.w3.org/2000/svg", tag);
    for (const [name, value] of Object.entries(attributes)) {
      shape.setAttribute(name, String(value));
    }
    icon.append(shape);
  }
  return icon;
}

window.StoryView = StoryView;
})();
