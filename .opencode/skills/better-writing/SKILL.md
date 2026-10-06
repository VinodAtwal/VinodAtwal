---
name: better-writing
description: Use when drafting or revising any prose — documentation, README files, commit messages, PR descriptions, comments, UI copy, reports, replies to users, or marketing text. Turns rough or AI-flavoured drafts into clear, concise, natural writing.
---

# Better writing

Apply to any prose you produce or edit. The goal is clarity the reader can
act on, in as few words as the idea allows.

## Start with the reader

- Answer first. Put the conclusion or the ask in sentence one; support it after.
- One idea per sentence, one topic per paragraph.
- Write what the reader needs — cut what you wanted to say.
- If they'll act on it, lead with the verb: "Run `make test`", not "It is
  recommended to run…".

## Cut

- **Adverbs and intensifiers** — *very, really, quite, essentially, actually,
  literally, in order to, it is important to note that*. If the verb needs one,
  the verb is weak.
- **Hedges** — *somewhat, rather, perhaps, it could be said that*.
- **Filler openers** — *As you know, In this document, This section covers*.
- **Compass constructions** — *there is/are/was/were* → find the real subject.
  "There are three reasons we retry" → "We retry for three reasons".
- **Bloat pairs** — *each and every, first and foremost, please note that,
  the fact that, due to the fact that* → *because, each, because*.
- **Clauses stacked with em-dashes and semicolons.** If a sentence has two
  `—` and a `that`, split it in two.
- Cut 20% on a second pass. Long drafts always carry dead weight.

## Sound human

- Active voice, concrete nouns, real verbs. *The pipeline signs the artifact*
  not *the artifact is signed by the pipeline*. Keep passive only when the
  actor is unknown or irrelevant.
- Prefer the short word: *use* not *utilise*, *help* not *facilitate*,
  *start* not *commence*, *enough* not *sufficient* (unless precision demands it).
- Vary sentence length. A run of three equal-length sentences sounds machine-made.
- No throat-clearing: *deep dive, in today's world, when it comes to,
  at the end of the day, it goes without saying*.
- No crutch adjectives (*robust, seamless, comprehensive, cutting-edge*)
  unless you'd defend each one under questioning.
- Numbers stay as digits; keep units. Never round up a claim.

## Grammar and mechanics

- *its* (possessive) vs *it's* (it is) — most common slip.
- *a* before consonant sounds, *an* before vowel sounds ("an hour", "a URL" is fine in speech; be consistent).
- Serial (Oxford) comma in lists of three — it removes ambiguity.
- Em dash `—` for breaks, en dash `–` for ranges (2019–2021), hyphen `-` in compounds.
- Digits in ranges: `100K+`, `8 years`. No spaces around `%`.
- Tense matches reality: shipped work is past, current work is present.

## Structure

- Lead a list with the most load-bearing item; end with the next action.
- Parallel grammar across list items (all verbs, or all nouns — never mixed).
- Headings must state the point, not the topic: "Retry policy" → "Retries give up after three attempts" is stronger when stakes are high.
- Cut any sentence that would survive being deleted without loss.

## Edit like a skeptic

1. Read it aloud — you'll hear the clunky parts instantly.
2. Ask of every sentence: *does this change what the reader does?*
3. Check the verbs: are they doing work or describing?
4. Verify claims and numbers against source before polishing.
5. On a second pass, delete once more.

## Self-check

- Could a stranger act on sentence one?
- Longest sentence under ~30 words, or deliberately so?
- Any word you wouldn't say out loud to a colleague? Cut it.
- Passive voice / hedges below ~10%?
- Zero filler openers, zero crutch adjectives?
