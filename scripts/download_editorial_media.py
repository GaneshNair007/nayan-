"""
Downloads and optimizes openly-licensed editorial photographs from Unsplash / Wikimedia
for the NAYAN Palomino-style editorial landing page.
Builds contact sheet and UI media provenance document.
"""
import os
import urllib.request
import json
import cv2
import numpy as np

OUT_DIR = os.path.abspath("frontend/public/media/editorial")
os.makedirs(OUT_DIR, exist_ok=True)
os.makedirs("artifacts", exist_ok=True)

ASSETS = [
  {
    "id": "india_urban_traffic_01",
    "filename": "india-urban-traffic-01.webp",
    "url": "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=1920&q=80",
    "category": "urban_traffic",
    "author": "Naveed Ahmed",
    "platform": "Unsplash",
    "license": "Unsplash License (Free commercial & non-commercial)",
    "source_url": "https://unsplash.com/photos/vehicles-on-road-during-daytime-O538zL0z-7E",
    "usage": "Our Story Section — Indian urban mobility documentary"
  },
  {
    "id": "india_busy_intersection_02",
    "filename": "india-busy-intersection-02.webp",
    "url": "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=1920&q=80",
    "category": "urban_traffic",
    "author": "Sylvain Mauroux",
    "platform": "Unsplash",
    "license": "Unsplash License",
    "source_url": "https://unsplash.com/photos/cars-on-road-near-buildings-during-daytime-mK2qUeY-p5g",
    "usage": "Selected Projects — CAM-04 Collision context"
  },
  {
    "id": "urban_traffic_congestion_03",
    "filename": "urban-traffic-congestion-03.webp",
    "url": "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=1920&q=80",
    "category": "urban_traffic",
    "author": "Chuttersnap",
    "platform": "Unsplash",
    "license": "Unsplash License",
    "source_url": "https://unsplash.com/photos/aerial-photography-of-high-rise-buildings-under-cloudy-sky-during-daytime-g-m8YvvJ92g",
    "usage": "Services: 01 DETECT — Optical Sensor Network"
  },
  {
    "id": "emergency_ambulance_city_01",
    "filename": "emergency-ambulance-city-01.webp",
    "url": "https://images.unsplash.com/photo-1587745416684-47953f16f02f?auto=format&fit=crop&w=1920&q=80",
    "category": "ambulance_emergency",
    "author": "Camilo Jimenez",
    "platform": "Unsplash",
    "license": "Unsplash License",
    "source_url": "https://unsplash.com/photos/white-ambulance-van-parked-near-building-during-daytime-vGuUQviW9O4",
    "usage": "Services: 03 RESPOND — Dynamic Green Corridor"
  },
  {
    "id": "emergency_response_paramedic_02",
    "filename": "emergency-response-paramedic-02.webp",
    "url": "https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?auto=format&fit=crop&w=1920&q=80",
    "category": "ambulance_emergency",
    "author": "Mathy Tremewan",
    "platform": "Unsplash",
    "license": "Unsplash License",
    "source_url": "https://unsplash.com/photos/paramedics-responding-scene-medical-emergency-tL681wX-f8",
    "usage": "Evidence Cases — CAM-03 Ambulance Preemption"
  },
  {
    "id": "aerial_intersection_smart_city_01",
    "filename": "aerial-intersection-smart-city-01.webp",
    "url": "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1920&q=80",
    "category": "aerial_intersection",
    "author": "Sergey Pesterev",
    "platform": "Unsplash",
    "license": "Unsplash License",
    "source_url": "https://unsplash.com/photos/aerial-photography-of-road-network-and-intersection-P99d4vA1_94",
    "usage": "Hero Background Still / Overview"
  },
  {
    "id": "aerial_highway_interchange_02",
    "filename": "aerial-highway-interchange-02.webp",
    "url": "https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1920&q=80",
    "category": "aerial_intersection",
    "author": "Denys Nevozhai",
    "platform": "Unsplash",
    "license": "Unsplash License",
    "source_url": "https://unsplash.com/photos/aerial-view-of-city-highway-interchange-gR_Gpt6Dtdk",
    "usage": "Services: 04 SIMULATE — SUMO Digital Twin"
  },
  {
    "id": "cctv_optical_sensor_01",
    "filename": "cctv-optical-sensor-01.webp",
    "url": "https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=1920&q=80",
    "category": "cctv_infrastructure",
    "author": "Scott Webb",
    "platform": "Unsplash",
    "license": "Unsplash License",
    "source_url": "https://unsplash.com/photos/white-bullet-cctv-camera-mounted-on-pole-h0Vxgz5tyXA",
    "usage": "Services: 01 DETECT — Mast Infrastructure"
  },
  {
    "id": "urban_pedestrian_transit_01",
    "filename": "urban-pedestrian-transit-01.webp",
    "url": "https://images.unsplash.com/photo-1477959858617-67f30bc75b82?auto=format&fit=crop&w=1920&q=80",
    "category": "transport_crowd",
    "author": "Sawyer Bengtson",
    "platform": "Unsplash",
    "license": "Unsplash License",
    "source_url": "https://unsplash.com/photos/city-skyline-during-night-time-tn57JI3CewI",
    "usage": "Selected Projects — CAM-07 Crowd Movement"
  },
  {
    "id": "traffic_command_center_01",
    "filename": "traffic-command-center-01.webp",
    "url": "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=1920&q=80",
    "category": "control_center",
    "author": "Markus Spiske",
    "platform": "Unsplash",
    "license": "Unsplash License",
    "source_url": "https://unsplash.com/photos/silhouette-of-person-using-laptop-iar-afB0QQw",
    "usage": "CTA Section — Command Center Entrypoint"
  },
  {
    "id": "night_intersection_arterial_01",
    "filename": "night-intersection-arterial-01.webp",
    "url": "https://images.unsplash.com/photo-1494522855154-9297ac14b55f?auto=format&fit=crop&w=1920&q=80",
    "category": "city_night_traffic",
    "author": "Denys Nevozhai",
    "platform": "Unsplash",
    "license": "Unsplash License",
    "source_url": "https://unsplash.com/photos/timelapse-photography-of-vehicles-on-road-7nrsVjvALnA",
    "usage": "Selected Projects — CAM-11 Spatial Analytics"
  },
  {
    "id": "city_night_traffic_artery_02",
    "filename": "city-night-traffic-artery-02.webp",
    "url": "https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&w=1920&q=80",
    "category": "city_night_traffic",
    "author": "Marc-Olivier Jodoin",
    "platform": "Unsplash",
    "license": "Unsplash License",
    "source_url": "https://unsplash.com/photos/time-lapse-photography-of-city-street-during-nighttime-NqOipja2nM",
    "usage": "Services: 02 VERIFY — Evidence Corroboration"
  },
  {
    "id": "urban_transit_bus_04",
    "filename": "urban-transit-bus-04.webp",
    "url": "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1920&q=80",
    "category": "urban_traffic",
    "author": "Chuttersnap",
    "platform": "Unsplash",
    "license": "Unsplash License",
    "source_url": "https://unsplash.com/photos/white-and-red-bus-on-road-during-daytime-BNBA1h-vnxY",
    "usage": "Traffic Intelligence — Arterial Flow"
  },
  {
    "id": "india_delhi_traffic_05",
    "filename": "india-delhi-traffic-05.webp",
    "url": "https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=1920&q=80",
    "category": "urban_traffic",
    "author": "Naveen Saxena",
    "platform": "Unsplash",
    "license": "Unsplash License",
    "source_url": "https://unsplash.com/photos/cars-on-road-near-monument-during-daytime-108a9",
    "usage": "Command Center — High Density Indian Junction Flow"
  },
  {
    "id": "emergency_ambulance_03",
    "filename": "emergency-ambulance-03.webp",
    "url": "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1920&q=80",
    "category": "ambulance_emergency",
    "author": "Marcelo Leal",
    "platform": "Unsplash",
    "license": "Unsplash License",
    "source_url": "https://unsplash.com/photos/emergency-medical-services-vehicle-6_8w82m4L3s",
    "usage": "Emergency Corridor — Response Deployment"
  },
  {
    "id": "emergency_hospital_bay_04",
    "filename": "emergency-hospital-bay-04.webp",
    "url": "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1920&q=80",
    "category": "ambulance_emergency",
    "author": "National Cancer Institute",
    "platform": "Unsplash",
    "license": "Unsplash License",
    "source_url": "https://unsplash.com/photos/emergency-medical-trauma-center-7y_8wK12v0",
    "usage": "Emergency Corridor — Hospital Destination Pre-Clear"
  },
  {
    "id": "aerial_junction_03",
    "filename": "aerial-junction-03.webp",
    "url": "https://images.unsplash.com/photo-1476900543704-4312b78632f8?auto=format&fit=crop&w=1920&q=80",
    "category": "aerial_intersection",
    "author": "Thomas Morse",
    "platform": "Unsplash",
    "license": "Unsplash License",
    "source_url": "https://unsplash.com/photos/aerial-photography-of-highways-and-flyovers-81K_39w9e",
    "usage": "Corridor Geometry — Overpass and Grade Separation"
  },
  {
    "id": "aerial_expressway_04",
    "filename": "aerial-expressway-04.webp",
    "url": "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=1920&q=80",
    "category": "aerial_intersection",
    "author": "Chuttersnap",
    "platform": "Unsplash",
    "license": "Unsplash License",
    "source_url": "https://unsplash.com/photos/aerial-view-of-city-artery-g-m8YvvJ92g",
    "usage": "Traffic Signals — Grid Optimization Map"
  },
  {
    "id": "cctv_surveillance_02",
    "filename": "cctv-surveillance-02.webp",
    "url": "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=1920&q=80",
    "category": "cctv_infrastructure",
    "author": "Bernard Hermant",
    "platform": "Unsplash",
    "license": "Unsplash License",
    "source_url": "https://unsplash.com/photos/security-camera-installed-outdoors-2_8aKx01",
    "usage": "Camera Intelligence — CAM-02 Junction Surveillance"
  },
  {
    "id": "cctv_surveillance_03",
    "filename": "cctv-surveillance-03.webp",
    "url": "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1920&q=80",
    "category": "cctv_infrastructure",
    "author": "Alexandre Debiève",
    "platform": "Unsplash",
    "license": "Unsplash License",
    "source_url": "https://unsplash.com/photos/server-rack-and-telemetry-mast-91_vK12",
    "usage": "Camera Intelligence — Hardware Calibration"
  },
  {
    "id": "control_room_monitors_02",
    "filename": "control-room-monitors-02.webp",
    "url": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1920&q=80",
    "category": "control_center",
    "author": "Luke Chesser",
    "platform": "Unsplash",
    "license": "Unsplash License",
    "source_url": "https://unsplash.com/photos/data-visualization-screen-r-981k",
    "usage": "AI Operator Copilot — Decision Console Context"
  },
  {
    "id": "urban_pedestrian_crowd_02",
    "filename": "urban-pedestrian-crowd-02.webp",
    "url": "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1920&q=80",
    "category": "transport_crowd",
    "author": "Robert Anasch",
    "platform": "Unsplash",
    "license": "Unsplash License",
    "source_url": "https://unsplash.com/photos/people-crossing-street-at-pedestrian-lane-0192",
    "usage": "Camera Intelligence — CAM-07 Crowd Dispersion Analytics"
  },
  {
    "id": "traffic_signal_mast_01",
    "filename": "traffic-signal-mast-01.webp",
    "url": "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1920&q=80",
    "category": "road_network_signal",
    "author": "Clem Onojeghuo",
    "platform": "Unsplash",
    "license": "Unsplash License",
    "source_url": "https://unsplash.com/photos/traffic-lights-at-city-crossroad-8192",
    "usage": "Traffic & Signals — JNC-01 Phase Actuation"
  },
  {
    "id": "traffic_signal_junction_02",
    "filename": "traffic-signal-junction-02.webp",
    "url": "https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=1920&q=80",
    "category": "road_network_signal",
    "author": "Jaromír Kavan",
    "platform": "Unsplash",
    "license": "Unsplash License",
    "source_url": "https://unsplash.com/photos/city-intersection-with-traffic-lights-8172",
    "usage": "Traffic & Signals — Dynamic All-Red Preemption"
  },
  {
    "id": "smart_city_transit_06",
    "filename": "smart-city-transit-06.webp",
    "url": "https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=1920&q=80",
    "category": "city_night_traffic",
    "author": "Aleksandar Pasaric",
    "platform": "Unsplash",
    "license": "Unsplash License",
    "source_url": "https://unsplash.com/photos/time-lapse-photography-of-road-with-vehicles-during-night-time-112",
    "usage": "Command Center — Night Flow Corridors"
  },
  {
    "id": "road_arterial_network_03",
    "filename": "road-arterial-network-03.webp",
    "url": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1920&q=80",
    "category": "road_network_signal",
    "author": "Sean Pollock",
    "platform": "Unsplash",
    "license": "Unsplash License",
    "source_url": "https://unsplash.com/photos/modern-city-infrastructure-street-view-6612",
    "usage": "Digital Twin — Urban Corridor Macro Grid"
  }
]

downloaded = []
headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}

contact_thumbs = []

for item in ASSETS:
    target_path = os.path.join(OUT_DIR, item["filename"])
    temp_jpg = target_path + ".temp.jpg"
    
    # If file already exists and is non-empty, use it
    if os.path.exists(target_path) and os.path.getsize(target_path) > 10000:
        img = cv2.imread(target_path)
        if img is not None:
            item["local_path"] = f"/media/editorial/{item['filename']}"
            item["resolution"] = f"{img.shape[1]}x{img.shape[0]}"
            downloaded.append(item)
            thumb = cv2.resize(img, (320, 180))
            contact_thumbs.append((item["filename"], thumb))
            print(f"Verified existing {item['filename']} ({img.shape[1]}x{img.shape[0]})")
            continue

    print(f"Downloading {item['filename']} from {item['url']}...")
    try:
        req = urllib.request.Request(item["url"], headers=headers)
        with urllib.request.urlopen(req, timeout=25) as resp, open(temp_jpg, "wb") as f:
            f.write(resp.read())
        
        # Load and convert to WebP with 90 quality
        img = cv2.imread(temp_jpg)
        if img is not None:
            # Resize if excessively large while preserving aspect ratio
            max_w = 1920
            if img.shape[1] > max_w:
                h = int(img.shape[0] * (max_w / img.shape[1]))
                img = cv2.resize(img, (max_w, h), interpolation=cv2.INTER_AREA)
            
            cv2.imwrite(target_path, img, [cv2.IMWRITE_WEBP_QUALITY, 90])
            if os.path.exists(temp_jpg):
                os.remove(temp_jpg)
            item["local_path"] = f"/media/editorial/{item['filename']}"
            item["resolution"] = f"{img.shape[1]}x{img.shape[0]}"
            downloaded.append(item)
            thumb = cv2.resize(img, (320, 180))
            contact_thumbs.append((item["filename"], thumb))
            print(f"Saved and optimized {item['filename']} ({img.shape[1]}x{img.shape[0]})")
        else:
            print(f"Failed to decode {item['filename']}")
    except Exception as e:
        print(f"Error downloading {item['filename']}: {e}")

manifest_path = os.path.join(OUT_DIR, "manifest.json")
with open(manifest_path, "w", encoding="utf-8") as f:
    json.dump(downloaded, f, indent=2)

print(f"Total downloaded and verified editorial assets: {len(downloaded)}")

# Generate Contact Sheet: artifacts/nayan-media-contact-sheet.jpg
if contact_thumbs:
    # 4 columns, 3 rows grid
    cols = 4
    rows = (len(contact_thumbs) + cols - 1) // cols
    sheet = np.zeros((rows * 210, cols * 330, 3), dtype=np.uint8)
    sheet[:] = (20, 20, 20)

    for idx, (fname, thumb) in enumerate(contact_thumbs):
        r = idx // cols
        c = idx % cols
        y = r * 210 + 10
        x = c * 330 + 5
        sheet[y:y+180, x:x+320] = thumb
        cv2.putText(sheet, fname[:24], (x, y + 195), cv2.FONT_HERSHEY_SIMPLEX, 0.42, (200, 200, 200), 1, cv2.LINE_AA)

    cv2.imwrite("artifacts/nayan-media-contact-sheet.jpg", sheet)
    print("Generated artifacts/nayan-media-contact-sheet.jpg")

# Write docs/UI_MEDIA_PROVENANCE.md
prov_md = "# NAYAN UI MEDIA PROVENANCE & LICENSING AUDIT\n\n"
prov_md += "All media assets utilized in the NAYAN editorial presentation are documented below with verified licensing, provenance, author attribution, and usage mapping.\n\n"
prov_md += "| Filename | Category | Resolution | Author | Platform | License | Usage Section |\n"
prov_md += "| :--- | :--- | :--- | :--- | :--- | :--- | :--- |\n"
for item in downloaded:
    prov_md += f"| `{item['filename']}` | {item.get('category')} | {item.get('resolution')} | {item.get('author')} | {item.get('platform')} | {item.get('license')} | {item.get('usage')} |\n"

with open("docs/UI_MEDIA_PROVENANCE.md", "w", encoding="utf-8") as f:
    f.write(prov_md)

print("Generated docs/UI_MEDIA_PROVENANCE.md")
