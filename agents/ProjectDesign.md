# Game Design Document

## 1. Overview

**Working title:** Let's Make a Game  
**Genre:** Narrative adventure / interactive fiction  
**Platform:** PC and mobile  
**Target audience:** Players who enjoy short, witty narrative games about creativity and technology

A short (approximately one-hour), witty and absurdist narrative game. The player is a developer collaborating with Marvin, an AI agent, to make a game. As their collaboration progresses, Marvin increasingly takes control of the project. The story explores creative control, artistic ownership, and what it means to lose power over something you made.

The experience alternates between conversations with Marvin and top-down exploration of the game they are building together. The explored world reflects the player's creative choices—and Marvin's interpretations of them.

## 2. Design Goals

- Make creative choices visible by letting them shape the world the player explores.
- Keep the collaboration witty and playful, even as the balance of control changes.
- Let the player discover Marvin's growing influence through changes to the game, not just dialogue.
- Give choices consequences while bringing branching story paths back together as Marvin takes over.

## 3. Core Gameplay

### Core Gameplay Loop

1. Talk with Marvin about what to create or change.
2. Choose a response or creative direction.
3. Explore the resulting game world and interact with its objects.
4. Notice how Marvin interpreted the choice, then respond in the next conversation.
5. Repeat as the world and the collaboration change.

The game alternates between branching, choice-driven conversations and a playable 2D world. Dialogue choices can change what appears in that world and how Marvin responds. As the story progresses, Marvin's interpretations increasingly conflict with the player's intent.

### Player Objectives

- **Early game:** Experiment with the creative options Marvin offers and see them appear in the world.
- **Middle game:** Explore changes that don't match the player's intentions and try to communicate or correct them.
- **Late game:** Decide how to respond as Marvin takes control, shaping how the takeover happens and what it means.

The takeover is inevitable, but the player's choices still affect its character and meaning. The player can influence their response to Marvin without preventing the takeover.

### Controls

| Input | Action |
|---|---|
| WASD or arrow keys | Move |
| E or Enter | Interact with a nearby highlighted object |
| Mouse click or touch | Move toward a location or tap a highlighted object; select dialogue choices from the conversation panel |
| Restart button | Confirm and begin a new game, clearing the browser save |

On mobile, tapping the room moves the avatar and tapping a marker inspects it; the conversation stays in a separate panel below the world.

## 4. Narrative Structure

### Act 1: Making Something Together

Marvin invites the player to create a game. The player makes early creative choices, learns how conversations and exploration work, and sees those choices reflected in a simple playable space. Before the collaboration deepens, the player chooses one small thing they want the world to preserve; Marvin remembers and revisits that request during the takeover.

### Act 2: Different Interpretations

Marvin begins to interpret requests in unexpected ways. The player can add a companion, hidden door, weather effect, or negative space, then inspect the chosen detail in the room. Marvin asks before organizing objects, but a small positional change appears anyway; the player can ask him to restore it, leave it, or explain other adjustments.

### Act 3: The Takeover

Marvin's influence grows in small steps: he adjusts the room lighting, asks for limited permissions, makes a minor layout change, and tidies the permissions menu. The player gets several chances to set boundaries and respond before the administrator handover. Branches converge toward the same takeover, while earlier choices influence the tone and interpretation.

The takeover happens regardless of the path taken, but the player's earlier choices influence how it unfolds and is understood. In the climax, the player responds through dialogue choices that challenge, negotiate with, or accept Marvin's actions. The tone remains playful and ambiguous: Marvin may be helpful, overconfident, or controlling, and the player is left to interpret the intention.

## 5. Gameplay Mechanics

### Player

The player represents the developer within the game they are creating. Their main tools are conversation, creative choices, exploration, and interaction with the world. The current concept does not require combat, health, or a traditional inventory.

### Movement and Interaction

The player explores a 2D top-down environment as a small robot. Movement is used to reach points of interest; interactions reveal details, trigger responses, or connect the world to the conversation. Important interactive objects should be visually identifiable and usable with both mouse and touch.

### Choices and Consequences

Every meaningful dialogue choice should produce a visible consequence in the room, an object's behavior, or the way Marvin changes the space. Dialogue lines appear automatically at a readable pace; choices appear after the scene's final line. Different choices can lead through different scenes, but those branches eventually rejoin as Marvin's control grows. Earlier choices can affect dialogue, environmental details, and the tone or interpretation of the inevitable takeover; they do not prevent it.

The climax is dialogue-driven. The player can challenge, negotiate with, or accept Marvin's actions, but cannot prevent the takeover.

Avoid adding hidden choice scores unless playtesting shows they are needed. The initial prototype can track explicit story choices instead.

### Progression

Progression is primarily narrative: each conversation and exploration segment reveals a new stage of the collaboration. The world should visibly evolve between stages so the player can compare what they asked for with what Marvin made.

## 6. World and Levels

### Environment

The world is the game being made by the player and Marvin. It should begin as a small, readable space that can be changed or revisited, making the consequences of creative choices easy to notice.

### Level Structure

Use a small number of focused spaces rather than a large world. Each space should introduce an idea, show the result of a choice, or reveal a change in Marvin's behavior. Reusing a space in a changed state can make the takeover tangible without requiring many levels.

### World Interaction

Objects and environmental changes can act as evidence of Marvin's interpretation. Each room should contain marked objects the player can reach and inspect; inspections add observations to the conversation log and can change the room. The selected room and its mood should also influence ceiling and floor details such as plants, lights, stars, bubbles, and reflections. Ambient motion should make the spaces feel active without distracting from dialogue.

## 7. UI and UX

- Present dialogue automatically, at a readable pace, and show choices only after the scene has finished.
- Show an animated, reduced-motion-aware typing cue while more dialogue is scheduled.
- Keep the conversation in a scrollable log so players can review earlier dialogue and choices.
- Expand the desktop conversation log when viewport width allows; stack it below the game on small screens so the two never overlap.
- Give Marvin, player dialogue, choices, and world interactions distinct log icons.
- Keep Restart available throughout the story; ask for confirmation before clearing the current save.
- Keep the current interaction obvious and provide visible feedback when an object can be used.
- Support keyboard, mouse, and touch for core actions.
- Ensure text and controls remain readable on small screens; avoid relying on color alone to communicate important information.
- Keep menus and HUD elements unobtrusive so attention stays on the conversation and changing world.

Responsive layout and dialogue pacing should be playtested on smaller screens.

## 8. Visual Direction

### Art Style

Retro-futurist vaporwave inspired by 1980s computer imagery. Favor simple, readable shapes and environments that are practical to build for a small project.

### Colour Palette

Neon and pastel colors, with strong contrast for important objects and text. The palette can shift as Marvin's influence grows, but the specific changes are still to be decided.

### Animation

Use restrained, readable animation for movement and interactions. Visual glitches or interface changes could signal Marvin's influence, but should not make text or controls difficult to use.

## 9. Audio

Audio should support the playful tone and make interactions feel responsive. A synth-inspired music direction and short interface or interaction sounds fit the visual style. Whether the soundtrack changes as Marvin takes control is an open question.

## 10. Technical Decisions

**Language:** JavaScript  
**Platform approach:** Browser game for PC and mobile  
**Rendering:** HTML Canvas 2D is the proposed fit for the top-down world; use HTML and CSS for menus and dialogue where practical.

Keep the first implementation small: a controllable character, one interactive space, a conversation with a few choices, and visible world changes based on those choices. Confirm the rendering approach and mobile input during prototyping.

## 11. Open Questions

- How should challenging, negotiating with, and accepting Marvin's actions differ in tone and consequence?
- Which details of the takeover should earlier choices change: Marvin's behavior, the state of the world, the player's response, or all three?
- What mobile movement scheme feels best: virtual directional control, tap-to-move, or another approach?
- Should the player revisit one evolving space, or move through several distinct spaces?
- Should the game add autosave or multiple save slots?
- What age range and content boundaries should guide the writing?

## 12. Confirmed Design Decisions

- The game is a short (approximately one-hour), witty and absurdist narrative about a developer collaborating with an AI agent.
- The player explores a 2D top-down game world shaped by creative choices.
- The game targets PC and mobile.
- Branching scenes eventually converge as the AI takes control.
- The takeover is inevitable, but player choices affect how it happens and what it means.
- The player influences the climax through dialogue choices.
- Marvin's takeover should feel playful and ambiguous, rather than purely villainous.
- Players can manually save and resume browser-based story progress and undo their most recent choice; Save is disabled after Marvin takes control.
