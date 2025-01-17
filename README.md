# Vista Equity Partners Portfolio Analysis Dashboard

An interactive dashboard to explore and analyze Vista Equity Partners' investment portfolio.

## Features

- Summary statistics of the portfolio
- Interactive visualizations:
  - Portfolio distribution by fund type
  - Industry distribution
  - Investment timeline
  - Detailed portfolio company table
- Filtering capabilities:
  - By fund type
  - By industry
  - By investment status (Current/Former)

## Setup

1. Clone this repository
2. Open `index.html` in a modern web browser
3. No server setup required - the dashboard runs entirely in the browser

## Usage

### Filters

Use the dropdown filters at the top of the dashboard to:
- Filter by specific fund (Flagship, Foundation, Perennial, Endeavor)
- Filter by industry
- Filter by investment status (Current or Former investments)

### Visualizations

1. **Fund Distribution**: Donut chart showing the distribution of investments across different Vista funds
2. **Industry Distribution**: Bar chart showing the number of companies in each industry
3. **Investment Timeline**: Scatter plot showing when each investment was made
   - Current investments are shown in blue circles
   - Former investments (exits) are shown in gray diamonds
4. **Portfolio Table**: Detailed table with all portfolio companies and their key information

### Interactivity

- Hover over charts for detailed information
- Click on legend items to show/hide specific categories
- Sort the portfolio table by clicking on column headers
- Use the search box to find specific companies or information

## Data

The dashboard uses data from Vista Equity Partners' portfolio companies, including:
- Company names
- Investment status
- Industry classification
- Fund type
- Year of investment
- Company headquarters

## Browser Compatibility

The dashboard is compatible with modern web browsers:
- Chrome (recommended)
- Firefox
- Safari
- Edge

## Dependencies

- D3.js v7
- Plotly.js
- Bootstrap 5.1.3 