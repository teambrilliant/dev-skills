`★ Product View ──────────────────────────────────`
- Don't build a dedicated recurring-invoice reminder. Ship it as a preset on the existing recurring-task feature ("Invoice {client} on the 1st"), then measure who uses it.
- A todo app already covers "remind me to invoice." What a reminder can't do is help the freelancer get paid: what to bill, whether the invoice went out, and whether the client paid.
- The risk is drifting into invoicing software (Bonsai, FreshBooks, Stripe) and losing to tools that automate recurring invoices outright.
`───────────────────────────────────────────── ★`

**What the user is actually trying to do**
The job isn't "remember to invoice." It's "keep cash coming in without tracking it in my head." Invoicing on time is one step. The others are knowing what to bill and chasing late payments, and late payment is usually the bigger pain.

**Who it helps**

| Segment | Invoicing today | Value of a reminder |
|---|---|---|
| Fixed retainer | Auto-recurring in Stripe or QuickBooks | ~None. It's already automated. |
| Variable hours or milestones | Manual, monthly | Real, but only if the reminder shows hours or deliverables to bill |
| Ad hoc project work | One-off invoices | Low. There's nothing recurring to remind. |

Only the middle segment benefits, and it needs context the todo app probably doesn't have (time tracking, rates).

**The angles**
- **Business:** A reminder doesn't make anyone stay or pay. Missing it costs nothing, so it won't win against competitors either. The only real benefit is positioning: it tells freelancers the app understands them.
- **Competitors:** Invoicing tools treat recurring invoices as basic. A todo app can't beat them at invoicing. It can win as the place freelancers already check every day, so the money-related nudges should show up there.
- **Technical:** The preset is just configuration on the existing recurring-task feature. A dedicated feature adds a new kind of entity with its own scheduling and states. Anything time-based also needs a way to fire on demand or fake the clock, or every test means waiting for the 1st of the month.
- **Risk:** The preset is fully reversible. Adding paid/unpaid tracking commits the app to being an invoicing tool.

**Strategic fit**
It depends on positioning, which isn't stated:
- **A general todo app that freelancers use:** ship the preset and stop there.
- **A tool for running a freelance business:** the stronger feature is payment follow-up: invoice sent → due date passes → a "chase {client}" task appears automatically. That needs the user to mark invoices paid, or an integration with Stripe or QuickBooks. Decide the positioning first.

**Cheapest test before building more**
1. Add a "Bill a client" recurring preset to onboarding.
2. Track two numbers: the share of new users who create one, and the share who complete it month after month.
3. Interview 5–10 heavy users about how they invoice and how they chase payment. If chasing is the pain, that's the feature to build.

Want me to shape the payment follow-up version, or run `/dev-skills:product-discovery` on the preset test first?
