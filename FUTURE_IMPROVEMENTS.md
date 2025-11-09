## Why this file?

This document lists future / high priority improvement ideas and open questions for the debt/payment feature. These are not urgent, but are tracked here for discussion and design considerations as requirements evolve.

- **Implement a transactions repository** (currently missing; not required yet since requirements don't ask for transaction logs).

- **Clarify CLI output in debt chaining**: currently logs all `Transferred ... to ...`, which exposes internal transfers. In real scenarios, Alice shouldn't see transaction logs from Bob→Charlie; only show logs for the user's direct activity.

- **Re-consider the implications of automatic debt handling**, especially for long chains or cycles. Should debts be paid/propagated through the whole chain automatically? This may not reflect real-world expectations—users might want control over which debts are paid and when.

- **Refactor exception handling**: Currently, exception/catching logic is often embedded inside use cases. Consider separating exception handling logic or providing a more structured error reporting (returning result/error objects, or using error classes) instead of generic throws.

- **Integrate with a real database system** (e.g., PostgreSQL, MongoDB) instead of using in-memory repositories for accounts, debts, and (future) transactions. This includes persistence, proper migrations, and appropriate transactional integrity.

