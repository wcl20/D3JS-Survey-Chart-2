var d3Survey = (function (exports, d3) {
    'use strict';

    function cluster(nestData) {
        return new Cluster(nestData);
    }

    class Cluster {
        /*
         * Class constructor for Cluster.
         *
         * Creates one or morecircular packing layout using D3-Hierarchy (Pack) 
         * from the given D3-Nest (D3-Collection) or list of D3-Nest.
         * 
         * @class
         * 
         * @param   {Array}    nestData    1D array created by D3-Nest / 
         *                                 2D Array where each element is created by D3-Nests.
         */
        constructor(nestData) {
            // Wrap array if input if 1D array
            this.nestData = nestData[0].constructor == Array ? nestData : [nestData];
            this.nClusters = this.nestData.length;
            this.nRows = Math.floor(Math.sqrt(this.nClusters));
            this.nCols = Math.ceil(this.nClusters / this.nRows);

            // Default sum function: every circle has same size
            this.sumFunc = function(d) { return 1; }
        }

        /*
         * Sets the size of the area to put the clusters.
         *
         * @param   {Float}    width    Width of cluster layout.
         * @param   {Float}    height   Height of cluster layout.
         */
        size(width, height) {
            this.width = width;
            this.height = height;
            return this;
        }

        /*
         * Sets the sum Function of the circular packing.
         *
         * The sum Function is used to get the property from object
         * that determines the size of each circle.
         * 
         * @param   {Function}    sumFunc    function to access attribute from object.
         */ 
        sum(sumFunc) {
            this.sumFunc = sumFunc;
            return this;
        }

        /*
         * Creates a circular packing for each D3 Nests data. Circular packings
         * are positioned in a rectangular layout on the screen.
         * 
         * Calculate objects x, y and r attributes based on size and 
         * number of clusters to put on the screen.
         * 
         * @see     _getCenters().   
         * 
         * @return  {Array}    An array of objects with calculated x, y, and r attribute.
         */
        nodeData() {
            console.assert(this.width !== undefined, { message: "Missing width in Cluster"});
            console.assert(this.height !== undefined, { message: "Missing height in Cluster"});

            const centers = this._getCenters();
            let nodeData = [];
            for(let i = 0; i < this.nClusters; i++) {
                let pack = new Pack(this.nestData[i])
                    .size(this.width / this.nCols, this.height / this.nRows)
                    .center(centers[i].x, centers[i].y)
                    .sum(this.sumFunc)
                    .nodeData();

                nodeData = nodeData.concat(pack);
            }
    
            return nodeData.filter(node => node.parent);
        }

        /*
         * Calculate the center coordinates for each circular Packing.
         *
         * Calculates the center coordinates such that the clusters are 
         * positioned on the screen in a rectangular layout.
         * 
         * @access  private
         * 
         * @return  {Array} An array of center coordinates. 
         */
        _getCenters() {

            // Calculate the center coordinates for rows and columns
            let centerXs = [], centerYs = [];
            for(let i = 1, step = 0; step < Math.max(this.nRows, this.nCols); i += 2, step++) {
                centerXs.push(this.width * i / (this.nCols * 2));
                centerYs.push(this.height * i / (this.nRows * 2));
            }

            // Get coordinate of centers starting from top left position, 
            // Then traversing from left to right, top to bottom.
            let centers = [], i = 0;
            loop:
            for(let y = 0; y < this.nRows; y++) {
                for(let x = 0; x < this.nCols; x++) {
                    if(i === this.nClusters) break loop;
                    centers.push({ x: centerXs[x], y: centerYs[y] });
                    i++;
                }
            }

            return centers;
        }
    }

    class Pack {
        /*
         * Class constructor for Pack.
         *
         * Creates a circular packing layout using D3-Hierarchy (Pack) from
         * the given D3-Nest (D3-Collection).
         * 
         * @class
         * 
         * @param   {Array}    nestData     Array created by D3-Nests.   
         */
        constructor(nestData) {
            this.nestData = nestData;
            this.x = 0;
            this.y = 0;
        }

        /*
         * Sets the size of the circular packing.
         *
         * @param   {Float}    width    Width of circular packing layout.
         * @param   {Float}    height   Height of circular packing layout.
         */
        size(width, height) {
            this.width = width;
            this.height = height;
            return this;
        }

        /*
         * Sets the center of the circular packing.
         *
         * @param   {Float}    x    x coordinates of center of circular packing layout.
         * @param   {Float}    y    y coordinates of center of circular packing layout. 
         */ 
        center(x, y) {
            this.x = x;
            this.y = y;
            return this;
        }

        /*
         * Sets the sum Function of the circular packing.
         *
         * The sum Function is used to get the property from object
         * that determines the size of each circle.
         * 
         * @param   {Function}    sumFunc    function to access attribute from object.
         */ 
        sum(sumFunc) {
            this.sumFunc = sumFunc;
            return this;
        }

        /*
         * Calculate objects x, y and r attributes based on size and 
         * center position.
         * 
         * @return  {Array}    An array of objects with calculated x, y and r attribute 
         */
        nodeData() {
            // Create circular packing with size
            console.assert(this.width !== undefined, { message: "Missing width in Pack"})
            console.assert(this.height !== undefined, { message: "Missing height in Pack"})
            const pack = d3.pack().size([this.width, this.height]);

            // Create hierarchy using sum Function
            console.assert(this.sumFunc !== undefined, { message: "Missing sum function in Pack" })
            const hierarchy = d3.hierarchy({ key: "root", values: this.nestData}, function children(d) { return d.values; })
                .sum(this.sumFunc);  
            
            const nodeData = pack(hierarchy).descendants();

            // Center circular pack at position (x, y) 
            nodeData.forEach(node => { 
                node.x += this.x - this.width * 0.5;
                node.y += this.y - this.height * 0.5;
            });
            
            return nodeData;
        }   
    }


    exports.cluster = cluster;

    return exports;

}({}, d3));
