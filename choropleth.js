// Copyright 2021, Observable Inc.
// Released under the ISC license.
// https://observablehq.com/@d3/color-legend
function Legend(
	color,
	{
		title,
		tickSize = 6,
		width = 320,
		height = 44 + tickSize,
		marginTop = 18,
		marginRight = 0,
		marginBottom = 16 + tickSize,
		marginLeft = 0,
		ticks = width / 64,
		tickFormat,
		tickValues,
	} = {}
) {
	function ramp(color, n = 256) {
		const canvas = document.createElement("canvas");
		canvas.width = n;
		canvas.height = 1;
		const context = canvas.getContext("2d");
		for (let i = 0; i < n; ++i) {
			context.fillStyle = color(i / (n - 1));
			context.fillRect(i, 0, 1, 1);
		}
		return canvas;
	}

	const svg = d3
		.create("svg")
		.attr("width", width)
		.attr("height", height)
		.attr("viewBox", [0, 0, width, height])
		.style("overflow", "visible")
		.style("display", "block");

	let tickAdjust = (g) =>
		g.selectAll(".tick line").attr("y1", marginTop + marginBottom - height);
	let x;

	// Continuous
	if (color.interpolate) {
		const n = Math.min(color.domain().length, color.range().length);

		x = color
			.copy()
			.rangeRound(
				d3.quantize(d3.interpolate(marginLeft, width - marginRight), n)
			);

		svg.append("image")
			.attr("x", marginLeft)
			.attr("y", marginTop)
			.attr("width", width - marginLeft - marginRight)
			.attr("height", height - marginTop - marginBottom)
			.attr("preserveAspectRatio", "none")
			.attr(
				"xlink:href",
				ramp(
					color.copy().domain(d3.quantize(d3.interpolate(0, 1), n))
				).toDataURL()
			);
	}

	// Sequential
	else if (color.interpolator) {
		x = Object.assign(
			color
				.copy()
				.interpolator(
					d3.interpolateRound(marginLeft, width - marginRight)
				),
			{
				range() {
					return [marginLeft, width - marginRight];
				},
			}
		);

		svg.append("image")
			.attr("x", marginLeft)
			.attr("y", marginTop)
			.attr("width", width - marginLeft - marginRight)
			.attr("height", height - marginTop - marginBottom)
			.attr("preserveAspectRatio", "none")
			.attr("xlink:href", ramp(color.interpolator()).toDataURL());

		// scaleSequentialQuantile doesn’t implement ticks or tickFormat.
		if (!x.ticks) {
			if (tickValues === undefined) {
				const n = Math.round(ticks + 1);
				tickValues = d3
					.range(n)
					.map((i) => d3.quantile(color.domain(), i / (n - 1)));
			}
			if (typeof tickFormat !== "function") {
				tickFormat = d3.format(
					tickFormat === undefined ? ",f" : tickFormat
				);
			}
		}
	}

	// Threshold
	else if (color.invertExtent) {
		const thresholds = color.thresholds
			? color.thresholds() // scaleQuantize
			: color.quantiles
			? color.quantiles() // scaleQuantile
			: color.domain(); // scaleThreshold

		const thresholdFormat =
			tickFormat === undefined
				? (d) => d
				: typeof tickFormat === "string"
				? d3.format(tickFormat)
				: tickFormat;

		x = d3
			.scaleLinear()
			.domain([-1, color.range().length - 1])
			.rangeRound([marginLeft, width - marginRight]);

		svg.append("g")
			.selectAll("rect")
			.data(color.range())
			.join("rect")
			.attr("x", (d, i) => x(i - 1))
			.attr("y", marginTop)
			.attr("width", (d, i) => x(i) - x(i - 1))
			.attr("height", height - marginTop - marginBottom)
			.attr("fill", (d) => d);

		tickValues = d3.range(thresholds.length);
		tickFormat = (i) => thresholdFormat(thresholds[i], i);
	}

	// Ordinal
	else {
		x = d3
			.scaleBand()
			.domain(color.domain())
			.rangeRound([marginLeft, width - marginRight]);

		svg.append("g")
			.selectAll("rect")
			.data(color.domain())
			.join("rect")
			.attr("x", x)
			.attr("y", marginTop)
			.attr("width", Math.max(0, x.bandwidth() - 1))
			.attr("height", height - marginTop - marginBottom)
			.attr("fill", color);

		tickAdjust = () => {};
	}

	svg.append("g")
		.attr("transform", `translate(0,${height - marginBottom})`)
		// .attr("id", "legend")
		.call(
			d3
				.axisBottom(x)
				.ticks(
					ticks,
					typeof tickFormat === "string" ? tickFormat : undefined
				)
				.tickFormat(
					typeof tickFormat === "function" ? tickFormat : undefined
				)
				.tickSize(tickSize)
				.tickValues(tickValues)
		)
		.call(tickAdjust)
		.call((g) => g.select(".domain").remove())
		.call((g) =>
			g
				.append("text")
				.attr("x", marginLeft)
				.attr("y", marginTop + marginBottom - height - 6)
				.attr("fill", "currentColor")
				.attr("text-anchor", "start")
				.attr("font-weight", "bold")
				.attr("class", "title")
				.text(title)
		);

	return svg.node();
}

// * BASIC SETUP
const body = document.querySelector("body");
let educationData = [];

fetch(
	"https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json"
)
	.then((response) => response.json())
	.then((fetchedEducationData) => {
		// Handle data from the first JSON file
		educationData = fetchedEducationData.slice();

		// Fetch the second JSON file
		return fetch(
			"https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json"
		);
	})
	.then((response) => response.json())
	.then((usTJSON) => {
		// * DATA HANDLING
		// TOPOJSON DATA
		const countiesTJSON = usTJSON.objects.counties;
		const statesTJSON = usTJSON.objects.states;
		const nationTJSON = usTJSON.objects.nation;

		// CONVERT TO GEOJSON DATA
		let countiesGJSON = topojson.feature(usTJSON, countiesTJSON).features;
		const statesGJSON = topojson.feature(usTJSON, statesTJSON);
		const nationGJSON = topojson.feature(usTJSON, nationTJSON).features[0];

		// Merge ALL Education Data with County Data
		for (const countyElement of countiesGJSON) {
			//Find corresponding edu object
			const correspondingElement = educationData.find(
				(educationElement) => educationElement.fips == countyElement.id
			);
			//Merge
			countyElement.properties = correspondingElement;
		}

		// * PLOTTING
		// This link will lead to the solution:
		// https://observablehq.com/@d3/choropleth/2?intent=fork
		// * SETUP
		const color = d3.scaleQuantize([3, 66], d3.schemeBlues[7]);
		const path = d3.geoPath();
		const format = (d) => `${d}%`;
		const valuemap = new Map(
			educationData.map((d) => [d.fips, d.bachelorsOrHigher])
		);

		// * CREATE SVG
		const svg = d3
			.select("body")
			.append("svg")
			.attr("width", 975)
			.attr("height", 610)
			.attr("viewBox", [0, 0, 975, 610])
			.attr("style", "max-width: 100%; height: auto;");

		// * Legend
		svg.append("g")
			.attr("transform", "translate(610,20)")
			.attr("id", "legend")
			.append(() =>
				Legend(color, { title: "Education rate (%)", width: 260 })
			);

		// TODO: Tooltips
		// * TOOLTIP
		let tooltip = d3
			.select("body")
			.data(countiesGJSON)
			.append("div")
			.attr("id", "tooltip");
		function handleMouseOver(event, d) {
			const attributeText = `${d3.select(this).attr("data-education")}`;
			const visibleText = `${d3.select(this).attr("data-county")}. ${d3
				.select(this)
				.attr("data-state")}: ${d3
				.select(this)
				.attr("data-education")}`;
			const [x, y] = d3.pointer(event);
			tooltip
				.style("left", x + 0 + "px")
				.style("top", y + 0 + "px")
				.style("opacity", 0.8)
				.style("visibility", "visible")
				.attr("data-education", attributeText);
			return tooltip.html(`<p>${visibleText}</p>`);
		}
		function handleMouseOut() {
			tooltip.style("opacity", 0).style("visibility", "hidden");
		}
		// * Plot counties and tooltip
		svg.append("g")
			.selectAll("path")
			.data(countiesGJSON)
			.join("path")
			.attr("class", "county")
			.attr("county", (d) => d)
			.attr("data-fips", (d) => d.properties.fips)
			.attr("data-education", (d) => d.properties.bachelorsOrHigher)
			.attr("data-state", (d) => d.properties.state)
			.attr("data-county", (d) => d.properties.area_name)
			.attr("fill", (d) => color(d.properties.bachelorsOrHigher))
			.attr("d", path)
			.on("mouseover", handleMouseOver)
			.on("mouseout", handleMouseOut);

		// Plot statemesh
		svg.append("path")
			.datum(
				topojson.mesh(
					usTJSON,
					usTJSON.objects.states,
					(a, b) => a !== b
				)
			)
			.attr("fill", "none")
			.attr("stroke", "white")
			.attr("stroke-linejoin", "round")
			.attr("d", path);

		// ? CONSOLE LOG AREA
		console.log(countiesGJSON[32]);
	})
	.catch((error) => {
		// Handle errors
		console.error("Error fetching JSON:", error);
	});
