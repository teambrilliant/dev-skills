★ Explain · inline: cron job charges pending orders ─────────────
```
 cron (every N min)
     │ fires
     ▼
 charge job ──SELECT status='pending'──► orders table
     │                                      ▲
     │ for each row:                        │
     │                                      │ UPDATE status = 'paid'
     ├──charge(amount, customer)──► Stripe  │     or 'failed'
     │                                │     │
     │◄──────── ok / declined ────────┘     │
     │                                      │
     └──────────────────────────────────────┘
```

So a cron job wakes up on a schedule. It asks the `orders` table for every row with status `pending`, which just means "nobody has charged this yet."

Then it goes through those rows one at a time. For each one it calls Stripe and says "charge this customer this amount." Stripe answers with either success or a decline/error. The job writes that answer back to the row: `paid` if it worked, `failed` if it didn't. Next row.

The point is that the `orders` table is the only memory this system has. The job knows nothing except what `status` says. `pending` means "charge me," and anything else means "leave me alone." Every risk below comes from that.

**Why this and not the other way?** The usual alternative is charging right when the order is placed, in the request, and maybe using a cron only to retry. Doing it in a batch keeps checkout fast and keeps Stripe outages out of the checkout path. The cost is that the customer doesn't know right away whether the charge worked. The description doesn't say why the batch approach was picked, so treat that as an open question.

**What if someone's trying to break it?** The real danger isn't an outsider. It's the job tripping over itself, and the result is double charges. Three ways that happens:
- Two runs overlap. The run at 10:00 is still working when the 10:05 run starts. Both read the same `pending` rows and both charge them. The description mentions no lock, no `SELECT … FOR UPDATE SKIP LOCKED`, and no "claim the row first" step.
- The job crashes after Stripe says ok but before it writes `paid`. The row is still `pending`, so the next run charges it again.
- A Stripe call times out. You can't tell whether the charge went through. If you mark it `failed` and someone retries, or if you leave it `pending`, you might charge twice.

The standard fix for all three is a Stripe idempotency key built from the order id. Stripe then refuses to create a second charge for the same key. The description doesn't mention one. It also doesn't say who can create or edit rows in `orders` and set them to `pending`. If anyone can, then that's who decides what gets charged.

**What does the data look like, and why that shape?** As described, it's one `status` column with three values: `pending`, `paid`, `failed`. That's simple to query. But it has no "charging" state in between, which is exactly the gap a crash falls into. It also has no Stripe charge/PaymentIntent id stored, so you can't match a row to what Stripe actually did. And it has no attempt count or error reason. A `failed` row doesn't tell you whether the card was declined (the customer has to fix it) or Stripe was down (just retry).

**Where does it fail?**
- Stripe is down. Every row in that run becomes `failed`, even though nothing is wrong with any customer. The description doesn't say whether `failed` ever gets retried. If it doesn't, those orders are stuck.
- The cron stops running. Orders just sit at `pending` forever. Nothing errors, so nothing alerts.
- A partial crash mid-batch: see the double-charge cases above.
- What the user sees: the description doesn't cover that at all. There's no email on `failed`, no "update your card" flow, and nothing about what `pending` looks like in the UI. Nobody would notice any of this unless someone has monitoring on the `pending` count and the `failed` rate, and the description doesn't mention any.
───────────────────────────────────────────── ★

The biggest gap is the double charge: no idempotency key, no row claiming, and nothing for "Stripe said ok but we crashed." Close that first. `/dev-skills:write-plan` if this is going to be built.
