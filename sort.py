import json
import csv
from datetime import datetime, timezone

# Load the JSON file
json_path = "output.json"  # Change this to your actual file path
csv_path = "output.csv"  # Output CSV file

with open(json_path, "r") as f:
    data = json.load(f)

# Manual header names as provided
columns = [
    "Date And Time",
    "Nuclear_Generation",
    "International_Imports",
    "Eskom_OCGT_Generation",
    "Eskom_Gas_Generation",
    "Dispatchable_IPP_OCGT",
    "Hydro_Water_Generation",
    "Pumped_Water_Generation",
    "IOS_Excl_ILS_and_MLR",
    "ILS_Usage",
    "Manual_Load_Reduction_MLR",
    "Wind",
    "PV",
    "CSP",
    "Other_RE",
    "Eskom_Gas_SCO_Pumping",
    "Eskom_OCGT_SCO_Pumping",
    "Hydro_Water_SCO_Pumping",
    "Pumped_Water_SCO_Pumping",
    "Thermal_Gen_Excl_Pumping_and_SCO"
]

values = []

# Extracting relevant data from the JSON structure
if "results" in data and len(data["results"]) > 0:
    result = data["results"][0]["result"]
    if "data" in result and "descriptor" in result["data"]:
        select_info = result["data"]["descriptor"]["Select"]
        all_columns = [col["Name"] for col in select_info[1:]]  # Skip first (timestamp)

        # Extracting actual data values
        if "dsr" in result["data"] and "DS" in result["data"]["dsr"]:
            ds = result["data"]["dsr"]["DS"][0]  # Access first dataset
            if "PH" in ds:
                for row in ds["PH"][0]["DM0"]:
                    # Convert timestamp (milliseconds) to datetime and hour
                    timestamp_ms = row["C"][0]  # Assuming first element is the timestamp
                    timestamp = datetime.fromtimestamp(timestamp_ms / 1000, tz=timezone.utc)  # Convert ms to seconds and make it timezone aware
                    date_time = timestamp.strftime('%Y-%m-%d %H:00:00')  # Format date and hour

                    # Append the formatted timestamp and other column values
                    values.append([date_time] + row["C"][1:])  # Keep only relevant columns

# Writing to CSV
with open(csv_path, "w", newline="") as f:
    writer = csv.writer(f)
    writer.writerow(columns)  # Write headers
    writer.writerows(values)  # Write data

print(f"CSV file saved as: {csv_path}")
