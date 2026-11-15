import { loadStory, StoryPlayer } from "./story.js";
import { GameWorld } from "./world.js";

const canvas = document.querySelector("#game");
const main = document.querySelector("main");

if (!(canvas instanceof HTMLCanvasElement) || !main) {
  throw new Error("The game needs a main element and a canvas.");
}

const world = new GameWorld(canvas, main);

loadStory()
  .then((story) => {
    const storyPlayer = new StoryPlayer(world.storyRoot, story, (state) => world.update(state));
    world.setStoryPlayer(storyPlayer);
  })
  .catch((error) => {
    console.error("Unable to start the story:", error);
    const message = document.createElement("p");
    message.className = "story-error";
    message.textContent = `Unable to load the story: ${error.message}`;
    world.storyRoot.replaceChildren(message);
  });
