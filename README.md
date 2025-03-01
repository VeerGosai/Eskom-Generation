# Eskom Energy Plotter

https://veergosai.github.io/Eskom-Generation/

## Overview

Eskom Energy Plotter is a web application that allows users to visualize various energy generation data. The app loads data from a CSV file containing information on energy generation types and displays it on a dynamic chart. Users can select specific energy types and time periods to visualize different data trends.

## Features
- Load energy generation data from a CSV file.
- Plot energy generation data using Chart.js.
- Interactive dropdown to select different energy series to display.
- Customizable date ranges for chart plotting.

## GitHub Action: Get Eskom Energy Data
This GitHub Action is designed to retrieve Eskom energy data, process it, and store the results in a CSV file, which is then pushed back to the repository. The workflow is triggered either on a scheduled basis or manually via the `workflow_dispatch` event.
https://www.eskom.co.za/dataportal/

- After running this GitHub Action:
  - `output.json` is generated from the `get-data.js` script and uploaded as an artifact.
  - `output.csv`, a processed version of the JSON data, is created by `sort.py` and pushed to the repository.

This ensures that the Eskom energy data is regularly updated in the repository in both JSON and CSV formats.

