// Create canvas context
const canvas = d3.select("canvas");
const canvasWidth = canvas.node().getBoundingClientRect().width;
const canvasHeight = canvas.node().getBoundingClientRect().height;

const margin = 100;
const width = canvasWidth - 2 * margin;
const height = canvasHeight - 2 * margin;

// Canvas context
const context = canvas.node().getContext("2d");
context.canvas.width = canvasWidth;
context.canvas.height = canvasHeight;
context.translate(margin, margin);

// Create an in memory only element of type 'custom'
const detachedContainer = document.createElement("custom");
const dataContainer = d3.select(detachedContainer);

// Load data
d3.csv("../data/data.csv").then(data => handleData(data));

// Create node data from CSV file
function handleData(data) {
    
    window.data = data;
    const nestData = d3.nest()
        .key(d => d.groupid)
        .rollup(ds => { return d3.sum(ds, d => d.value); })
        .entries(data); 

    const nodeData = d3Survey.cluster(nestData)
        .size(width, height)
        .sum(d => parseFloat(d.value))
        .nodeData();

    const nodes = dataContainer.selectAll("circle").data(nodeData);
    nodes.enter()
        .append("circle")
        .attr("x", d => d.x)
        .attr("y", d => d.y)
        .style("fill", "black")
        .merge(nodes)
        .transition().duration(1000)
        .attr("r", d => d.r)
    nodes.exit().remove();   

    drawCanvas();
}

/*************************************************************************************************************
 * Event Handlers
 *************************************************************************************************************/
function handleInput(event) {

    let nClusters = event.value;
    
    // Group data by customer
    let groupData = d3.nest()
        .key(d => d.groupid)
        .rollup(ds => { return d3.sum(ds, d => d.value); })
        .entries(window.data);

    let nests = [];
    for(let i = 0; i < nClusters; i++) {
        nests.push(groupData.filter((d, index) => index % nClusters === i))
    }

    const nodeData = d3Survey.cluster(nests)
        .size(width, height)
        .sum(d => parseFloat(d.value))
        .nodeData();
    dataContainer.selectAll("circle").data(nodeData)
        .transition().duration(1000)
        .attr("x", d => d.x)
        .attr("y", d => d.y)
        .attr("r", d => d.r);
}

/*************************************************************************************************************
 * Draw Canvas
 *************************************************************************************************************/
function drawCanvas() {
    clearCanvas();
    drawCircles(dataContainer.selectAll("circle"));
    requestAnimationFrame(drawCanvas);
}


/*************************************************************************************************************
 * Canvas Functions
 *************************************************************************************************************/
function clearCanvas() {
    context.clearRect(0, 0, window.innerWidth, window.innerHeight);
}

function drawCircle(x, y, r, color="black") {
    context.beginPath();
    context.arc(x, y, r, 0, 2 * Math.PI);
    context.fillStyle = color;
    context.fill();
    context.closePath();
}

function drawCircles(nodes) {
    nodes.each(function() {
        let node = d3.select(this);
        drawCircle(node.attr('x'), node.attr("y"), node.attr("r"), node.style("fill"));
    })    
}


