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
			if (d.value) {
				numberOfValues = numberOfValues + 1;
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

		// TODO: AXES
		// const x = d3.scaleBand().range([0, width]);
		// const y = d3.scaleBand().range([height, 0]);

		const x = d3.scaleBand(["a", "b", "c", "d", "e", "f", "g", "h"], [0, width]);
		const y = d3.scaleBand(["a", "b", "c", "d", "e", "f", "g", "h"], [height, 0]);
		svg.append("g")
			.attr("transform", `translate(0,${height})`)
			.call(d3.axisBottom(x));
		svg.append("g")
			.attr("transform", `translate(0, 0)`)
			.call(d3.axisLeft(y));

		// TODO: Plotting with AXES
		let numberOfFills = 0;
		svg.selectAll("rect")
			.data(root.leaves())
			.join("rect")
			.attr("value", (d) => d.value)
			.attr("x", (d) => d.x0)
			.attr("y", (d) => d.y0)
			.attr("width", (d) => d.x1 - d.x0)
			.attr("height", (d) => d.y1 - d.y0)
			.style("stroke", "black")
			.style("fill", (d) => {
				numberOfFills = numberOfFills + 1;
				return color(d.parent.data.name);
			});
		// // * Plotting
		// svg.selectAll("rect")
		// 	.data(root.leaves())
		// 	.join("rect")
		// 	.attr("value", (d) => d.value)
		// 	.attr("x", (d) => d.x0)
		// 	.attr("y", (d) => d.y0)
		// 	.attr("width", (d) => d.x1 - d.x0)
		// 	.attr("height", (d) => d.y1 - d.y0)
		// 	.style("stroke", "black")
		// 	.style("fill", (d) => color(d.parent.data.name));
		// .style("opacity", (d) => d.data.value);
		// !: Tooltips/Labels
		let numberOfTexts = 0;
		svg.selectAll("text")
			.data(root.leaves())
			.enter()
			.append("text")
			.attr("x", (d) => d.x0 + 3)
			.attr("y", (d) => d.y0 + 15)
			.text((d) => {
				// console.log(d)
				numberOfTexts = numberOfTexts + 1;
				return d.data.name;
			})
			.attr("font-size", "9px");
		// ? Console.log area

		console.log(root);
		console.log(numberOfValues);
		console.log(numberOfFills);
		console.log(numberOfTexts);
	})
	.catch((error) => {
		// Handle errors
		console.error("Error fetching JSON:", error);
	});
