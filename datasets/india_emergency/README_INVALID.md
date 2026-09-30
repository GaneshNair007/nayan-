# EXPERIMENTAL INVALID V1 DATASET (`india_emergency`)

## Status: QUARANTINED & INVALIDATED

### Why this dataset is invalid:
1. **Synthetic Frame-Modulo Relabeling**:
   The generator script `scripts/create_indian_dataset.py` artificially converted ordinary cars into ambulances (`if frames_extracted % 3 == 0: ambulance`), vans (`if frames_extracted % 4 == 0: van`), and other classes based purely on frame counters.
2. **Scientifically Corrupted Ground Truth**:
   The resulting labels do NOT correspond to visual ground truth. Vehicles labeled as ambulances are visually regular private passenger cars.
3. **No Held-Out Test Set**:
   The dataset only partitioned into `train` and `val` splits without an untouched held-out `test` split.
4. **Severe Video Leakage**:
   Adjacent video frames were placed across splits.

### Replacement:
This dataset is superseded by `datasets/nayan_india_v2/` which contains real, verified annotations, video-isolated splits, zero data leakage, and a verified held-out test split.

**DO NOT USE THIS DATASET FOR TRAINING OR BENCHMARKING.**
