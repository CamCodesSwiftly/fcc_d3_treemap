// * Size & Margins

let width = 900;
let height = 600;

// * SVG CANVAS
var svg = d3
	.select("body")
	.append("svg")
	// .attr("width", width + margin.left + margin.right)
	// .attr("height", height + margin.top + margin.bottom)
	.attr("width", width)
	.attr("height", height)
	.attr("viewBox", [0, 0, width + 100, height + 100])
	.attr("style", "max-width: 100%; height: auto;");
// .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

fetch(
	"https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/movie-data.json"
)
	.then((response) => response.json())
	.then((data) => {
		// Handle data from the first JSON file
		console.log(data);
		// * Data Transfer to Cluster Layout
		let numberOfValues = 0;
		const root = d3.hierarchy(data).sum((d) => {
			return d.value;
		});
		console.log(root);
		console.log(d3.max(root.descendants(), (d) => d.value));

		// * Treemap Positioning
		d3
			.treemap()
			.size([width, height])
			.paddingTop(0)
			.paddingRight(0)
			.paddingInner(0)(root);
		// * Color scale
		const color = d3
			.scaleOrdinal()
			.domain([
				"Action",
				"Adventure",
				"Comedy",
				"Drama",
				"Animation",
				"Family",
				"Biography",
			])
			.range([
				"#add8e6",
				"#ffc0cb",
				"#ffb347",
				"#ffec8b",
				"#98fb98",
				"#ff6961",
				"#afeeee",
			]);
		// * Opacity Scale
		// const opacity = d3.scaleLinear().domain([10, 30]).range([0.5, 1]);

		// * Band AXES
		// const x = d3.scaleBand().range([0, width]);
		// const y = d3.scaleBand().range([height, 0]);

		// const x = d3.scaleBand(
		// 	["a", "b", "c", "d", "e", "f", "g", "h"],
		// 	[0, width]
		// );
		// const y = d3.scaleBand(
		// 	["a", "b", "c", "d", "e", "f", "g", "h"],
		// 	[height, 0]
		// );

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

		// TODO: Plotting with AXES
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
				console.log(d.data.value);
				return d.data.value;
			});

		// ? Console.log area
	})
	.catch((error) => {
		// Handle errors
		console.error("Error fetching JSON:", error);
	});
