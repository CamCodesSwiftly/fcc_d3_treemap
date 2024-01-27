// TODO: Size & Margins
let margin = { top: 10, right: 10, bottom: 10, left: 10 },
	width = 1100 - margin.left - margin.right,
	height = 890 - margin.top - margin.bottom;

// TODO: SVG CANVAS
var svg = d3
	.select("body")
	.append("svg")
	.attr("width", width + margin.left + margin.right)
	.attr("height", height + margin.top + margin.bottom)
	.append("g")
	.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

fetch(
	"https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/movie-data.json"
)
	.then((response) => response.json())
	.then((data) => {
		// Handle data from the first JSON file

		// * Data Transfer to Cluster Layout
		const root = d3.hierarchy(data).sum(function (d) {
			if (d.value) {
				// console.log(d.value);
				return d.value;
			}
			return;
		});
		// * Treemap Positioning
		d3
			.treemap()
			.size([width, height])
			.paddingTop(0)
			.paddingRight(3)
			.paddingInner(3)(root);
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

		// * Plotting
		svg.selectAll("rect")
			.data(root.leaves())
			.join("rect")
			.attr("value", (d) => d.value)
			.attr("x", (d) => d.x0)
			.attr("y", (d) => d.y0)
			.attr("width", (d) => d.x1 - d.x0)
			.attr("height", (d) => d.y1 - d.y0)
			.style("stroke", "black")
			.style("fill", (d) => color(d.parent.data.name));
		// .style("opacity", (d) => d.data.value);
		// !: Tooltips/Labels
		svg.selectAll("text")
			.data(root.leaves())
			.enter()
			.append("text")
			.attr("x", (d) => d.x0 + 5)
			.attr("y", (d) => d.y0 + 20)
			.text((d) => {
				return d.data.name.replace(" ", "");
			})
			.attr("font-size", "9px");
		// ? Console.log area
		console.log(data);
		// console.log(root);
	})
	.catch((error) => {
		// Handle errors
		console.error("Error fetching JSON:", error);
	});
