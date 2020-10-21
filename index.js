// Constants
const width = 1000;
const height = 600;

const padding = 50;
const paddingLeft = 100;

const svgWidth = width - padding;
const svgHeight = 500 - 2 * padding;

const baseTemp = 8.66;

// svg
const svg = d3.select('svg')
    .attr('width', width)
    .attr('height', height);

// xAxis
const xDomain = [1753 - 1, 2015];
const xAxisScale = d3.scaleLinear()
    .domain(xDomain)
    .range([paddingLeft, svgWidth]);

const xAxis = d3.axisBottom(xAxisScale)
    .tickFormat(d => String(d));

svg.append('g')
    .attr('id', 'x-axis')
    .attr('fill', '#37323E')
    .attr('transform', `translate(0, ${svgHeight + padding})`)
    .call(xAxis);

// yAxis
const yDomain = [
    'January', 'February', 'March', 'April', 
    'May', 'June', 'July', 'August', 
    'September', 'October', 'November', 'December'
];

const yAxisScale = d3.scaleBand()
    .domain(yDomain)
    .range([padding, svgHeight + padding]);

const yAxis = d3.axisLeft(yAxisScale);

svg.append('g')
    .attr('id', 'y-axis')
    .attr('fill', '#37323E')
    .attr('transform', `translate(${paddingLeft}, 0)`)
    .call(yAxis);

// legend
const colors = [
    "#3185FC", "#6DA9FC", "#ABCBF8", 
    "#CCE1FF", "#F2E8D5", "#E2BFD1", 
    "#F79CA3", "#F2727D", "#E84855"
];

const [minTemp, maxTemp] = [1.684, 13.888];
const tempArr = [];

for(let i = minTemp; i <= maxTemp; i += (maxTemp - minTemp) / 9){
    tempArr.push(i.toFixed(2));
}

const legend = svg.append('g')
    .attr('id', 'legend')
    .attr('height', 100)
    .attr('width', 500)
    .attr('transform', `translate(165, ${height - 100})`);

const colorBlocks = legend.selectAll('rect')
    .data(colors).enter().append('rect')
    .attr('fill', d => d)
    .attr('height', 40)
    .attr('width', 80)
    .attr('x', (d, i) => i * 80);

const colorText  = legend.selectAll('text')
    .data(tempArr).enter().append('text')
    .attr('x', (d , i) => i * 80 - 15)
    .attr('y', 65)
    .text(d => `${d}℃`);

console.log(colorBlocks)

// cells
const tempDomain = [1.684, 13.888];

const colorScale = d3.scaleQuantize()
    .domain(tempDomain)
    .range(colors);

async function cells(){
    const data = await fetch('https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json')
        .then(res => res.json())
        .then(res => res.monthlyVariance);
    
    const numYears = 2015 - 1753 + 2;
    const cellWidth = svgWidth / numYears;
    const cellHeight = svgHeight / 12;

    const cells = svg.selectAll('rect')
        .data(data, d => d).enter()
        .append('rect')
        .attr('class', 'cell')
        .attr('data-month', d => d.month - 1)
        .attr('data-year', d => d.year)
        .attr('data-temp', d => d.variance + baseTemp)
        .attr('width', cellWidth)
        .attr('height', cellHeight)
        .attr('x', d => xAxisScale(d.year) - cellWidth / 4)
        .attr('y', d => yAxisScale(yDomain[d.month - 1]))
        .attr('fill', d => colorScale(baseTemp + d.variance))
        .on('mouseover', function (e, d){
            const cell = d3.select(this);
            const height = 100;
            const width = 100;

            const xPosition = cell.attr('x') - width / 2;
            const yPosition =cell.attr('y') < 140 ? +cell.attr('y') + cellHeight + 15 : +cell.attr('y') - height - 15;

            const tooltip = svg.append('g')
                .attr('id', 'tooltip')
                .attr('data-year', cell.attr('data-year'))
                .attr('width', width)
                .attr('height', height)
                .attr('transform', `translate(${xPosition}, ${yPosition})`);

            const textWrapper = tooltip.append('rect')
                .attr('width', width)
                .attr('height', height)
                .attr('fill','#424B54')
                .attr('opacity', 0.8)
                .attr('rx', 20);
            
            const textYearMonth = tooltip.append('text')
                .attr('fill', 'white')
                .attr('y', height / 3)
                .attr('x', width / 2)
                .attr('text-anchor', 'middle')
                .text(`${d.year} - ${yDomain[d.month - 1]}`);

            const textTemp = tooltip.append('text')
                .attr('fill', 'white')
                .attr('y', height / 2)
                .attr('x', width / 2)
                .attr('text-anchor', 'middle')
                .text(`${Number(cell.attr('data-temp')).toFixed(1)}℃`);

            const textVariance = tooltip.append('text')
                .attr('fill', 'white')
                .attr('y', height / 3 * 2)
                .attr('x', width / 2)
                .attr('text-anchor', 'middle')
                .text(`${d.variance.toFixed(1)}℃`);
        })
        .on('mouseout', (e, i) => {
            d3.selectAll('#tooltip').remove();
        })
}

cells();