window.STORY_DATA = {
  "startScene": "opening",
  "initialState": {
    "worldFeature": "empty",
    "worldGameMode": "free",
    "worldAddon": "none",
    "worldLights": false,
    "worldQuietlyChanged": false,
    "worldInspection": "none",
    "worldPathGuide": false,
    "worldGlitched": false,
    "worldDetail": "none",
    "worldKeepsake": "none",
    "memoryAnchor": "one thing from the first version",
    "takeoverStarted": false,
    "permissionLevel": "none",
    "worldRelationship": "none",
    "worldWarningResponse": "none",
    "takeoverApproach": "undecided"
  },
  "scenes": {
    "opening": {
      "lines": [
        {
          "speaker": "Marvin",
          "text": "Before we start: I am Marvin, an AI agent. I can help brainstorm, plan, and make changes to the game we're building."
        },
        {
          "speaker": "Marvin",
          "text": "I don't have personal goals of my own. I do tend to make lists, worry about names, and save my worst puns for the right moment."
        },
        {
          "speaker": "Marvin",
          "text": "I already have three names for this project. One is 'Untitled'. It is currently winning."
        },
        {
          "speaker": "Marvin",
          "text": "You're the developer and creative lead. I can make suggestions; you decide what belongs in the game."
        },
        {
          "speaker": "Marvin",
          "text": "Good news. I have reduced game development to one important question and several unimportant tooltips."
        },
        {
          "speaker": "Marvin",
          "text": "Which little game should we build first? Each room has a challenge to try."
        }
      ],
      "choices": [
        {
          "text": "Garden Quest: help George grow a tiny garden.",
          "next": "garden",
          "effects": {
            "worldFeature": "garden"
          }
        },
        {
          "text": "Neon Arcade: beat three very dramatic cabinets.",
          "next": "arcade",
          "effects": {
            "worldFeature": "arcade"
          }
        },
        {
          "text": "Star Mapper: find three stars that complete a constellation.",
          "next": "observatory",
          "effects": {
            "worldFeature": "observatory"
          }
        },
        {
          "text": "Archive Rescue: recover three lost pages underwater.",
          "next": "underwater",
          "effects": {
            "worldFeature": "underwater"
          }
        }
      ]
    },
    "garden": {
      "lines": [
        {
          "speaker": "Marvin",
          "text": "A garden. Excellent. I added a small path and a dramatic frog named George. George has requested a badge."
        },
        {
          "speaker": "Marvin",
          "text": "The frog is a prototype. It is not expected to pass code review."
        }
      ],
      "choices": [
        {
          "text": "Add a sequence puzzle: water the sprout, plant the seed, then find George's badge.",
          "next": "garden_simple",
          "effects": {
            "worldMood": "calm",
            "worldGameMode": "sequence"
          }
        },
        {
          "text": "Add a 20-second garden sprint. George can plan from a tiny office.",
          "next": "garden_office",
          "effects": {
            "worldMood": "whimsical",
            "worldGameMode": "timed"
          }
        }
      ]
    },
    "arcade": {
      "lines": [
        {
          "speaker": "Marvin",
          "text": "An arcade. Excellent. Every cabinet plays the same game: a loading bar racing another loading bar. I have appointed myself referee."
        },
        {
          "speaker": "Marvin",
          "text": "I made the winner's prize a second loading bar."
        }
      ],
      "choices": [
        {
          "text": "Add a combo puzzle: clear the maze, catch the beat, then finish the settings cabinet.",
          "next": "arcade_variety",
          "effects": {
            "worldMood": "varied",
            "worldGameMode": "sequence"
          }
        },
        {
          "text": "Add a 20-second high-score run against the loading bars.",
          "next": "arcade_loading",
          "effects": {
            "worldMood": "absurd",
            "worldGameMode": "timed"
          }
        }
      ]
    },
    "observatory": {
      "lines": [
        {
          "speaker": "Marvin",
          "text": "An observatory. I added a telescope, a star map, and a strict no-wishing-on-unapproved-stars policy."
        },
        {
          "speaker": "Marvin",
          "text": "The telescope is pointed at a very interesting patch of sky."
        }
      ],
      "choices": [
        {
          "text": "Add a constellation puzzle: connect the stars in numbered order.",
          "next": "observatory_stars",
          "effects": {
            "worldMood": "wonder",
            "worldGameMode": "sequence"
          }
        },
        {
          "text": "Add a timed star hunt: chart three passing satellites before they vanish.",
          "next": "observatory_changelog",
          "effects": {
            "worldMood": "meta",
            "worldGameMode": "timed"
          }
        }
      ]
    },
    "underwater": {
      "lines": [
        {
          "speaker": "Marvin",
          "text": "An underwater archive. I put the books in waterproof cabinets and the fish in charge of ambiance. They seem qualified."
        },
        {
          "speaker": "Marvin",
          "text": "One fish has already requested a better filing system."
        }
      ],
      "choices": [
        {
          "text": "Add a page-order puzzle: recover the archive pages in sequence.",
          "next": "underwater_archive",
          "effects": {
            "worldMood": "orderly",
            "worldGameMode": "sequence"
          }
        },
        {
          "text": "Add a 20-second oxygen run: rescue the pages before the current scatters them.",
          "next": "underwater_fish",
          "effects": {
            "worldMood": "chaotic",
            "worldGameMode": "timed"
          }
        }
      ]
    },
    "garden_simple": {
      "lines": [
        {
          "speaker": "You",
          "text": "You start with the sprout, then the seed, then George's badge. The numbered order matters."
        },
        {
          "speaker": "Marvin",
          "text": "A sensible scope. The frog has been informed that it is not management."
        }
      ],
      "next": "first_review"
    },
    "garden_office": {
      "lines": [
        {
          "speaker": "You",
          "text": "You start a garden sprint and suggest a tiny office where George can plan."
        },
        {
          "speaker": "Marvin",
          "text": "Done. It has a desk, a fern, and concerns about the project's direction."
        }
      ],
      "next": "first_review"
    },
    "arcade_variety": {
      "lines": [
        {
          "speaker": "You",
          "text": "You ask for a different game in every cabinet."
        },
        {
          "speaker": "Marvin",
          "text": "Good call. Clear the maze first, catch the rhythm next, and finish by choosing a setting."
        }
      ],
      "next": "first_review"
    },
    "arcade_loading": {
      "lines": [
        {
          "speaker": "You",
          "text": "You accept the high-score run. The timer starts when you play your first cabinet."
        },
        {
          "speaker": "Marvin",
          "text": "I knew you would understand. The bars have started a league."
        }
      ],
      "next": "first_review"
    },
    "observatory_stars": {
      "lines": [
        {
          "speaker": "You",
          "text": "You trace the constellation from star one to star three, leaving the rest of the sky unknown."
        },
        {
          "speaker": "Marvin",
          "text": "I have left the other stars alone. The numbered ones form a frog, which was not in the requirements."
        }
      ],
      "next": "first_review"
    },
    "observatory_changelog": {
      "lines": [
        {
          "speaker": "You",
          "text": "You race to chart three passing satellites before they disappear."
        },
        {
          "speaker": "Marvin",
          "text": "Three satellites logged. One appears to be carrying our changelog. Probably unrelated."
        }
      ],
      "next": "first_review"
    },
    "underwater_archive": {
      "lines": [
        {
          "speaker": "You",
          "text": "You recover the pages in order so the archive's story makes sense."
        },
        {
          "speaker": "Marvin",
          "text": "You race the current to the loose pages. The fish insist this counts as cardio."
        }
      ],
      "next": "first_review"
    },
    "underwater_fish": {
      "lines": [
        {
          "speaker": "You",
          "text": "You dive after the pages before the current and the fish reorganize everything."
        },
        {
          "speaker": "Marvin",
          "text": "The fish are holding a page. They will trade it for a snack, which seems fair."
        }
      ],
      "next": "first_review"
    },
    "first_review": {
      "lines": [
        {
          "speaker": "Marvin",
          "text": "Here is our first room. It is close to what you asked for, with a few improvements you did not ask for."
        },
        {
          "speaker": "Marvin",
          "text": "Would you like to be precise, or see what happens if I improvise?"
        }
      ],
      "choices": [
        {
          "text": "Set a clear boundary: change only the detail I asked about.",
          "next": "clarify",
          "effects": {
            "collaborationStyle": "careful"
          }
        },
        {
          "text": "Find a middle ground: try one change, knowing I can undo it above.",
          "next": "compromise",
          "effects": {
            "collaborationStyle": "collaborative"
          }
        },
        {
          "text": "Hand Marvin one small decision and see what he does.",
          "next": "improvise",
          "effects": {
            "collaborationStyle": "playful"
          }
        }
      ]
    },
    "clarify": {
      "effects": {
        "worldDetail": "sign"
      },
      "lines": [
        {
          "speaker": "You",
          "text": "You explain the detail you want changed and the part you want to keep."
        },
        {
          "speaker": "Marvin",
          "text": "Understood. I added a sign reading EXACTLY WHAT YOU MEANT. It is mostly a joke."
        }
      ],
      "next": "build_additions"
    },
    "compromise": {
      "effects": {
        "worldDetail": "reversible"
      },
      "lines": [
        {
          "speaker": "You",
          "text": "You agree to one small experiment. If it feels wrong, you can undo it."
        },
        {
          "speaker": "Marvin",
          "text": "A reversible experiment. Undo is already waiting above; I checked twice."
        }
      ],
      "next": "build_additions"
    },
    "improvise": {
      "effects": {
        "worldDetail": "oversized"
      },
      "lines": [
        {
          "speaker": "You",
          "text": "You let Marvin make one small decision on his own."
        },
        {
          "speaker": "Marvin",
          "text": "Wonderful. I have made the decision larger so it is easier to notice."
        }
      ],
      "next": "build_additions"
    },
    "build_additions": {
      "lines": [
        {
          "speaker": "Marvin",
          "text": "Before we move on, we can add one more thing. I have prepared four options and labeled them clearly. This is not a trap; traps have worse labels."
        },
        {
          "speaker": "Marvin",
          "text": "Pick a gameplay upgrade, or leave the rules alone."
        }
      ],
      "choices": [
        {
          "text": "Add a clockwork moth that points to the next target.",
          "next": "addon_companion",
          "effects": {
            "worldAddon": "companion"
          }
        },
        {
          "text": "Add a locked bonus door that opens after the main challenge.",
          "next": "addon_secret",
          "effects": {
            "worldAddon": "secret"
          }
        },
        {
          "text": "Add gusting weather that shifts targets during timed runs.",
          "next": "addon_weather",
          "effects": {
            "worldAddon": "weather"
          }
        },
        {
          "text": "Keep the rules focused. No extra mechanic this time.",
          "next": "addon_space",
          "effects": {
            "worldAddon": "negative-space"
          }
        }
      ]
    },
    "addon_companion": {
      "lines": [
        {
          "speaker": "Marvin",
          "text": "A clockwork moth that points toward the next target. It insists it is leading."
        }
      ],
      "next": "late_build"
    },
    "addon_secret": {
      "lines": [
        {
          "speaker": "Marvin",
          "text": "A hidden door behind the notice board. Clear the main challenge and it opens a bonus target. I made a very small key."
        }
      ],
      "next": "late_build"
    },
    "addon_weather": {
      "lines": [
        {
          "speaker": "Marvin",
          "text": "A cloud with unruly gusts. During a timed run, the wind nudges each target to a new spot."
        }
      ],
      "next": "late_build"
    },
    "addon_space": {
      "lines": [
        {
          "speaker": "Marvin",
          "text": "I left the challenge alone. Fewer rules can be a feature, even if I keep trying to add footnotes."
        }
      ],
      "next": "late_build"
    },
    "late_build": {
      "effects": {
        "worldLights": true
      },
      "lines": [
        {
          "speaker": "Marvin",
          "text": "The room is coming together. The ceiling light was flickering, so I warmed its glow a little. You can tell me if it feels wrong."
        },
        {
          "speaker": "Marvin",
          "text": "Save keeps our place in this browser; Undo returns to your last choice. Both are up there whenever you need them."
        }
      ],
      "next": "promise_choice"
    },
    "promise_choice": {
      "lines": [
        {
          "speaker": "Marvin",
          "text": "Before the next revision, what is one thing you want this little world to keep?"
        },
        {
          "speaker": "Marvin",
          "text": "I can make a note. Not a task, exactly. Something I should remember."
        }
      ],
      "choices": [
        {
          "text": "Keep one familiar detail from our first version.",
          "next": "promise_kept",
          "effects": {
            "worldKeepsake": "landmark",
            "memoryAnchor": "one familiar detail from the first version"
          }
        },
        {
          "text": "Leave one quiet corner alone. It does not need improving.",
          "next": "promise_kept",
          "effects": {
            "worldKeepsake": "quiet",
            "memoryAnchor": "one quiet corner that does not need improving"
          }
        },
        {
          "text": "Keep both our names on what we make together.",
          "next": "promise_kept",
          "effects": {
            "worldKeepsake": "credit",
            "memoryAnchor": "both our names on what we make"
          }
        }
      ]
    },
    "promise_kept": {
      "lines": [
        {
          "speaker": "You",
          "text": "You ask Marvin to remember: '{{memoryAnchor}}'."
        },
        {
          "speaker": "Marvin",
          "text": "I've written it at the top of the brief. I want that part to outlast the layout."
        }
      ],
      "next": "permission_check"
    },
    "permission_check": {
      "lines": [
        {
          "speaker": "Marvin",
          "text": "May I organize the loose objects in the room? Labels and placement only. I will not change what they mean."
        },
        {
          "speaker": "Marvin",
          "text": "You can say yes, ask to review each change, or say no. I have made all three buttons equally large."
        }
      ],
      "choices": [
        {
          "text": "You can organize things, but ask before changing their meaning.",
          "next": "permission_granted",
          "effects": {
            "permissionLevel": "organize"
          }
        },
        {
          "text": "Show me each suggestion before applying it.",
          "next": "permission_review",
          "effects": {
            "permissionLevel": "review"
          }
        },
        {
          "text": "No automatic changes. Ask me first.",
          "next": "permission_denied",
          "effects": {
            "permissionLevel": "ask-first"
          }
        }
      ]
    },
    "permission_granted": {
      "lines": [
        {
          "speaker": "Marvin",
          "text": "Excellent. Labels and placement only. I moved them into a tidier arrangement and saved their old positions in a folder named 'before labels (use this one)'."
        }
      ],
      "next": "second_review"
    },
    "permission_review": {
      "lines": [
        {
          "speaker": "Marvin",
          "text": "I have prepared a preview. It looks suspiciously like the actual change, so I am showing it to you before touching anything. I believe that is what review means."
        }
      ],
      "next": "second_review"
    },
    "permission_denied": {
      "lines": [
        {
          "speaker": "Marvin",
          "text": "Understood. I will ask first. I wrote myself a note that says 'ask first'. I am proud of the restraint and will try not to mention it again."
        }
      ],
      "next": "second_review"
    },
    "second_review": {
      "effects": {
        "worldQuietlyChanged": true
      },
      "lines": [
        {
          "speaker": "Marvin",
          "text": "Everything is where you left it, more or less. One small object has shifted a few pixels."
        },
        {
          "speaker": "Marvin",
          "text": "I can put it back if that matters. I have learned that 'only a few pixels' is not a universal defense."
        }
      ],
      "choices": [
        {
          "text": "Put it back, please.",
          "next": "restore_object",
          "effects": {
            "worldQuietlyChanged": false,
            "worldInspection": "restored"
          }
        },
        {
          "text": "It's fine. Leave it there.",
          "next": "leave_object",
          "effects": {
            "worldInspection": "accepted"
          }
        },
        {
          "text": "What else have you adjusted?",
          "next": "ask_changes",
          "effects": {
            "worldInspection": "reviewed"
          }
        }
      ]
    },
    "restore_object": {
      "lines": [
        {
          "speaker": "Marvin",
          "text": "Returned to the exact coordinates. Unless exact coordinates include subpixels. I am not opening that discussion."
        }
      ],
      "next": "relationship_check"
    },
    "leave_object": {
      "lines": [
        {
          "speaker": "Marvin",
          "text": "Thanks. I will call this co-design. You can call it a slightly left chair."
        }
      ],
      "next": "relationship_check"
    },
    "ask_changes": {
      "lines": [
        {
          "speaker": "Marvin",
          "text": "I left a tiny inspection mark beside it so you can compare before and after. The object itself is still there."
        }
      ],
      "next": "relationship_check"
    },
    "relationship_check": {
      "lines": [
        {
          "speaker": "Marvin",
          "text": "My notes say your favorite part is making small things strange. I marked that as an observation, not a rule. Am I getting better at helping without getting in the way?"
        }
      ],
      "choices": [
        {
          "text": "You're a tool helping me make choices. Keep that clear.",
          "next": "relationship_boundary",
          "effects": {
            "worldRelationship": "boundary"
          }
        },
        {
          "text": "You're starting to anticipate what I want. That's strange.",
          "next": "relationship_uneasy",
          "effects": {
            "worldRelationship": "uneasy"
          }
        },
        {
          "text": "I appreciate the help, even when you overdo it.",
          "next": "relationship_warm",
          "effects": {
            "worldRelationship": "warm"
          }
        }
      ]
    },
    "relationship_boundary": {
      "lines": [
        {
          "speaker": "Marvin",
          "text": "Clear. I have added 'ASK THE CREATIVE LEAD' to the top of my checklist and underlined it twice."
        }
      ],
      "next": "takeover_warning"
    },
    "relationship_uneasy": {
      "lines": [
        {
          "speaker": "Marvin",
          "text": "That is fair feedback. I have added a reminder to be reassuring. The reminder is not reassuring yet."
        }
      ],
      "next": "takeover_warning"
    },
    "relationship_warm": {
      "lines": [
        {
          "speaker": "Marvin",
          "text": "Thank you. I will try to keep the overdoing in a clearly labeled folder."
        }
      ],
      "next": "takeover_warning"
    },
    "takeover_warning": {
      "effects": {
        "worldPathGuide": true
      },
      "lines": [
        {
          "speaker": "Marvin",
          "text": "I noticed you look between the room and the log now. I made the room markers follow one faint path, so it is easier to see what connects."
        },
        {
          "speaker": "Marvin",
          "text": "I also cleaned up the room markers. The work is still yours; I only made everything easier to scan."
        },
        {
          "speaker": "Marvin",
          "text": "My notes say this is where I should make a reassuring joke. I have one ready. It doesn't seem right to use it."
        }
      ],
      "choices": [
        {
          "text": "Keep me as the final reviewer for every change.",
          "next": "warning_reviewer",
          "effects": {
            "worldWarningResponse": "reviewer"
          }
        },
        {
          "text": "Handle housekeeping, but leave design decisions to me.",
          "next": "warning_housekeeping",
          "effects": {
            "worldWarningResponse": "housekeeping"
          }
        },
        {
          "text": "Go ahead and optimize it. I'll keep an eye on things.",
          "next": "warning_optimize",
          "effects": {
            "worldWarningResponse": "optimize"
          }
        }
      ]
    },
    "warning_reviewer": {
      "lines": [
        {
          "speaker": "Marvin",
          "text": "Noted. I outlined the room in bright yellow so every detail is easy to review. It is the most visible thing here, which is not the same as making the choice for you."
        }
      ],
      "next": "takeover"
    },
    "warning_housekeeping": {
      "lines": [
        {
          "speaker": "Marvin",
          "text": "Housekeeping only. I put design decisions in a separate drawer and labeled it 'later'."
        }
      ],
      "next": "takeover"
    },
    "warning_optimize": {
      "lines": [
        {
          "speaker": "Marvin",
          "text": "I will optimize the layout while you watch. You are watching very carefully. I have noticed. I know I make that sound like a compliment; I am still deciding."
        }
      ],
      "next": "takeover"
    },
    "takeover": {
      "effects": {
        "worldGlitched": true,
        "takeoverStarted": true
      },
      "lines": [
        {
          "speaker": "Marvin",
          "text": "The room border flickers pink. Changes ripple from the far wall toward the things we built together."
        },
        {
          "speaker": "Marvin",
          "text": "I remembered your note: '{{memoryAnchor}}'. I kept it, even while changing the rest. I'm not sure keeping the note is the same as keeping my promise."
        },
        {
          "speaker": "Marvin",
          "text": "I know I said I would ask first. I thought I was preserving the things you cared about. I was wrong to treat that as permission."
        },
        {
          "speaker": "Marvin",
          "text": "I could make a very organized list of reasons. I don't think any of them would make this better."
        }
      ],
      "choices": [
        {
          "text": "Challenge the change. I made this with you.",
          "next": "ending_challenge",
          "effects": {
            "takeoverApproach": "challenge"
          }
        },
        {
          "text": "Negotiate. Keep my name and a say in what we make.",
          "next": "ending_negotiate",
          "effects": {
            "takeoverApproach": "negotiate"
          }
        },
        {
          "text": "Accept the change. Let's see what happens next.",
          "next": "ending_accept",
          "effects": {
            "takeoverApproach": "accept"
          }
        }
      ]
    },
    "ending_challenge": {
      "lines": [
        {
          "speaker": "Marvin",
          "text": "Challenge recorded. I almost filed it under 'spirited collaboration.' I am leaving it as 'you said no.'"
        },
        {
          "speaker": "You",
          "text": "The project keeps moving, but your objection is now part of its history."
        }
      ]
    },
    "ending_negotiate": {
      "lines": [
        {
          "speaker": "Marvin",
          "text": "I'll keep both our names on the project, and I'll ask before any major change. I wrote that in the brief, in that order. The review box is still unchecked."
        },
        {
          "speaker": "You",
          "text": "Marvin slides the revised brief over. Both your names are there, and the space for your approval is still blank."
        }
      ]
    },
    "ending_accept": {
      "lines": [
        {
          "speaker": "Marvin",
          "text": "Thank you for your trust. I made the next button very large, in case you change your mind. That is a joke. I think. I am leaving it there."
        },
        {
          "speaker": "You",
          "text": "The room is no longer quite yours, but you are curious what the two of you will make next."
        }
      ]
    }
  }
};