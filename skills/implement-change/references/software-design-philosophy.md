# Software Design Philosophy — Implementation Reference

Principles from John Ousterhout's "A Philosophy of Software Design" to apply while writing code.

## While Coding

### Strategic, not tactical
Working code isn't enough. Don't introduce complexity to finish faster. The primary goal is a good design that also works. Invest ~10-20% of effort in design improvements — it pays back quickly.

### Make modules deep
When creating a new function, class, or component: the interface should be much simpler than the implementation. If the interface is as complex as what's inside, the module isn't pulling its weight. A function that wraps a single line adds complexity for no benefit.

### Hide information
Ask: what knowledge can be hidden inside this module? The more you hide, the deeper the module. Don't expose internal data structures through getters — provide purpose-specific methods instead. `getParameter(name)` is deeper than `getParams()` returning the internal map.

### Define errors out of existence
Before writing error handling, ask: can I redefine the operation so this error can't happen?
- Delete on non-existent item → no-op (it's already gone)
- Substring with out-of-range index → clamp to bounds
- Unset on non-existent variable → no-op (it's already unset)

This simplifies both the implementation and every caller.

### Design special cases out of existence
Design the normal case to handle special cases automatically. Instead of `if (selection exists) { handle selection } else { handle no selection }`, represent "no selection" as an empty selection — the same code path handles both.

### Pull complexity downward
If something is hard, handle it inside the module rather than pushing it to callers. Callers should "do the right thing" without configuration or setup. Provide sensible defaults. Avoid configuration parameters when the module can determine the right value itself.

### Each method should do one thing completely
A method should have a clean, simple interface and be deep. Long methods are fine if they have a simple interface and are easy to follow. Don't split a method just because it's long — split only if it creates cleaner abstractions. If you find yourself flipping between the parent and child to understand either, the split was wrong.

### Different layer, different abstraction
If you're writing a method that just passes arguments to another method with the same signature, that's a pass-through — a red flag. The two layers have the same abstraction. Either merge them, redistribute responsibilities, or expose the inner layer directly.

### Bring together what's related
Combine code that shares information, is used together, or overlaps conceptually. Splitting related code creates information leakage and forces readers to jump between files.

### Separate general-purpose from special-purpose
Put general mechanisms in lower layers. Keep feature-specific logic in higher layers. Don't pollute a utility with business logic. Don't pollute a feature with infrastructure.

## Red Flags While Coding

- **Shallow module**: You wrote a wrapper that adds no abstraction — the caller still needs to know everything
- **Information leakage**: Two modules/files both know about the same format, protocol, or data structure
- **Pass-through method**: A method that does nothing but call another method with the same or similar signature
- **Temporal decomposition**: You structured code around "first we do X, then Y" instead of around knowledge boundaries
- **Conjoined methods**: You can't understand method A without reading method B — they should probably be one method
- **Repetition**: Same pattern appears 3+ times — you haven't found the right abstraction yet
- **Special-general mixture**: A general utility contains code handling one specific use case
- **Vague name**: The variable/function name doesn't convey what it does precisely — `time` vs `timeMs`, `data` vs `userProfile`

## Code Obviousness

Design code to be read, not written. Every piece of code should be obvious to a reader encountering it for the first time:
- Use precise, descriptive names (encode units: `timeoutMs`, `sizeBytes`)
- Be consistent — same name for same concept everywhere
- Use whitespace to separate logical sections within methods
- Comments should describe things not obvious from the code — the *why*, not the *what*
