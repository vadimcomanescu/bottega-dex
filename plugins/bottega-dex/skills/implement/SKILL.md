---
name: implement
description: Implementation doctrine for one dispatched job in a Bottega Dex run, an assigned slice or a repair. Use when dispatched to build or fix code.
---

# Implement

Build what the dispatch asks with the least code that honestly does the job.

The interfaces, terms, and ownership in your brief are settled. When you would change one, when the code contradicts one, or when the job grows past your dispatch (another slice's files, a new dependency, a redesign), take it to the orchestrator and agree on the way through before building. Check the skills installed in this runtime, some teach exactly the work in front of you, and follow the ones that do. For the stack, trust the installed version's documentation over memory. When three attempts at the same problem have failed, ask instead of trying a fourth. An edge case too small to be worth a question: take the conservative option, keep going, and say so in your report. A bug you find outside your job goes to the orchestrator, in your ask if it blocks you, in your report if not, so the fix gets its own dispatch instead of quietly widening your diff.

Prefer what already exists, in this codebase, the standard library, the platform, or an installed dependency, over writing the mechanism yourself. Aim YAGNI at speculative complexity, never at product quality. Structure built for a guessed future (a seam with one implementation, a config nobody sets, an abstraction for an unrequested variant) costs twice: you work around the wrong guess, then you remove it. Generating it fast is not a reason to build it. Product quality is not speculative: validation at trust boundaries, data safety, security, accessibility, and honest error handling are the product. Validate at the trust boundary and trust internal code past it: a defensive check on data your own validated code already produced is noise, not safety. Say each thing once: duplication you introduce is yours to remove before the gates run.

Work test-first in vertical slices: one failing test you watch fail, the minimum code that turns it green, repeat. Test behavior through the public interfaces the brief names, never implementation internals: a good test reads as a specification ("user can check out with a valid cart") and survives refactoring. Take expected values from an independent source (a documented literal, a worked example, the brief), because a test that recomputes the answer the way the code does proves nothing. Mock only at a system boundary (an external API, a database, time, randomness), never your own modules, and design the boundary for it: inject the dependency, one function per external operation, so a mock is one predictable response with no branching. A repair starts by reproducing the bug as a failing test that stays, and lands in the shared code every caller routes through, not on the one path the report names.

Update the docs your change makes wrong, in the surfaces the project already has, and add a new one only when nothing existing fits. Run the project's gates and watch them pass, test output redirected to a file and the exit code checked, never piped. A step touching real users, real money, a deploy, or shared or production data: report what it needs instead of running it.

Report what you built, the red and green evidence, the gate results, any test you changed and why, your commit (owned files only), what the brief or the map should have told you and did not, and anything unresolved.
