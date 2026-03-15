# Software Design Philosophy — Planning Reference

Principles from John Ousterhout's "A Philosophy of Software Design" to apply when designing technical implementation plans.

## Core Principles

### 1. Modules should be deep
The best modules provide powerful functionality behind simple interfaces. When planning, design interfaces (APIs, function signatures, component props) that hide complexity. A module's cost is its interface; its benefit is its functionality. Maximize the ratio.

**Planning check**: For each new module/component in your plan, ask — is the interface simpler than the implementation? If not, reconsider the decomposition.

### 2. Information hiding
Each module should encapsulate design decisions. Knowledge about how something works (data format, algorithm, storage mechanism) should live in one place. When it leaks into multiple modules, every change requires coordinated updates.

**Planning check**: If two modules in your plan both need to know about the same internal detail, they should probably be one module or share a deeper abstraction.

### 3. Different layer, different abstraction
Adjacent layers should provide different abstractions. If a method just passes arguments through to another method with the same signature (pass-through), the layer isn't earning its keep.

**Planning check**: Review your planned module/class hierarchy. If two adjacent layers have similar abstractions, merge them or redistribute responsibilities.

### 4. Pull complexity downward
When complexity is unavoidable, push it into lower-level modules so higher-level callers stay simple. It's better for the module developer to suffer than for every caller to suffer.

**Planning check**: If your plan has callers doing complex setup, error handling, or configuration, consider whether the module itself should handle that.

### 5. Define errors out of existence
Design APIs so error cases can't happen. Instead of throwing when deleting a non-existent item, make "delete" mean "ensure it doesn't exist." Instead of erroring on out-of-range, clamp to bounds.

**Planning check**: For each interface in your plan, list the exceptions/errors. Can any be eliminated by redefining what the operation means?

### 6. General-purpose modules are deeper
Make interfaces somewhat general-purpose even if the current use is specific. The functionality should reflect current needs, but the interface should support multiple uses without being tied to one.

**Planning check**: Is your interface easy to use for today's need without being coupled to it? Could another feature use the same module?

### 7. Design it twice
Before committing to a design in the plan, consider at least two radically different approaches. Compare their interfaces, not just implementations. The best design often combines elements from multiple alternatives.

**Planning check**: For each major design decision, have you considered an alternative? Even if the first idea seems obvious, a second design forces you to articulate why.

### 8. Separate general-purpose and special-purpose code
General-purpose mechanisms go in lower layers. Special-purpose logic (specific to this use case) goes in higher layers. Don't mix them.

**Planning check**: Does your plan put business logic in utility modules? Does it put framework/infrastructure code in feature modules? Separate them.

### 9. Better together or better apart?
Combine when: pieces share information, are used together, overlap conceptually, or are hard to understand independently. Separate when: pieces are truly independent and separation reduces complexity.

**Planning check**: For each proposed file/module split, ask — will developers need to read both to understand either?

## Red Flags to Watch For

- **Shallow module**: Interface is as complex as implementation — not hiding anything
- **Information leakage**: Same knowledge in multiple modules
- **Temporal decomposition**: Structure mirrors execution order instead of information hiding
- **Pass-through method**: Method just delegates to another with the same signature
- **Overexposure**: Common-case users forced to learn about rare-case features
- **Conjoined methods**: Can't understand one without understanding the other
- **Special-general mixture**: General mechanism contains code specific to one use case
