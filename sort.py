import json
import csv

# Load the JSON file
json_path = "output.json"  # Change this to your actual file path
csv_path = "output.csv"  # Output CSV file

with open(json_path, "r") as f:
    data = json.load(f)

# Extracting relevant sections
columns = ["Date_Time_Hour_Beginning"]  # Start with the timestamp column
values = []

# Extract column names from JSON structure
if "results" in data and len(data["results"]) > 0:
    result = data["results"][0]["result"]
    if "data" in result and "descriptor" in result["data"]:
        select_info = result["data"]["descriptor"]["Select"]
        all_columns = [col["Name"] for col in select_info[1:]]  # Skip first (timestamp)
        
        # Find index of the target column
        target_column = "Sum(Station_Build_Up.Thermal_Gen_Excl_Pumping_and_SCO)"
        if target_column in all_columns:
            target_index = all_columns.index(target_column) + 1  # Adjust for timestamp column
            columns.extend(all_columns[:target_index])
        else:
            columns.extend(all_columns)

    # Extracting actual data values
    if "dsr" in result["data"] and "DS" in result["data"]["dsr"]:
        ds = result["data"]["dsr"]["DS"][0]  # Access first dataset
        if "PH" in ds:
            for row in ds["PH"][0]["DM0"]:
                if target_index:
                    values.append(row["C"][:target_index + 1])  # Keep only relevant columns
                else:
                    values.append(row["C"])  # Extract values

# Writing to CSV
with open(csv_path, "w", newline="") as f:
    writer = csv.writer(f)
    writer.writerow(columns)  # Write headers
    writer.writerows(values)  # Write data

print(f"CSV file saved as: {csv_path}")
