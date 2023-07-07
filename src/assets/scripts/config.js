gantt.plugins({
  grouping: true,
  marker: true,
  fullscreen: true,
  critical_path: true,
  auto_scheduling: true,
  tooltip: true,
  undo: true,
  export_api: true,
});

gantt.config.work_time = true;
gantt.config.correct_work_time = true; //enables adjusting the task's start and end dates to the work time (while dragging)

gantt.config.min_duration = 60 * 1000;
gantt.config.min_column_width = 60;
gantt.config.duration_unit = "minute";
gantt.config.scale_height = 20 * 3;
gantt.config.row_height = 30;
gantt.config.date_format = "%Y-%m-%d %H:%i";
gantt.config.round_dnd_dates = false; // Avvicina la fase all'intervallo di timescale più vicino
gantt.config.date_grid = "%Y-%m-%d %H:%i"; // Formato della griglia di sinistra della data

gantt.setWorkTime({ hours: ["9:15-18:00"] });
// gantt.setWorkTime({ hours: ["8:30-12:30", "13:30-17:30"] });
gantt.setWorkTime({ day: 7, hours: false });
gantt.setWorkTime({ day: 6, hours: false });
gantt.config.duration_step = 1; //sets the number of 'gantt.config.duration_unit' units that will correspond to one unit of the 'duration' data
gantt.config.time_step = 1; //Step minimo di spostamento task in minuti
// gantt.config.show_task_cells = true;




// gantt.templates.scale_cell_class = function (date) {
//   if (!gantt.isWorkTime(date)) {
//     return "weekend";
//   }
// };
// gantt.templates.timeline_cell_class = function (task, date) {
//   if (!gantt.isWorkTime({ task: task, date: date })) {
//     return "weekend";
//   }
// };

//rende tutto più lento
// gantt.config.skip_off_time = false;


// gantt.config.fit_tasks = true;

// gantt.config.auto_types = true;

//modalità per quando si hanno tante tasks che riguarda il riordinamento
// gantt.config.order_branch = "marker";
// gantt.config.order_branch_free = true;
// gantt.config.grid_resize = true;

// gantt.config.auto_scheduling_strict = true;
// gantt.config.static_background = true;
// gantt.config.branch_loading = true;


gantt.i18n.setLocale({
  date: {
    month_full: ["Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno",
      "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"],
    month_short: ["Gen", "Feb", "Mar", "Apr", "Mag", "Giu", "Lug",
      "Ago", "Set", "Ott", "Nov", "Dic"],
    day_full: ["Domenica", "Lunedì", "Martedì", "Mercoledì", "Giovedì",
      "Venerdì", "Sabato"],
    day_short: ["Dom", "Lun", "Mar", "Mer", "Gio", "Ven", "Sab"]
  },
  labels: {
    new_task: "Nuova attività",
    section_description: "Descrizione",
    section_type: "Tipo",
    section_time: "Periodo di tempo",
    icon_edit: "Modifica",
    icon_delete: "Elimina",
    icon_cancel: "Cancella",
    icon_details: "Dettagli",
    icon_save: "Salva",
  }
})


//linguaggio locale dinamicamente
//   gantt.changeLocale = function changeLocale(lang){
// 	var script = document.createElement("script");
// 	script.onload = function(){
// 		this.parentNode.removeChild(this);// remove script from dom in order not to clutter it too much
//       	gantt.init("gantt_here");
// 	};

// 	var localeFile = ["locale", lang ? ("_" + lang) : "", ".js"].join("");

// 	script.src = "https://docs.dhtmlx.com/gantt/codebase/locale/" + localeFile;
// 	document.querySelector("head").appendChild(script);
// }
