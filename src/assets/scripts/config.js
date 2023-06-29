// gantt.config.start_date = new Date("2022, 02, 02");
// gantt.config.end_date = new Date(2022, 03, 25);
gantt.setWorkTime({ hours: ["8:30-12:30", "13:30-17:30"] });
gantt.config.min_column_width = 18;
gantt.config.scale_height = 60;
gantt.config.show_task_cells = false;
gantt.config.round_dnd_dates = false;
//calculates duration in working hours and hides non-working time from the chart
gantt.config.work_time = true;
gantt.config.skip_off_time = true;
gantt.config.duration_unit = "minute";

    gantt.config.auto_types = true;
    gantt.config.date_format = "%d-%m-%Y %H:%i";
    gantt.config.duration_step = 1;

    //modalità per quando si hanno tante tasks che riguarda il riordinamento
    gantt.config.order_branch = "marker";
    gantt.config.order_branch_free = true;
    gantt.config.grid_resize = true;

    gantt.config.auto_scheduling_strict = true;
    gantt.config.static_background = true;
    gantt.config.branch_loading = true;
    gantt.config.date_grid = "%Y-%m-%d %H:%i";

    gantt.config.time_step = 1;
