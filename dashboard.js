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
function processData(filteredData = portfolioData) {
    // Fund distribution
    const fundCounts = {};
    filteredData.forEach(company => {
        const funds = company.fund.split(", ");
        funds.forEach(fund => {
            fundCounts[fund] = (fundCounts[fund] || 0) + 1;
        });
    });

    // Industry distribution
    const industryCounts = {};
    filteredData.forEach(company => {
        industryCounts[company.industry] = (industryCounts[company.industry] || 0) + 1;
    });

    // Summary statistics
    const summaryStats = {
        totalCompanies: filteredData.length,
        currentCompanies: filteredData.filter(c => c.status === 'Current').length,
        totalExits: filteredData.filter(c => c.status === 'Former').length,
        totalIndustries: new Set(filteredData.map(c => c.industry)).size
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
    const { fundCounts, industryCounts, summaryStats } = processData(filteredData);
    updateSummaryStats(summaryStats);

    // Fund distribution chart
    const fundData = {
        labels: Object.keys(fundCounts),
        values: Object.values(fundCounts),
        type: 'pie',
        hole: 0.4,
        marker: {
            colors: ['#003366', '#004d99', '#0066cc', '#1a8cff', '#4da6ff']
        },
        textinfo: 'label+value',
        hoverinfo: 'label+value+percent'
    };

    const fundLayout = {
        showlegend: true,
        legend: { orientation: 'h', y: -0.2 },
        margin: { t: 30, b: 0, l: 0, r: 0 },
        height: 350,
        title: {
            text: 'Portfolio by Fund',
            y: 0.95
        }
    };

    Plotly.newPlot('fundChart', [fundData], fundLayout);

    // Industry distribution chart
    const sortedIndustries = Object.entries(industryCounts)
        .sort((a, b) => b[1] - a[1]);

    const industryData = {
        x: sortedIndustries.map(item => item[1]),
        y: sortedIndustries.map(item => item[0]),
        type: 'bar',
        orientation: 'h',
        marker: {
            color: '#003366'
        },
        text: sortedIndustries.map(item => item[1]),
        textposition: 'auto',
    };

    const industryLayout = {
        margin: { t: 30, b: 50, l: 200, r: 20 },
        height: 350,
        xaxis: { title: 'Number of Companies' },
        yaxis: { automargin: true },
        title: {
            text: 'Industry Distribution',
            y: 0.95
        }
    };

    Plotly.newPlot('industryChart', [industryData], industryLayout);

    // Investment timeline
    const timelineData = filteredData
        .filter(company => company.yearOfInvestment)
        .sort((a, b) => {
            const yearDiff = a.yearOfInvestment - b.yearOfInvestment;
            if (yearDiff !== 0) return yearDiff;
            return a.company.localeCompare(b.company);
        });

    // Get unique funds and assign colors
    const uniqueFunds = [...new Set(timelineData.flatMap(d => d.fund.split(", ")))].sort();
    const fundColors = {
        'Flagship': '#003366',
        'Foundation': '#0066cc',
        'Perennial': '#4da6ff',
        'Endeavor': '#99ccff',
        // Add more colors as needed
    };

    // Create separate traces for each fund
    const traces = uniqueFunds.map(fund => {
        const fundCompanies = timelineData.filter(d => d.fund.includes(fund));

        // Calculate jittered positions for this fund's companies
        const yearGroups = {};
        fundCompanies.forEach(d => {
            if (!yearGroups[d.yearOfInvestment]) {
                yearGroups[d.yearOfInvestment] = [];
            }
            yearGroups[d.yearOfInvestment].push(d);
        });

        const jitteredX = [];
        const jitterAmount = 0.3;

        fundCompanies.forEach(d => {
            const yearGroup = yearGroups[d.yearOfInvestment];
            const index = yearGroup.indexOf(d);
            const offset = yearGroup.length === 1 ? 0 :
                (index - (yearGroup.length - 1) / 2) * (jitterAmount / (yearGroup.length - 1 || 1));
            jitteredX.push(Number(d.yearOfInvestment) + offset);
        });

        return {
            name: fund,
            x: jitteredX,
            y: fundCompanies.map(d => d.company),
            mode: 'markers+text',
            type: 'scatter',
            marker: {
                size: 14,
                color: fundColors[fund] || '#003366',
                symbol: fundCompanies.map(d => d.status === 'Current' ? 'circle' : 'diamond'),
                opacity: fundCompanies.map(d => d.status === 'Current' ? 1 : 0.6),
                line: {
                    color: 'white',
                    width: 1
                }
            },
            text: fundCompanies.map(d => d.yearOfInvestment.toString()),
            textposition: 'middle right',
            textfont: {
                size: 10,
                color: '#666'
            },
            hovertext: fundCompanies.map(d =>
                `<b>${d.company}</b><br>` +
                `Year: ${d.yearOfInvestment}<br>` +
                `Fund: ${d.fund}<br>` +
                `<b>Status: ${d.status}</b><br>` +
                `Industry: ${d.industry}`
            ),
            hoverinfo: 'text',
            showlegend: true
        };
    });

    const timelineLayout = {
        margin: { t: 30, b: 50, l: 200, r: 50 },
        height: Math.max(800, timelineData.length * 22),
        xaxis: {
            title: 'Year of Investment',
            tickmode: 'linear',
            dtick: 1,
            range: [
                Math.min(...timelineData.map(d => Number(d.yearOfInvestment))) - 0.5,
                Math.max(...timelineData.map(d => Number(d.yearOfInvestment))) + 0.5
            ]
        },
        yaxis: {
            automargin: true,
            tickfont: { size: 10 },
            gridwidth: 2
        },
        showlegend: true,
        legend: {
            x: 1.1,
            y: 1,
            title: {
                text: 'Funds',
                font: {
                    size: 14,
                    color: '#003366'
                }
            },
            bgcolor: 'rgba(255,255,255,0.9)',
            bordercolor: '#003366',
            borderwidth: 1
        },
        hoverlabel: {
            bgcolor: 'white',
            bordercolor: '#003366',
            font: { size: 12 }
        },
        annotations: [
            {
                x: 1.02,
                y: 0.45,
                xref: 'paper',
                yref: 'paper',
                text: '<b>Status:</b>',
                showarrow: false,
                font: {
                    size: 12,
                    color: '#003366'
                }
            },
            {
                x: 1.02,
                y: 0.42,
                xref: 'paper',
                yref: 'paper',
                text: '<span style="font-family: Arial;">●</span> Current Investment',
                showarrow: false,
                font: {
                    size: 12,
                    color: '#666'
                }
            },
            {
                x: 1.02,
                y: 0.39,
                xref: 'paper',
                yref: 'paper',
                text: '<span style="font-family: Arial;">◆</span> Former Investment',
                showarrow: false,
                font: {
                    size: 12,
                    color: '#666'
                }
            }
        ]
    };

    Plotly.newPlot('timelineChart', traces, timelineLayout);

    // Portfolio table
    const tableDiv = document.getElementById('portfolioTable');
    tableDiv.innerHTML = '';

    const table = document.createElement('table');
    table.id = 'portfolio-data-table';
    table.className = 'table table-striped table-hover';

    const thead = document.createElement('thead');
    thead.innerHTML = `
        <tr>
            <th>Company</th>
            <th>Status</th>
            <th>Industry</th>
            <th>Fund</th>
            <th>Year</th>
            <th>Headquarters</th>
        </tr>
    `;

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

    table.appendChild(thead);
    table.appendChild(tbody);
    tableDiv.appendChild(table);

    // Initialize DataTable with advanced features
    if ($.fn.DataTable.isDataTable('#portfolio-data-table')) {
        $('#portfolio-data-table').DataTable().destroy();
    }

    $('#portfolio-data-table').DataTable({
        dom: '<"row"<"col-sm-12 col-md-6"B><"col-sm-12 col-md-6"f>>rt<"row"<"col-sm-12 col-md-6"l><"col-sm-12 col-md-6"p>>',
        buttons: [
            {
                extend: 'collection',
                text: 'Export',
                buttons: [
                    'csv',
                    'excel'
                ]
            },
            {
                extend: 'collection',
                text: 'View Options',
                buttons: [
                    'colvis'
                ]
            }
        ],
        pageLength: 25,
        responsive: true,
        order: [[0, 'asc']],
        columnDefs: [
            {
                targets: 1, // Status column
                searchable: true,
                render: function (data, type, row) {
                    if (type === 'display') {
                        return data;
                    }
                    return $(data).text();
                }
            }
        ],
        initComplete: function () {
            // Add individual column searching
            this.api().columns().every(function () {
                let column = this;
                let title = column.header().textContent;

                // Create the select list and search operation for the column
                if (title === 'Status' || title === 'Industry' || title === 'Fund') {
                    let select = $('<select class="form-select form-select-sm"><option value="">All</option></select>')
                        .appendTo($(column.header()))
                        .on('change', function () {
                            let val = $.fn.dataTable.util.escapeRegex($(this).val());
                            column.search(val ? '^' + val + '$' : '', true, false).draw();
                        });

                    // Get unique values for the column
                    column.data().unique().sort().each(function (d, j) {
                        let text = $(d).text() || d;
                        select.append('<option value="' + text + '">' + text + '</option>');
                    });
                }
            });
        }
    });
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
    ['fundFilter', 'industryFilter', 'statusFilter'].forEach(id => {
        document.getElementById(id).addEventListener('change', updateVisualizations);
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
}

// Initialize dashboard
function initializeDashboard() {
    document.getElementById('dashboard-content').style.display = 'block';
    initializeFilters();
    createCharts();
}

// Start the dashboard
document.addEventListener('DOMContentLoaded', initializeDashboard); 