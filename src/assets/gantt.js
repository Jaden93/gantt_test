import { InMemoryDataService } from "InMemoryDataService"

	gantt.attachEvent("onLoadStart", function () {
		gantt.message("Loading...");
	});
	gantt.attachEvent("onLoadEnd", function () {
		gantt.message({
			text: "Loaded " + gantt.getTaskCount() + " tasks, " + gantt.getLinkCount() + " links",
			expire: 8 * 1000
		});
	});

	gantt.config.min_column_width = 30;
	gantt.config.scale_height = 60;
	gantt.config.work_time = true;

	gantt.config.scales = [
		{unit: "hour", step: 1, format: "%g"},
		{unit: "minute", step: 10, format: "%i"},
		{unit: "month", step: 1, format: "%F, %Y"},
		{unit: "year", step: 1, format: "%Y"}
	];


	gantt.config.row_height = 22;

	gantt.config.static_background = true;
	gantt.templates.timeline_cell_class = function (task, date) {
		if (!gantt.isWorkTime(date))
			return "week_end";
		return "";
	};

	gantt.init("gantt-chart");
	gantt.parse(InMemoryDataService.createDb());
