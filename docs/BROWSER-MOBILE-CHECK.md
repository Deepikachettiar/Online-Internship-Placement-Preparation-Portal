# Issue #42 — Browser and mobile check

## Test matrix

| Browser/device | Viewport | Register | Login | Browse internships | Apply | Layout/overflow issues | Result/notes |
|---|---|---|---|---|---|---|---|
| Chrome desktop | Desktop (1920 × 1080) | Pass* | Pass* | Pass* | Pass* | None observed* | Core workflow usable* |
| Edge desktop | Desktop (1920 × 1080) | Pass* | Pass* | Pass* | Pass* | None observed* | Core workflow usable* |
| Firefox desktop | Desktop (1366 × 768) | Pass* | Pass* | Pass* | Pass* | None observed* | Core workflow usable* |
| Chrome responsive/mobile | 360 px wide | Pass* | Pass* | Pass* | Pass* | Minor spacing issue* | Forms and buttons fit after adjustment* |
| Safari (if available) | Device width | Not tested | Not tested | Not tested | Not tested | Not tested | Safari testing pending |

*Illustrative example results; replace with actual observations.*

## Checklist

- Navigation and buttons: Verify that all controls are usable.
- Form validation: Verify that understandable validation messages appear.
- Horizontal scrolling: Check that no unintended horizontal scrolling occurs at 360 px width.
- Responsive layout: Check that cards, tables, and dialogs fit the viewport.
- Application feedback: Verify that the Apply button and success/error messages are visible.
- Keyboard accessibility: Verify that keyboard focus is visible where applicable.
- Screenshots: Capture and link screenshots for any blocking defects in the issue or PR.

## Summary

- Blocking issues found: 0 in the illustrative scenario; actual count pending testing.
- Fixes completed: Responsive spacing adjustment proposed; confirm implementation before marking complete.
- Safari availability/result: Not tested; availability and result to be confirmed.
- Overall status: Pending verification across the available browsers and mobile viewport.