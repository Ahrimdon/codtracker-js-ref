# COD Tracker

A lightweight Node.js application to track and display Call of Duty stats across multiple game titles.

## Overview

COD Tracker provides a clean interface to fetch, display, and export Call of Duty player statistics. The application supports multiple COD titles including Modern Warfare, Warzone, Modern Warfare 2, Warzone 2, Modern Warfare 3, Cold War, Vanguard, and Warzone Mobile.

## Features

- Player stats lookup across all supported COD titles
- Match history retrieval
- Individual match details
- User profile information
- Player search functionality
- Export data as JSON or YAML
- Time format conversion options
- Duration display for time-based statistics

## Prerequisites

- [Node.js](https://nodejs.org/) (v14.x or higher)
- npm (comes with Node.js)
- Call of Duty account with API security settings set to "Open"

## Authentication Setup

1. Log in to [Call of Duty](https://profile.callofduty.com)
2. Open developer tools (F12)
3. Navigate to: Application → Storage → Cookies → https://www.callofduty.com/
4. Copy the value of `ACT_SSO_COOKIE`
5. Provide this value when prompted by the tool

## Installation

1. Clone the repository:
   ```bash
   git clone https://git.rimmyscorner.com/Rim/codtracker-js.git && cd codtracker-js
   ```

2. Start the application:
   ```bash
   node app.js
   ```

3. Open your browser and navigate to:
   ```
   http://127.0.0.1:3513
   ```

## Usage

1. Enter your Call of Duty SSO Token in the token field (required for authentication)
2. Select the desired game, platform, and enter a username
3. Use the tabs to navigate between different types of information:
   - **Stats**: View player lifetime statistics
   - **Matches**: Retrieve recent match history
   - **Match Info**: Look up details for a specific match ID
   - **User**: Access player profile information
   - **Search**: Find players by username

## Configuration Options

- **Sanitize**: Remove HTML tags and other unwanted content from results
- **Replace Keys**: Convert internal key names to more readable formats and time durations
- **Convert Times**: Transform epoch timestamps to readable date/time format
- **Output Format**: Select between JSON and YAML for data display and export
