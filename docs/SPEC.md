# philiplaney.com UX improvement — 2026-09-16

Outcome: make the authenticated homepage quick to scan and pleasant to use on phone and desktop; repair unreadable sign-in UI; preserve the public family arcade and private server-gated app catalogue.

Evidence: origin/main 15852e9; live public arcade inspected in Chrome. Sign-in modal has almost invisible text due to stale Clerk appearance variable names. Current signed-in page source is a 448px single column of ten cards under a 160–208px animated header. Live signed-in review awaits user login. Blended-Teaching/mockups inspected: no replica of this personal app exists; use actual production components for local visual verification.

Design: warm off-white app library, dark ink, modest gold arcade identity. Compact masthead, clear welcome/title and account controls; responsive grouped cards with distinct icons, useful descriptions, explicit destinations; search + category controls and recoverable empty state. Retain all ten destinations. Link to /arcade without signing out. Public entry retains games; add plainly named sign-in action. No new backend or data writes.

Constraints: preserve auth and redirect semantics, no app catalogue in public HTML/client imports, no edits to game engines, expense data or Fellowship/Dryht surfaces. No new integration/dependency. Respect reduced motion and keyboard focus. No permanent auth bypass/test route.

Acceptance: lint changed files, TypeScript, production build; render real library components in temporary isolated local preview, inspect desktop and 390px mobile; exercise search/filter/no results/clear, keyboard and arcade return. Live after deployment: sign-in contrast, guest privacy, exact deployment ready and signed-in flow if session available. Rollback: revert only this task's release commit and redeploy.
