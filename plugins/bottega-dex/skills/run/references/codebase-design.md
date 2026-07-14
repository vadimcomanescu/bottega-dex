# Codebase design

Use the repository's vocabulary and established architecture first.

- Prefer deep modules that hide substantial behavior behind small interfaces.
- Treat signatures, invariants, ordering, error modes, configuration, and observable performance as part of an interface.
- Validate at system edges. Inside a module, trust the caller contract.
- Create a seam only where behavior actually varies. One implementation is not evidence that an abstraction is needed.
- Design important interfaces twice and keep the version that is simpler for callers.
- Test through the interface. Do not extract pure fragments merely to make tests easier while leaving composition untested.
- Keep compatibility bridges small, named, and paired with a removal condition.
- Avoid shotgun changes, duplicated sources of truth, speculative fallbacks, and behavior the specification did not request.
