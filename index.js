// * Size & Margins

let width = 900;
let height = 600;

// * SVG CANVAS
var svg = d3
	.select("body")
	.append("svg")
	.attr("width", width)
	.attr("height", height)
	.attr("viewBox", [0, 0, width + 100, height + 100])
	.attr("style", "max-width: 100%; height: auto;");

fetch(
	"https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/movie-data.json"
)
	.then((response) => response.json())
	.then((data) => {
		// Handle data from the first JSON file
		// * Data Transfer to Cluster Layout
		const root = d3.hierarchy(data).sum((d) => {
			return d.value;
		});

		// * Treemap Positioning
		d3
			.treemap()
			.size([width, height])
			.paddingTop(0)
			.paddingRight(0)
			.paddingInner(0)(root);
		// * Color scale
		const categories = [
			"Action",
			"Adventure",
			"Comedy",
			"Drama",
			"Animation",
			"Family",
			"Biography",
		];
		const color = d3
			.scaleOrdinal()
			.domain(categories)
			.range([
				"#add8e6",
				"#ffc0cb",
				"#ffb347",
				"#ffec8b",
				"#98fb98",
				"#ff6961",
				"#afeeee",
			]);

		// * Linear AXES
		const xScale = d3
			.scaleLinear()
			.domain([0, width]) // Input data domain
			.range([0, width]); // Output range (width of the SVG)

		svg.append("g")
			.attr("transform", `translate(0,${height})`)
			.call(d3.axisBottom(xScale));

		const yScale = d3
			.scaleLinear()
			.domain([0, height]) // Input data domain
			.range([height, 0]); // Output range (width of the SVG)

		svg.append("g")
			.attr("transform", `translate(0,0)`)
			.call(d3.axisLeft(yScale));

		// * PLOT
		svg.selectAll("rect")
			.data(root.leaves())
			.join("rect")
			.attr("x", (d) => d.x0)
			.attr("y", (d) => d.y0)
			.attr("width", (d) => d.x1 - d.x0)
			.attr("height", (d) => d.y1 - d.y0)
			.style("stroke", "black")
			.style("fill", (d) => {
				return color(d.parent.data.name);
			})
			.attr("class", "tile")
			.text((d) => d.data)
			.attr("data-name", (d) => d.data.name)
			.attr("data-category", (d) => d.data.category)
			.attr("data-value", (d) => {
				return d.data.value;
			});

		// LEGEND
		const legendWidth = 800;
		const legendHeight = 50;

		const legendSvg = d3
			.select("body")
			.append("svg")
			.attr("width", legendWidth)
			.attr("height", legendHeight)
			.attr("id", "legend");

		const legendItems = legendSvg
			.selectAll("legendDots")
			.data(categories)
			.enter()
			.append("g")
			.attr("transform", (d, i) => `translate(${i * 100}, 0)`); // Adjust the spacing between legend items

		legendItems
			.append("rect")
            .attr("class", "legend-item")
			.attr("width", 20) // Adjust the width of each legend item
			.attr("height", 20)
			.style("fill", (d) => color(d));

		legendItems
			.append("text")
			.attr("x", 25) // Adjust the distance between rect and text
			.attr("y", 15)
			.text((d) => d)
			.attr("font-size", "10px");
		// ? Console.log area
	})
	.catch((error) => {
		// Handle errors
		console.error("Error fetching JSON:", error);
	});
