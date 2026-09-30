# INVALIDATED TRAINING RUN: experimental_invalid_v1

> [!WARNING]
> THIS MODEL AND TRAINING RUN HAVE BEEN SCIENTIFICALLY INVALIDATED AND MUST NEVER BE USED FOR PRODUCTION OR DEMO INFERENCE.

## Reason for Invalidation
The dataset (`datasets/india_emergency`) used to train this checkpoint was created using `scripts/create_indian_dataset.py`, which performed synthetic and arbitrary class label manipulation based on frame counters:
- Ordinary cars were relabeled as `ambulance` if `frames_extracted % 3 == 0`
- Ordinary cars were relabeled as `van` if `frames_extracted % 4 == 0`
- Motorcycles were relabeled as `scooter` if `frames_extracted % 2 == 0`
- Trucks were relabeled as `auto-rickshaw` if `frames_extracted % 2 == 0`

## Status
- **Validity:** Scientifically Invalid / Corrupted Labels
- **Action:** Archived under `experimental_invalid_v1`
- **Usage:** Strictly prohibited in active NAYAN pipeline loading or inference.
