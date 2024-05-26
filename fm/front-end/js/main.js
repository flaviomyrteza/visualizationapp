document.addEventListener("DOMContentLoaded", function() {
    let plotType = "M01WINDSPEED";
    let apiData = []; // Global variable to hold API data

    function initRadioButtons() {
        const radioButtons = document.querySelectorAll("#plot-selection-form input[type='radio']");
        radioButtons.forEach(radio => {
            radio.addEventListener("change", function(event) {
                plotType = event.target.value;
                clearPlot();
                plotData(plotType);
            });
        });
    }

    function clearPlot() {
        document.getElementById("container").innerHTML = ""; // Clears the plot
    }

    function plotData(column) {
        const margin = { top: 30, right: 30, bottom: 60, left: 60 },
              width = 460 - margin.left - margin.right,
              height = 400 - margin.top - margin.bottom;

        const svg = d3.select("#container")
            .append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
            .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        const url = `http://localhost/fm/back-end/api.php?station=m_anogia_monthly&column[]=${encodeURIComponent(column)}`;

        d3.json(url).then(data => {
            if (!data || data.length === 0) {
                console.error("No data returned from the API");
                return;
            }

            // Assign fetched data to global apiData variable
            apiData = data;

            // Parse dates
            const parseDate = d3.timeParse("%Y-%m-%d");
            data.forEach(d => {
                d.Date = parseDate(d.Date);
                d[column] = (d[column] === "*") ? "No Data" : +d[column]; // Replace * with "No Data"
            });

            // Define scales
            const x = d3.scaleTime()
                .domain(d3.extent(data, d => d.Date))
                .range([0, width]);

            const y = d3.scaleLinear()
                .domain([0, d3.max(data, d => d[column])])
                .range([height, 0]);

            // Add x-axis
            svg.append("g")
                .attr("transform", "translate(0," + height + ")")
                .call(d3.axisBottom(x))
                .append("text")
                .attr("x", width / 2)
                .attr("y", 40)
                .attr("fill", "#000")
                .attr("text-anchor", "middle")
                .text("Date");

            // Add y-axis
            svg.append("g")
                .call(d3.axisLeft(y))
                .append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", -50)
                .attr("x", -height / 2)
                .attr("dy", "0.71em")
                .attr("fill", "#000")
                .attr("text-anchor", "middle")
                .text(column);

            // Draw the line
            svg.append("path")
                .datum(data.filter(d => d[column] !== "No Data")) // Filter out "No Data" values
                .attr("fill", "none")
                .attr("stroke", "#da4040")
                .attr("stroke-width", 1.5)
                .attr("d", d3.line()
                    .x(d => x(d.Date))
                    .y(d => y(d[column]))
                );

            // Add tooltips
            const tooltip = d3.select("body").append("div")
                .attr("class", "tooltip")
                .style("opacity", 0);

            svg.selectAll("circle")
                .data(data)
                .enter().append("circle")
                .attr("cx", d => x(d.Date))
                .attr("cy", d => y(d[column]))
                .attr("r", 4)
                .style("fill", "steelblue")
                .on("mouseover", function(d) {
                    tooltip.transition()
                        .duration(200)
                        .style("opacity", .9);
                    tooltip.html(`Date: ${d.Date.toDateString()}<br/>${column}: ${d[column]}`)
                        .style("left", (d3.event.pageX) + "px")
                        .style("top", (d3.event.pageY - 28) + "px");
                })
                .on("mouseout", function(d) {
                    tooltip.transition()
                        .duration(500)
                        .style("opacity", 0);
                });

            // Add animations
            svg.selectAll("path")
                .transition()
                .duration(1000)
                .attr("stroke-dasharray", function() {
                    const totalLength = this.getTotalLength();
                    return totalLength + " " + totalLength;
                })
                .attr("stroke-dashoffset", function() {
                    return this.getTotalLength();
                })
                .transition()
                .duration(1000)
                .attr("stroke-dashoffset", 0);

            // Update data table
            updateDataTable(data);
        }).catch(error => {
            console.error("Error loading data: ", error);
        });
    }

    function updateDataTable(data) {
        const dataTableBody = document.getElementById("data-table-body");
        dataTableBody.innerHTML = "";
        data.forEach(d => {
            const row = document.createElement("tr");
            const dateCell = document.createElement("td");
            dateCell.textContent = d.Date.toDateString();
            row.appendChild(dateCell);
            const valueCell = document.createElement("td");
            valueCell.textContent = (d[plotType] === "No Data") ? "No Data" : d[plotType];
            row.appendChild(valueCell);
            dataTableBody.appendChild(row);
        });
        // Show the data table
        document.getElementById("data-table").classList.remove("is-hidden");
    }

    function convertToCsv(data) {
        // Replace "*" with "No Data"
        const cleanedData = data.map(row => {
            const cleanedRow = { ...row };
            Object.keys(cleanedRow).forEach(key => {
                if (cleanedRow[key] === "*") {
                    cleanedRow[key] = "No Data";
                }
            });
            return cleanedRow;
        });

        // Convert data to CSV format
        const csvContent = "data:text/csv;charset=utf-8," 
            + cleanedData.map(row => Object.values(row).join(",")).join("\n");
        
        // Create a download link and initiate the download
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "data.csv");
        document.body.appendChild(link);
        link.click();
    }

    function convertToExcel(data) {
        // Replace "*" with "No Data"
        const cleanedData = data.map(row => {
            const cleanedRow = { ...row };
            Object.keys(cleanedRow).forEach(key => {
                if (cleanedRow[key] === "*") {
                    cleanedRow[key] = "No Data";
                }
            });
            return cleanedRow;
        });

        // Convert data to CSV format
        const csvContent = cleanedData.map(row => Object.values(row).join(",")).join("\n");

        // Convert CSV to Base64 for Excel format
        const b64Data = btoa(csvContent);

        // Create a download link and initiate the download
        const link = document.createElement("a");
        link.setAttribute("href", "data:application/vnd.ms-excel;base64," + b64Data);
        link.setAttribute("download", "data.xls");
        document.body.appendChild(link);
        link.click();
    }

    // Event listeners for exporting data
    document.getElementById("export-csv-btn").addEventListener("click", function() {
        convertToCsv(apiData);
    });

    document.getElementById("export-excel-btn").addEventListener("click", function() {
        convertToExcel(apiData);
    });

    initRadioButtons();
    plotData(plotType);
});
