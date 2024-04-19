// Load CSV data
d3.csv("netflix_data.csv").then(function(data) {
    // Convert release_year strings to numbers
    data.forEach(function(d) {
        d.release_year = +d.release_year;
    });


    var years = data.map(d => d.release_year);
    var uniqueYears = [...new Set(years)];

    // dropdown menu
    var select = d3.select("#year-select");

    select.selectAll("option")
        .data(uniqueYears)
        .enter()
        .append("option")
        .text(function(d) { return d; });

 
    createChart(data);

    select.on("change", function() {
        var selectedYear = this.value;
        var filteredData = data;

        if (selectedYear !== "All") {
            filteredData = data.filter(d => d.release_year == selectedYear);
        }

        createChart(filteredData);
    });
});

function createChart(data) {
 
    d3.select("#chart-container").selectAll("*").remove();

    var yearTypeCounts = d3.rollup(data, 
        v => d3.rollup(v, 
            v => v.length, 
            d => d.type
        ), 
        d => d.release_year
    );

    var pieData = Array.from(yearTypeCounts, ([year, typeCounts]) => {
        return { year, types: Array.from(typeCounts, ([type, count]) => ({ type, count })) };
    });

    pieData.sort((a, b) => a.year - b.year);

    pieData.forEach(function(d) {
        var margin = { top: 20, right: 20, bottom: 20, left: 20 };
        var width = 200 - margin.left - margin.right;
        var height = 200 - margin.top - margin.bottom;

        var svg = d3.select("#chart-container")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + (width / 2) + "," + (height / 2) + ")");

        var radius = Math.min(width, height) / 2;

        var color = d3.scaleOrdinal()
            .domain(d.types.map(t => t.type))
            .range(d3.schemeCategory10);

        var pie = d3.pie()
            .value(function(t) { return t.count; });

        var data_ready = pie(d.types);

        var arc = d3.arc()
            .innerRadius(0)
            .outerRadius(radius);

        svg.selectAll('whatever')
            .data(data_ready)
            .enter()
            .append('path')
            .attr('d', arc)
            .attr('fill', function(t){ return(color(t.data.type)) })
            .attr("stroke", "black")
            .style("stroke-width", "2px")
            .style("opacity", 0.7);

        // Add labels to slices
        svg.selectAll('whatever')
            .data(data_ready)
            .enter()
            .append('text')
            .text(function(t){ return t.data.type + ": " + t.data.count; })
            .attr('transform', function(t) { return 'translate(' + arc.centroid(t) + ')'; })
            .style('text-anchor', 'middle')
            .style('font-size', 10);
    });
}