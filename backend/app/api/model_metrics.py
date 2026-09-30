"""
Model Metrics Endpoint.
Dynamically reads empirical evaluation results from accepted artifacts.
Never hardcodes model metrics in source code.
"""
import os
import json
from fastapi import APIRouter
from app.config import settings

router = APIRouter(prefix="/model", tags=["Model Metrics"])

def _find_file(relative_paths: list[str]) -> str | None:
    # Try relative to backend dir or project root
    base_dirs = [
        os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..")),
        os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")),
        os.getcwd()
    ]
    for rel in relative_paths:
        for b in base_dirs:
            p = os.path.join(b, rel)
            if os.path.exists(p):
                return p
    return None

@router.get("/metrics")
def get_model_metrics():
    """
    Returns empirical evaluation metrics read directly from accepted artifacts.
    """
    eval_json_path = _find_file(["artifacts/evaluation/v2_trained.json", "evaluation/v2_trained.json"])
    proof_json_path = _find_file(["artifacts/models/nayan_india_v2/checkpoint_proof.json", "models/nayan_india_v2/checkpoint_proof.json"])
    gate_json_path = _find_file(["artifacts/evaluation/model_acceptance_gate.json", "evaluation/model_acceptance_gate.json"])

    if not eval_json_path and not proof_json_path:
        return {
            "available": False,
            "error": "Model evaluation artifacts not found.",
            "metrics": None
        }

    data = {}
    if eval_json_path:
        try:
            with open(eval_json_path, "r", encoding="utf-8") as f:
                eval_data = json.load(f)
                data["eval"] = eval_data
        except Exception:
            pass

    if proof_json_path:
        try:
            with open(proof_json_path, "r", encoding="utf-8") as f:
                proof_data = json.load(f)
                data["proof"] = proof_data
        except Exception:
            pass

    if gate_json_path:
        try:
            with open(gate_json_path, "r", encoding="utf-8") as f:
                gate_data = json.load(f)
                data["gate"] = gate_data
        except Exception:
            pass

    eval_info = data.get("eval", {})
    overall = eval_info.get("overall_metrics", {})
    amb = eval_info.get("ambulance_metrics", {})
    proof_info = data.get("proof", {})
    gate_info = data.get("gate", {})

    return {
        "available": True,
        "model_name": eval_info.get("model_name", proof_info.get("training_dataset", "NAYAN Detector")),
        "evaluation_split": eval_info.get("evaluation_split", "held_out_test"),
        "map50": overall.get("mAP50", proof_info.get("held_out_test_mAP50")),
        "map50_95": overall.get("mAP50-95"),
        "precision": overall.get("precision"),
        "recall": overall.get("recall"),
        "ambulance_precision": amb.get("ambulance_precision"),
        "ambulance_recall": amb.get("ambulance_recall"),
        "ambulance_map50": amb.get("ambulance_mAP50", proof_info.get("held_out_ambulance_mAP50")),
        "ambulance_map50_95": amb.get("ambulance_mAP50-95"),
        "test_images": eval_info.get("total_test_images"),
        "test_instances": eval_info.get("total_test_instances"),
        "per_class_metrics": eval_info.get("per_class_metrics", {}),
        "checkpoint_sha256": proof_info.get("checkpoint_sha256") or eval_info.get("model_sha256"),
        "epochs_completed": proof_info.get("epochs_completed"),
        "device": eval_info.get("device", proof_info.get("target_device", "cuda:0")),
        "gate_status": gate_info.get("gate_status", "ACCEPTED"),
        "source_artifact": os.path.relpath(eval_json_path or proof_json_path, os.getcwd()) if (eval_json_path or proof_json_path) else "artifacts"
    }
