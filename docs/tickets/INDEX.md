# Tickets — WebSheet

**Prefix:** WS | **Total:** 10 | **Open:** 10 | **Done:** 0

## Board

### BACKLOG

| ID | Title | Priority | Assignee | Phase |
|----|-------|----------|----------|-------|
| [WS-001](WS-001.md) | Fix attack persistence on save | P0 | | Phase A: Fix Data & Choices |
| [WS-002](WS-002.md) | Fix subclass feature loading | P1 | | Phase A: Fix Data & Choices |
| [WS-003](WS-003.md) | Fix level display in review | P1 | | Phase A: Fix Data & Choices |
| [WS-004](WS-004.md) | Wizard multi-level choice support | P1 | | Phase A: Fix Data & Choices |
| [WS-010](WS-010.md) | Suggestive-not-restrictive audit | P1 | | Phase B: Derived Stats Pipeline |
| [WS-005](WS-005.md) | Derived stats engine (suggestive) | P1 | | Phase B: Derived Stats Pipeline |
| [WS-006](WS-006.md) | Remaining UX tickets (UX-07 through UX-11) | P2 | | Phase C: Finalize Design |
| [WS-007](WS-007.md) | DM dashboard view | P2 | | Phase D: DM Support |
| [WS-008](WS-008.md) | Level-up flow for multiclass | P2 | | Phase E: Combat & Level Testing |
| [WS-009](WS-009.md) | Combat testing across all classes | P2 | | Phase E: Combat & Level Testing |

### Dependencies

```
WS-001 ──┐
WS-002 ──┼──→ WS-005 ──┬──→ WS-007 (DM dashboard)
WS-004 ──┤             ├──→ WS-008 (Level-up) ──→ WS-009 (Combat testing)
WS-010 ──┘             └──→ WS-009
WS-003 ────────────────────→ WS-008
```

---

**Statuses:** BACKLOG → READY → IN_PROGRESS → CHECKPOINT → REVIEW → DONE | BLOCKED | DROPPED
**Priorities:** P0 (critical) P1 (high) P2 (medium) P3 (low) P4 (future)
