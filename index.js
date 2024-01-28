// * Size & Margins

let width = 1200;
let height = 1600;

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

		// * TOOLTIP
		let tooltip = d3
			.select("body")
			.data(root.leaves())
			.append("div")
			.attr("id", "tooltip");
		function handleMouseOver(event, d) {
			const attributeText = `${d3.select(this).attr("data-value")}`;
			const visibleText = `${d3.select(this).attr("data-name")} - ${d3
				.select(this)
				.attr("data-category")} - Value: ${d3
				.select(this)
				.attr("data-value")}`;
			const [x, y] = d3.pointer(event);
			tooltip
				.transition()
				.duration(100)
				.style("left", x + 0 + "px")
				.style("top", y + 0 + "px")
				.style("opacity", 0.8)
				.style("visibility", "visible")
				.attr("data-value", attributeText);
			return tooltip.html(`<p>${visibleText}</p>`);
		}
		function handleMouseOut() {
			tooltip.style("opacity", 0).style("visibility", "hidden");
		}

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
			})
			.on("mouseover", handleMouseOver)
			.on("mouseout", handleMouseOut);

		// ! TEXT: about 20 entries are missing for some reason.
		// ! Maybe start line breaking first, and see if they appear then?
		// ! use tspan

		svg.selectAll("vals")
			.data(root.leaves())
			.enter()
			.append("text")
			.attr("x", (d) => d.x0 + 5) // +10 to adjust position (more right)
			.attr("y", (d) => d.y0) // +20 to adjust position (lower)
			.text((d) => console.log(d.data.name.split(" ")))
			.attr("font-size", "10px")
			.attr("fill", "black")
			.each(function (d) {
				const words = d.data.name.split(/\s+/);
				const lineHeight = 10; // Adjust as needed
				d3.select(this)
					.selectAll("tspan")
					.data(words)
					.enter()
					.append("tspan")
					.attr(
						"x",
						(d) =>
							d3.select(this)._groups[0][0].x.animVal[0].value + 5
					)
					.attr("dy", lineHeight)
					.text((word) => word);
			});

		// * LEGEND
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
