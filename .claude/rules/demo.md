# Golden Demo Execution Rules

1. **Self-Contained & Deterministic**:
   - The Golden Demo must operate 100% offline without external network or GPU dependency.
   - Demo controls must be prominently visible: `[Start Golden Demo]`, `[Pause]`, `[Step]`, `[Reset]`.
2. **Scenario Progression**:
   - Step 1: Normal operational state.
   - Step 2: Collision candidate on CAM-04 (`OBSERVED`).
   - Step 3: Temporal verification (`VERIFYING`) with deceleration & trajectory overlap evidence.
   - Step 4: Incident confirmed (`CONFIRMED`).
   - Step 5: Traffic pressure changes on JNC-02; safe signal recommendation proposed.
   - Step 6: Operator authorizes response; AMB-03 dispatched (`DISPATCHED`).
   - Step 7: Multi-junction green corridor activated (`JNC-01` -> `JNC-02` -> `JNC-03`).
   - Step 8: Digital Twin comparison displayed (Fixed vs Adaptive timing with identical seed & demand).
   - Step 9: Incident contained and audit report exportable.
