# Input vs. Output Metrics

How Amazon measures a product once it's live — and why managing outputs is a
trap. Relevant when a PR-FAQ asks "how will we know this is working?"

## The distinction

- **Output metrics** — lagging *results*: revenue, profit, stock price, total
  customers. They tell you *what happened*. You can't act on them directly.
- **Input metrics** — the *controllable actions* that drive the outputs:
  selection, price, in-stock availability, page-load speed, defect rate. They
  tell you *what to do*.

**Manage the inputs.** Everyone — IC to CEO — should track the inputs they
control. Executives who watch only outputs have lost the levers that move them.

## DMAIC — find the right input metric (in order)

1. **Define** — pick controllable input metrics that, when improved, move the
   outputs you want. Expect to iterate the definition (Amazon's selection metric
   went through four versions before "Fast Track In Stock"). A bad metric drives
   bad behavior.
2. **Measure** — build unbiased collection; have **finance own the data** (no
   skin in the game); audit regularly to catch drift.
3. **Analyze** — separate signal from noise; use **Five Whys** / **Correction of
   Errors (COE)** to reach the true root cause. Don't react to normal variation.
4. **Improve** — only after Define/Measure/Analyze are solid. Respond to signals,
   not noise.
5. **Control** — keep it from degrading; automate once the decision logic is well
   understood.

Skipping to "Improve" without Define/Measure/Analyze wastes effort.

## The WBR (Weekly Business Review)

- A weekly data package reviewed by the full leadership team, **certified by finance**.
- Mostly charts: trailing **6-week + 12-month** views on one graph (the "zoom"
  pattern); plot **YoY growth rates** alongside absolutes to catch deceleration early.
- **Exception-focused** — skip metrics behaving normally; spend time on anomalies.
- **Business owners explain their own variances**; finance only certifies accuracy.
- **Pair data with anecdotes** (Voice of the Customer, exception reports) — each
  is a check on the other; a number without a story, or a story without a number,
  misleads.

## The flywheel

Input metrics compound through a self-reinforcing loop: better customer
experience → more traffic → more sellers → wider selection → better customer
experience → growth → lower cost structure → lower prices → the loop spins
faster. Push the inputs; the flywheel does the rest.
