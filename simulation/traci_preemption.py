"""
NAYAN - SUMO TraCI Script for India-specific Dynamic Emergency Yield Corridor
Implements:
- Predictive Junction Preemption (Signal Phase Changes)
- Sub-lane model integration (lane-agnostic behavior typical of Indian traffic)
- Dynamic Corridor clearance for ambulances
"""

import os
import sys

# Try to import traci, fail gracefully if not installed
try:
    import traci
except ImportError:
    pass

class NayanSimulationRunner:
    def __init__(self, mode="nayan_corridor"):
        """
        mode: 'normal', 'green_preemption', 'nayan_corridor'
        """
        self.mode = mode
        self.ambulance_id = "amb_1"
        self.junction_id = "J1"

    def run(self):
        print(f"Starting simulation in mode: {self.mode}")
        step = 0
        
        # To simulate India traffic realistically, sublane model must be active
        # traci.start(["sumo-gui", "-c", "nayan_corridor.sumocfg", "--lateral-resolution", "0.8"])
        
        # Mocking the loop for environments where SUMO is not installed
        while step < 1000:
            if "traci" in sys.modules:
                traci.simulationStep()
                self._apply_logic(step)
            else:
                # Mocking logic if traci is missing
                self._mock_logic(step)
                if step % 100 == 0:
                    print(f"Simulation step {step} / 1000...")
            step += 1
            
        if "traci" in sys.modules:
            traci.close()
        print("Simulation complete.")

    def _apply_logic(self, step):
        """Actual TraCI logic for SUMO"""
        try:
            # Check if ambulance is in the network
            vehicles = traci.vehicle.getIDList()
            if self.ambulance_id not in vehicles:
                return

            amb_edge = traci.vehicle.getRoadID(self.ambulance_id)
            amb_pos = traci.vehicle.getLanePosition(self.ambulance_id)

            if self.mode == "green_preemption":
                # Standard green preemption: Turn lights green for ambulance direction
                # This doesn't account for congestion already at the light
                tls_id = "TLS_1"
                distance_to_tls = self._get_distance_to_tls(amb_edge, amb_pos)
                if distance_to_tls < 300:
                    traci.trafficlight.setPhase(tls_id, 0) # Force green phase

            elif self.mode == "nayan_corridor":
                # Dynamic Corridor + Predictive Preemption
                # 1. Compress traffic laterally
                for veh in vehicles:
                    if veh != self.ambulance_id and traci.vehicle.getRoadID(veh) == amb_edge:
                        v_pos = traci.vehicle.getLanePosition(veh)
                        # If vehicle is ahead of ambulance
                        if v_pos > amb_pos:
                            # Force vehicles to yield to edges (sublane model)
                            # Lane 0 is right, Lane 1 is middle, Lane 2 is left
                            veh_lane = traci.vehicle.getLaneIndex(veh)
                            if veh_lane == 1:
                                traci.vehicle.changeSublane(veh, -1.0) # Move left/right to compress
                            
                # 2. Predictive Junction Preemption
                # Clear the intersection well in advance, not just turn it green
                tls_id = "TLS_1"
                distance_to_tls = self._get_distance_to_tls(amb_edge, amb_pos)
                
                if distance_to_tls < 500: # Preempt earlier than normal
                    # Extend green time for current phase to clear queue
                    current_phase = traci.trafficlight.getPhase(tls_id)
                    traci.trafficlight.setPhaseDuration(tls_id, 10) 
                    
        except traci.exceptions.TraCIException:
            pass

    def _get_distance_to_tls(self, edge, pos):
        # Simplistic distance calculation
        edge_length = 500.0 # mock
        return edge_length - pos

    def _mock_logic(self, step):
        """Mock output to show algorithm execution without SUMO"""
        if step == 100:
            print("[NAYAN SIM] Ambulance amb_1 spawned.")
        elif step == 150:
            if self.mode == "nayan_corridor":
                print("[NAYAN SIM] Dynamic Slicing: Detected high congestion ahead. Sending lateral compression commands to surrounding vehicles (auto-rickshaws, bikes).")
        elif step == 200:
             if self.mode == "nayan_corridor":
                 print("[NAYAN SIM] Feasibility Score: MEDIUM. Vehicles successfully compressed to edges. Clearance window created.")
        elif step == 250:
             if self.mode == "nayan_corridor":
                 print("[NAYAN SIM] Predictive Junction Preemption: Extending green phase at TLS_1 to clear queue 500m ahead.")
             elif self.mode == "green_preemption":
                 print("[NAYAN SIM] Standard Preemption: Forcing green phase at TLS_1 (distance 300m).")
        elif step == 350:
            print("[NAYAN SIM] Ambulance amb_1 passed the junction.")

if __name__ == "__main__":
    runner = NayanSimulationRunner(mode="nayan_corridor")
    runner.run()
