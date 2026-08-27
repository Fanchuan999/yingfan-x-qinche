# Reminder, Letter, and Room Controls Design

## Goal

Clarify the browser notification boundary, add an optional API-generated letter draft, and remove the manual night-state choice from Dark Point.

## Decisions

- A denied browser notification permission is described as a permission setting, never as the browser being closed.
- A granted reminder says that the site checks when it is opened or returns to the foreground. The static site does not promise closed-browser delivery.
- The future-letter panel uses the existing AI chat endpoint and existing saved system prompt. A user click generates roughly 300 Chinese characters into the editable letter body; the user still chooses whether to seal it.
- API generation does not create or persist a new future letter automatically.
- The manual `night` room-state control is removed. Stored `night` selections fall back to `auto`; time-based night ambience remains available through `auto`.

## User-facing Copy

- Future letters introduction: `写给未来的你，日期到了再打开。`
- Denied notification status: `提醒：通知权限未允许，请在浏览器的网站设置中允许通知后刷新。`
- Denied notification button: `到浏览器设置开启`
- Granted notification status: `提醒：会在网站打开或回到前台时检查`
