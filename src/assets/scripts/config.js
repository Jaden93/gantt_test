 gantt.config.work_time = true;
    gantt.config.start_date = new Date("2022, 02, 02");
    // gantt.config.end_date = new Date(2022, 03, 25);
    gantt.setWorkTime({ hours: ["8:30-12:30", "13:30-17:30"] });
    gantt.config.min_column_width = 18;
    gantt.config.scale_height = 60;
    gantt.config.show_task_cells = false;
    gantt.config.round_dnd_dates = false;
    gantt.config.skip_off_time = false;
