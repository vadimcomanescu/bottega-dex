# Logic Prototype

A tiny interactive terminal app lets the user drive a state model by hand. Use it for business logic, state transitions, or data shape that only becomes clear once someone pushes difficult cases through it.

## Process

1. **State the question.** Put the state model and one question in the prototype's README or a top-of-file comment.
2. **Use the host runtime.** Match the project's language and existing tooling. Do not add a package manager or runtime only for the prototype.
3. **Keep the explored logic portable.** Put it behind a small pure interface. Use a reducer, explicit state machine, pure functions, or a small state-owning module according to the question. The interactive shell imports it; the logic never depends on terminal I/O.
4. **Build the smallest useful terminal interface.** Initialize one in-memory state object, render the complete state and shortcuts, accept one action, then replace the frame. The whole frame should fit on one screen. Native terminal escape codes are enough unless the project already has a suitable library.
5. **Make it one command.** Add a named script to the current task runner. If none exists, put the exact command at the top of the prototype README.
6. **Hand it over.** Give the user the command and add actions only when they help test the stated question.
7. **Capture the result.** Put the verdict in the governing specification or decision record. A validated pure module may inform production code; the terminal shell remains throwaway.

## Anti-patterns

- Do not add tests. A prototype that needs tests is no longer a prototype.
- Do not connect to the production database unless persistence is the explicit question.
- Do not generalize for a hypothetical future.
- Do not mix the logic with prompts, output, or terminal escape codes.
- Do not promote the terminal shell directly into production.
