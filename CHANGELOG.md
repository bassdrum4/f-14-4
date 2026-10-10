# Changelog

The numbered entries below cover recent assigned build labels. Earlier
development arrived in large exports with stale 1.0.0 metadata. See
[the code history investigation](docs/VERSION-ARCHAEOLOGY.md) for the full
surviving timeline, the recovered intermediate build, and the remaining
history gaps. **1.2.2 is not a recovered original version for all that work.**

## 1.2.2 — 2026-10-09

The current release includes the changes below. The displayed version stayed
at 1.1.1 while these updates landed; this release corrects that drift.

- Visible arresting cables and deck-edge supports; more forgiving gear-down
  deck contact, landing rolls and recovery results, with impact-speed limits.
- Correct tactical-map headings for ships, aircraft and the runway.
- Bound navigation keys prevent page scrolling even during auto-repeat.
- Hardened multiplayer packet validation, sender identity and host authority.
- In-flight settings (O), a large tactical map (M), radio entry (Enter), and
  independent HUD ladder and gun-cross toggles.
- Water depth fixes, consistent two-carrier battle assignments, and ordnance
  stores that survive respawn and re-arm through landing.
- Both deployed HTML files now expose their package version as metadata; the
  standalone check rejects stale versions or differing deployment copies.

### How recent build labels were assigned

Git history contains no release tags. The following maps recent changes to
minor/patch updates using the labels assigned in October 9's published builds.
It does not account for the full development history before those labels.
**1.2.0 and 1.2.1 are reconstructed milestones, not claimed historical releases
or tags.** Merge/build commits are not separate updates.

| Version | Evidence | Reason |
| --- | --- | --- |
| 1.1.0 | [`a7b3718`](https://github.com/bassdrum4/f-14-4/commit/a7b3718f48096f11f6073e1497ae195cef8952fa) | Published Play-first UI, head-to-head combat, scenery and weapon/recovery changes. |
| 1.1.1 | [`58169f6`](https://github.com/bassdrum4/f-14-4/commit/58169f6c20d26f3130f252814294d54addfb0f32) | Published browser performance and network congestion update. |
| 1.2.0 (reconstructed) | [`d4af647`](https://github.com/bassdrum4/f-14-4/commit/d4af64778a04406e53be44eb36f3f350dc74723b) | New in-flight controls and HUD options warrant a minor update; water/stores fixes ship with them. |
| 1.2.1 (reconstructed) | [`8fd6b76`](https://github.com/bassdrum4/f-14-4/commit/8fd6b76) | Multiplayer validation and authority fixes warrant a patch. |
| 1.2.2 (current) | [`7323eca`](https://github.com/bassdrum4/f-14-4/commit/7323eca4b0d9bb4238c524d1c6ecd4448122af90), plus version correction | Landing, cable visibility, navigation and map corrections warrant the next patch. |

Older snapshots repeatedly carried the default 1.0.0 even as their features
changed. Comparing source and compiled copies establishes additional game
states, including an intermediate October 7 build recovered from `bored`,
but does not recover their original release numbers. The recent numbering
preserves published 1.1.0/1.1.1 labels; the earlier history remains incomplete.
