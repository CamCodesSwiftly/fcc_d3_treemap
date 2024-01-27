// TODO: Size & Margins
let margin = { top: 10, right: 10, bottom: 10, left: 10 },
	width = 750 - margin.left - margin.right,
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
		console.log(data);

		// TODO: Data Transfer to Cluster Layout
		// TODO: Treemap Positioning
		// TODO: Plotting
		// TODO: Tooltips/Labels
	})
	.catch((error) => {
		// Handle errors
		console.error("Error fetching JSON:", error);
	});
