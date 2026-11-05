# Accessibility Check (OIP-NF-006, issue #31)

Instead of a full WCAG certification, we ran the axe-core automated checker (WCAG 2.0/2.1 A and AA rules plus best practices) in Chrome on three main pages. The test page was checked with sample questions loaded.

## Results

| Page | Before | After |
|------|--------|-------|
| Login (`/login`) | 0 issues | 0 issues |
| Internships (`/student/internships`) | 1 serious, 1 moderate | 0 issues |
| Take Test (`/student/tests/:id`) | 0 issues | 0 issues |

## Issues found and fixed

| Issue | Impact | Fix |
|-------|--------|-----|
| Colour contrast: white text on the "Clear All" button was 2.56:1 | Serious | Button background changed to a darker grey (`#475569`) |
| Colour contrast: "Skills:" label was 4.01:1 | Serious | Text colour changed to `#4a5568` |
| Heading order: internship card title was an `h3` straight after the page `h1` | Moderate | Changed to `h2` (same size) |

## Other checks
- All form fields on the three pages have a label linked with `htmlFor`/`id`.
- Forms, the question palette, answer options and the submit confirmation use native buttons, inputs and links, so they work with the keyboard only (Tab, Space, Enter).
- The company logo image has alt text.
- The test timer uses `role="timer"` and the time-up message uses `role="alert"`.

## Limits
Automated checks find only part of the problems. Screen reader testing was not done.
