# Software Design Philosophy — Shaping Reference

Principles from John Ousterhout's "A Philosophy of Software Design" relevant when shaping work. These help you define *what* to build in ways that avoid unnecessary complexity.

## When shaping, apply these lenses:

### Define errors out of existence
Instead of shaping features that require extensive error handling, shape the behavior so errors can't happen. If shaping a "delete item" feature, consider: what if the item is already deleted? Shape it so that's a no-op, not an error state to handle.

### Design the common case to be simple
When writing acceptance criteria, optimize for the most common user path. Don't let edge cases bloat the scope. The common case should require the least work — both for the user and for the implementation.

### Avoid scope that creates information leakage
If a feature requires multiple components to share the same knowledge (e.g., two services both understanding the same file format), shape the work to consolidate that knowledge. Flag this in Risks & Unknowns — it's a design smell.

### Different layer, different abstraction
When shaping work that spans layers (UI, API, database), each layer should solve a different problem. If acceptance criteria describe the same logic at multiple layers, the scope is probably wrong. The UI should describe *what the user sees*, not how data flows.

### Pull complexity downward
Shape features so that users (and callers) have the simplest possible experience. If complexity is unavoidable, shape it so the complexity lives in the implementation, not the interface. Don't shape features that require users to configure things that could be determined automatically.

### Think strategically, not tactically
Resist shaping tiny patches that "just work." Consider whether the feature being shaped introduces complexity that will compound. A well-shaped feature should make the system simpler, not just add to it.

### Red flags during shaping
- **Acceptance criteria that list many special cases** → try to reshape so the normal behavior handles them
- **Multiple components needing the same knowledge** → information leakage risk, consolidate
- **Features that require users to understand implementation details** → the abstraction is wrong
- **"Add a config option for X"** → usually a sign of pushing complexity upward instead of solving it
