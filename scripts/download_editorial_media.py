"""
Downloads and optimizes openly-licensed editorial photographs from Unsplash
for the NAYAN Palomino-style editorial landing page.
"""
import os
import urllib.request
import json
import cv2

OUT_DIR = os.path.abspath("frontend/public/media/editorial")
os.makedirs(OUT_DIR, exist_ok=True)

ASSETS = [
  {
    "id": "india_urban_traffic_01",
    "filename": "india-urban-traffic-01.webp",
    "url": "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=1200&q=80",
    "author": "Naveed Ahmed",
    "license": "Unsplash License (Free to use commercial and non-commercial)",
    "source_url": "https://unsplash.com/photos/vehicles-on-road-during-daytime-O538zL0z-7E",
    "usage": "Our Story section / Urban transit context"
  },
  {
    "id": "traffic_command_center_01",
    "filename": "traffic-command-center-01.webp",
    "url": "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=1200&q=80",
    "author": "Markus Spiske",
    "license": "Unsplash License (Free to use commercial and non-commercial)",
    "source_url": "https://unsplash.com/photos/silhouette-of-person-using-laptop-iar-afB0QQw",
    "usage": "Services: Simulate / Digital Twin Control Room"
  },
  {
    "id": "emergency_ambulance_city_01",
    "filename": "emergency-ambulance-city-01.webp",
    "url": "https://images.unsplash.com/photo-1587745416684-47953f16f02f?auto=format&fit=crop&w=1200&q=80",
    "author": "Camilo Jimenez",
    "license": "Unsplash License (Free to use commercial and non-commercial)",
    "source_url": "https://unsplash.com/photos/white-ambulance-van-parked-near-building-during-daytime-vGuUQviW9O4",
    "usage": "Services: Respond / Emergency Corridors"
  },
  {
    "id": "night_intersection_arterial_01",
    "filename": "night-intersection-arterial-01.webp",
    "url": "https://images.unsplash.com/photo-1494522855154-9297ac14b55f?auto=format&fit=crop&w=1200&q=80",
    "author": "Denys Nevozhai",
    "license": "Unsplash License (Free to use commercial and non-commercial)",
    "source_url": "https://unsplash.com/photos/timelapse-photography-of-vehicles-on-road-7nrsVjvALnA",
    "usage": "Services: Detect / Optical Sensor Grid"
  },
  {
    "id": "urban_pedestrian_transit_01",
    "filename": "urban-pedestrian-transit-01.webp",
    "url": "https://images.unsplash.com/photo-1477959858617-67f30bc75b82?auto=format&fit=crop&w=1200&q=80",
    "author": "Sawyer Bengtson",
    "license": "Unsplash License (Free to use commercial and non-commercial)",
    "source_url": "https://unsplash.com/photos/city-skyline-during-night-time-tn57JI3CewI",
    "usage": "Services: Verify / Spatio-Temporal Evidence"
  }
]

downloaded = []
headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}

for item in ASSETS:
    target_path = os.path.join(OUT_DIR, item["filename"])
    temp_jpg = target_path + ".temp.jpg"
    print(f"Downloading {item['filename']}...")
    try:
        req = urllib.request.Request(item["url"], headers=headers)
        with urllib.request.urlopen(req, timeout=20) as resp, open(temp_jpg, "wb") as f:
            f.write(resp.read())
        
        # Load and convert to WebP
        img = cv2.imread(temp_jpg)
        if img is not None:
            cv2.imwrite(target_path, img, [cv2.IMWRITE_WEBP_QUALITY, 90])
            os.remove(temp_jpg)
            item["local_path"] = f"/media/editorial/{item['filename']}"
            item["resolution"] = f"{img.shape[1]}x{img.shape[0]}"
            downloaded.append(item)
            print(f"Saved and optimized {item['filename']} ({img.shape[1]}x{img.shape[0]})")
        else:
            print(f"Failed to decode {item['filename']}")
    except Exception as e:
        print(f"Error downloading {item['filename']}: {e}")

manifest_path = os.path.join(OUT_DIR, "manifest.json")
with open(manifest_path, "w", encoding="utf-8") as f:
    json.dump(downloaded, f, indent=2)

print(f"Completed download of {len(downloaded)} assets.")
