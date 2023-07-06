// gantt.config.start_date = new Date("2022, 02, 02");
// gantt.config.end_date = new Date(2022, 03, 25);
gantt.setWorkTime({ hours: ["8:30-12:30", "13:30-17:30"] });
gantt.config.min_column_width = 18;
gantt.config.scale_height = 60;
gantt.config.show_task_cells = false;
gantt.config.smart_scales = true
gantt.config.round_dnd_dates = false;
//calculates duration in working hours and hides non-working time from the chart
gantt.config.work_time = true;
gantt.config.skip_off_time = true;
gantt.config.duration_unit = "hour";
gantt.config.fit_tasks = true;

    gantt.config.auto_types = true;
    gantt.config.date_format = "%Y-%m-%d %H:%i";
    // gantt.config.date_format = "%Y-%m-%d %H:%i:%s";

    gantt.config.duration_step = 1;

    //modalità per quando si hanno tante tasks che riguarda il riordinamento
    gantt.config.order_branch = "marker";
    gantt.config.order_branch_free = true;
    gantt.config.grid_resize = true;

    gantt.config.auto_scheduling_strict = true;
    gantt.config.static_background = true;
    // gantt.config.branch_loading = true;
    gantt.config.date_grid = "%Y-%m-%d %H:%i";


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
    labels : {
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
