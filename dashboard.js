// // Parse CSV data
// const portfolioData = [
//     // Sample data structure from CSV
//     {
//         company: "Accelya",
//         status: "Current",
//         industry: "Transportation",
//         headquarters: "Barcelona, Spain",
//         fund: "Perennial",
//         yearOfInvestment: "2019"
//     },
//     // ... more data will be added
// ];

// Process data for visualizations
function processData() {
    // Fund distribution
    const fundCounts = {};
    portfolioData.forEach(company => {
        const funds = company.fund.split(", ");
        funds.forEach(fund => {
            fundCounts[fund] = (fundCounts[fund] || 0) + 1;
        });
    });

    // Industry distribution
    const industryCounts = {};
    portfolioData.forEach(company => {
        industryCounts[company.industry] = (industryCounts[company.industry] || 0) + 1;
    });

    // Summary statistics
    const summaryStats = {
        totalCompanies: portfolioData.length,
        currentCompanies: portfolioData.filter(c => c.status === 'Current').length,
        totalExits: portfolioData.filter(c => c.status === 'Former').length,
        totalIndustries: new Set(portfolioData.map(c => c.industry)).size
    };

    return {
        fundCounts,
        industryCounts,
        summaryStats
    };
}

// Update summary statistics
function updateSummaryStats(stats) {
    document.getElementById('totalCompanies').textContent = stats.totalCompanies;
    document.getElementById('currentCompanies').textContent = stats.currentCompanies;
    document.getElementById('totalExits').textContent = stats.totalExits;
    document.getElementById('totalIndustries').textContent = stats.totalIndustries;
}

// Create visualizations
function createCharts(filteredData = portfolioData) {
    const data = processData();
    updateSummaryStats(data.summaryStats);

    // Fund distribution pie chart
    const fundData = {
        values: Object.values(data.fundCounts),
        labels: Object.keys(data.fundCounts),
        type: 'pie',
        hole: 0.4,
        marker: {
            colors: ['#003366', '#0066cc', '#3399ff', '#66b3ff', '#99ccff']
        },
        textinfo: 'label+percent',
        hoverinfo: 'label+value+percent'
    };

    const fundLayout = {
        showlegend: true,
        height: 400,
        margin: { t: 0, b: 0, l: 0, r: 0 }
    };

    Plotly.newPlot('fundChart', [fundData], fundLayout);

    // Industry distribution bar chart
    const sortedIndustries = Object.entries(data.industryCounts)
        .sort((a, b) => b[1] - a[1]);

    const industryData = {
        x: sortedIndustries.map(([industry]) => industry),
        y: sortedIndustries.map(([, count]) => count),
        type: 'bar',
        marker: {
            color: '#003366'
        }
    };

    const industryLayout = {
        height: 400,
        margin: { t: 0, b: 100, l: 50, r: 20 },
        xaxis: {
            tickangle: -45
        },
        yaxis: {
            title: 'Number of Companies'
        }
    };

    Plotly.newPlot('industryChart', [industryData], industryLayout);

    // Timeline visualization
    const timelineData = [{
        x: filteredData.map(c => c.yearOfInvestment),
        y: filteredData.map(c => c.company),
        type: 'scatter',
        mode: 'markers',
        marker: {
            size: 12,
            color: filteredData.map(c => c.status === 'Current' ? '#003366' : '#999999'),
            symbol: filteredData.map(c => c.status === 'Current' ? 'circle' : 'diamond')
        },
        text: filteredData.map(c => `${c.company}<br>Fund: ${c.fund}<br>Industry: ${c.industry}`),
        hoverinfo: 'text'
    }];

    const timelineLayout = {
        height: Math.max(400, filteredData.length * 25),
        margin: { t: 0, b: 50, l: 200, r: 20 },
        yaxis: {
            automargin: true,
            tickfont: { size: 10 }
        },
        xaxis: {
            title: 'Year of Investment'
        },
        showlegend: false
    };

    Plotly.newPlot('timelineChart', timelineData, timelineLayout);
}

// Create interactive table
function createPortfolioTable(filteredData = portfolioData) {
    const tableContainer = document.getElementById('portfolioTable');
    tableContainer.innerHTML = ''; // Clear existing table

    const table = document.createElement('table');
    table.className = 'table table-striped table-hover';

    // Create header
    const thead = document.createElement('thead');
    thead.innerHTML = `
        <tr>
            <th>Company</th>
            <th>Status</th>
            <th>Industry</th>
            <th>Fund</th>
            <th>Year of Investment</th>
            <th>Headquarters</th>
        </tr>
    `;
    table.appendChild(thead);

    // Create body
    const tbody = document.createElement('tbody');
    filteredData.forEach(company => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${company.company}</td>
            <td><span class="badge ${company.status === 'Current' ? 'bg-success' : 'bg-secondary'}">${company.status}</span></td>
            <td>${company.industry}</td>
            <td>${company.fund}</td>
            <td>${company.yearOfInvestment}</td>
            <td>${company.headquarters}</td>
        `;
        tbody.appendChild(row);
    });
    table.appendChild(tbody);

    tableContainer.appendChild(table);
}

// Initialize filters
function initializeFilters() {
    const funds = new Set();
    const industries = new Set();

    portfolioData.forEach(company => {
        company.fund.split(", ").forEach(fund => funds.add(fund));
        industries.add(company.industry);
    });

    const fundFilter = document.getElementById('fundFilter');
    const industryFilter = document.getElementById('industryFilter');

    [...funds].sort().forEach(fund => {
        const option = document.createElement('option');
        option.value = fund;
        option.textContent = fund;
        fundFilter.appendChild(option);
    });

    [...industries].sort().forEach(industry => {
        const option = document.createElement('option');
        option.value = industry;
        option.textContent = industry;
        industryFilter.appendChild(option);
    });

    // Add filter event listeners
    [fundFilter, industryFilter, document.getElementById('statusFilter')].forEach(filter => {
        filter.addEventListener('change', updateVisualizations);
    });
}

// Update visualizations based on filters
function updateVisualizations() {
    const selectedFund = document.getElementById('fundFilter').value;
    const selectedIndustry = document.getElementById('industryFilter').value;
    const selectedStatus = document.getElementById('statusFilter').value;

    const filteredData = portfolioData.filter(company => {
        const fundMatch = selectedFund === 'all' || company.fund.includes(selectedFund);
        const industryMatch = selectedIndustry === 'all' || company.industry === selectedIndustry;
        const statusMatch = selectedStatus === 'all' || company.status === selectedStatus;
        return fundMatch && industryMatch && statusMatch;
    });

    createCharts(filteredData);
    createPortfolioTable(filteredData);
}

// Initialize dashboard
function initializeDashboard() {
    document.getElementById('dashboard-content').style.display = 'block';
    initializeFilters();
    createCharts();
    createPortfolioTable();
}

// Start the dashboard
document.addEventListener('DOMContentLoaded', initializeDashboard); 