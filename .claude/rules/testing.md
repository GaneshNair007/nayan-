# Testing & Verification Rules

1. **Testing Coverage**:
   - State transition correctness: VerificationState and ResponseState transitions.
   - Priority and evidence scoring calculations.
   - Signal safety invariants validation (incompatible green rejection, clearance bounds).
   - REST snapshots and WebSocket envelope schema validation.
2. **Execution**:
   - Run `pytest tests/ -v` after major changes. Ensure 100% test pass rate with zero warnings.
