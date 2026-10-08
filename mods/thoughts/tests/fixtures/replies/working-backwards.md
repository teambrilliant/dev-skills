# PR-FAQ: Thread Digest for GitHub

## Press release

**Thread Digest: a 200-comment pull request in 30 seconds**

*For engineers and tech leads who get pulled into long GitHub PR threads: see what was decided, what is still open, and what is waiting on you, without scrolling.*

**SAN FRANCISCO, March 2027.** Thread Digest is a browser extension that adds a panel to the top of every GitHub pull request. It shows the decisions made so far, the review threads still unresolved, and the questions or change requests waiting on you. Each item links to the comment it came from. It works on public and private repos and runs on your own model key, so no code goes through our servers.

**Problem.** "I got tagged on a PR with 140 comments, three force-pushes and two design changes. To do my review I had to read the whole history, because I couldn't tell which threads were settled, which were outdated, and which were blocking. That took 40 minutes, and I still missed the question that was addressed to me." On long PRs, GitHub collapses the hidden middle of the thread, marks threads outdated after a push even when they aren't settled, and gives no single view of what is still open.

**Solution.** Open any PR and Thread Digest shows three lists:
1. **Decided**: what the participants agreed on, with links.
2. **Open**: unresolved disagreements and unanswered questions, including threads marked outdated that never got a reply.
3. **On you**: requests that @-mention you or reply to your earlier comments.

It updates only for comments added since your last visit. If you weren't involved, you can catch up from the panel alone.

**Quotes.** "Long PRs don't fail because people can't read. They fail because the current state of the discussion isn't written down anywhere. We write it down." (Founder.) "I got pulled into the auth migration PR as the fourth reviewer. I read the digest, answered the two things that were waiting on me, and approved in ten minutes." (Staff engineer, hypothetical.)

**Get started:** install from the Chrome Web Store, paste a model API key and open any PR.

---

## FAQ

### External

**How is this different from asking Copilot or Claude to "summarize this PR"?**
A generic summary describes the code change. Thread Digest describes the state of the discussion: what was decided, what is open and what is waiting on you. If that difference isn't obvious to a user within 10 seconds, the product has no reason to exist.

**Does my code leave my machine?**
It goes to whichever model provider you set up with your key, not to us. That still counts as sending code to a third party, and many companies' security policies forbid it.

**What does it cost?**
With your own key it's free, or a one-time license. A hosted version at around $8 per user per month would need us to process private code, which runs straight into the security problem above.

**Does it work on GitHub Enterprise Server or GitLab?**
Not at launch. GitHub.com only.

### Internal (the hard ones)

**How big is the market, really?**
The pain only exists on long PRs. Most PRs have fewer than 10 comments, so even heavy users hit a truly long thread a few times a month. Pain that shows up a few times a month and costs about 30 minutes each time is real but occasional, which is weak ground for a habit or a subscription. The realistic audience is tech leads and staff engineers at mid-to-large companies on GitHub.com, which is exactly the group most likely to work under policies that ban browser extensions.

**Unit economics?**
Rough estimate, not measured: a 150-comment thread plus diff context is roughly tens of thousands of input tokens, which costs cents per digest on a mid-tier model. Incremental updates make that cheaper. Model cost is not the problem. Distribution and willingness to pay are. Bring-your-own-key keeps our costs near zero, but it also limits revenue to roughly a one-time price for a small tool.

**Dependencies and third-party risk?**
- **GitHub itself:** Copilot already offers PR summaries and chat about a PR on github.com (from what I know, not re-checked today). Once "what's unresolved" is worth building, it is also an obvious native feature for GitHub to ship, and GitHub controls the surface we run on.
- **The page structure:** reading the DOM is fragile. Using the GitHub API through OAuth is sturdier but needs a GitHub App and an org admin to install it, which triggers a security review.
- **Chrome Web Store policy and review delays.**

**Feasibility: what has to be true?**
- The model has to sort comments into decided, open and on-you accurately enough that people trust it. A digest that labels a still-open blocker as "Decided" is worse than nothing, because the user skips the read they should have done. This is the riskiest assumption and it hasn't been tested.
- Outdated threads, force-pushes and replies to suggested changes have to be stitched back together correctly. GitHub's own data model makes this hard.

**Why us, why now?**
Nothing about this is an unfair advantage. The model capability is a commodity, and anyone with Claude Code or Copilot Chat can get about 70% of the result by asking "what's unresolved on this PR?" The only possible edge is the narrow, opinionated decided/open/on-you view, and that is easy to copy.

**What kills it?**
GitHub ships an "unresolved discussion" summary in Copilot, or target users' companies block the extension. Either would cut off the core audience.

---

## Verdict: kill as a standalone product

- The occasional pain, the commodity capability and the platform owner moving into the same space make this a feature, not a product.
- The useful insight that survived the drafting: "summarize" is the wrong job. The real job is **"what is still open, and what is waiting on me."** If it's worth keeping, it belongs as a capability in a tool you already own, for example a `gh` + Claude Code skill: `/pr-state <url>` lists decided, open and on-me items. Org extension policy doesn't apply there, and it costs almost nothing to try on your own long PRs.
- Untested: how accurate the decided/open sorting is. If you want to keep going, run `product-discovery` first: hand-label 10 real long PRs and compare them with what the model produces.

`★ Working Backwards View ────────────────────────`
- Customer + benefit: tech leads and reviewers pulled into long PRs; know what's decided, what's open and what's waiting on you without reading 150 comments
- Verdict: kill (as a standalone extension): the pain is occasional, the capability is a commodity, GitHub/Copilot is the obvious owner, and enterprises block extensions
- Biggest hole: GitHub ships the "unresolved discussion" view natively, and the target users can't install third-party extensions that read private code
`───────────────────────────────────────────── ★`
