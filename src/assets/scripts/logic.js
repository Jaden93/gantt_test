window.ganttModules = {};

    function addClass(node, className) {
      node.className += " " + className;
    }

    function removeClass(node, className) {
      if (node)
      node.className = node.className.replace(
        new RegExp(" *" + className.replace(/\-/g, "\\-"), "g"),
        ""
      );
    }

    function getButton(name) {
      return document.querySelector(
        ".gantt-controls [data-action='" + name + "']"
      );
    }

    function highlightButton(name) {
      addClass(getButton(name), "menu-item-active");
    }
    function unhighlightButton(name) {
      removeClass(getButton(name), "menu-item-active");
    }

    function disableButton(name) {
      addClass(getButton(name), "menu-item-disabled");
    }

    function enableButton(name) {
      removeClass(getButton(name), "menu-item-disabled");
    }

    function refreshZoomBtns() {
      const zoom = ganttModules.zoom;
      if (zoom.canZoomIn()) {
        enableButton("zoomIn");
      } else {
        disableButton("zoomIn");
      }
      if (zoom.canZoomOut()) {
        enableButton("zoomOut");
      } else {
        disableButton("zoomOut");
      }
    }

    function refreshUndoBtns() {
      if (!gantt.getUndoStack || !gantt.getUndoStack().length) {
        disableButton("undo");
      } else {
        enableButton("undo");
      }

      if (!gantt.getRedoStack || !gantt.getRedoStack().length) {
        disableButton("redo");
      } else {
        enableButton("redo");
      }
    }

    setInterval(refreshUndoBtns, 1000);

    function toggleZoomToFitBtn() {
      if (ganttModules.zoomToFit.isEnabled()) {
        highlightButton("zoomToFit");
      } else {
        unhighlightButton("zoomToFit");
      }
    }

    const toolbarMenu = {
      undo: function () {
        gantt.undo();
        refreshUndoBtns();
      },
      redo: function () {
        gantt.redo();
        refreshUndoBtns();
      },
      zoomIn: function () {
        ganttModules.zoomToFit.disable();
        ganttModules.zoom.zoomIn();
        refreshZoomBtns();
        toggleZoomToFitBtn();
      },
      zoomOut: function () {
        ganttModules.zoomToFit.disable();
        ganttModules.zoom.zoomOut();
        refreshZoomBtns();
        toggleZoomToFitBtn();
      },
      zoomToFit: function () {
        ganttModules.zoom.deactivate();
        ganttModules.zoomToFit.toggle();
        toggleZoomToFitBtn();
        refreshZoomBtns();
      },
      fullscreen: function () {
        gantt.ext.fullscreen.toggle();
      },
      collapseAll: function () {
        gantt.eachTask(function (task) {
          task.$open = false;
        });
        gantt.render();
      },
      expandAll: function () {
        gantt.eachTask(function (task) {
          task.$open = true;
        });
        gantt.render();
      },
      toggleAutoScheduling: function () {
        gantt.config.auto_scheduling = !gantt.config.auto_scheduling;
        if (gantt.config.auto_scheduling) {
          gantt.autoSchedule();
          highlightButton("toggleAutoScheduling");
        } else {
          unhighlightButton("toggleAutoScheduling");
        }
      },
      toggleCriticalPath: function () {
        gantt.config.highlight_critical_path =
          !gantt.config.highlight_critical_path;
        if (gantt.config.highlight_critical_path) {
          highlightButton("toggleCriticalPath");
        } else {
          unhighlightButton("toggleCriticalPath");
        }
        gantt.render();
      },
      toPDF: function () {
        gantt.config.columns[5].editor = null;
        gantt.exportToPDF({
          header: `<style>.timeline_cell{width: ${gantt.$task_data.scrollWidth}px !important;}</style>`,
          raw: true,
        });
      },
      toPNG: function () {
        gantt.config.columns[5].editor = null;
        gantt.exportToPNG({
          header: `<style>.timeline_cell{width: ${gantt.$task_data.scrollWidth}px !important;}</style>`,
          raw: true,
        });
      },
      toExcel: function () {
        gantt.config.columns[5].editor = null;
        gantt.exportToExcel();
      },
      toMSProject: function () {
        gantt.config.columns[5].editor = null;
        gantt.exportToMSProject();
        gantt.config.columns[5].editor = predecessorEditor;
      },
    };

    //#region giorni  lavorativi
    const weekScaleTemplate = function (date) {
      const dateToStr = gantt.date.date_to_str("%d %D");
      const endDate = gantt.date.add(gantt.date.add(date, 5, "day"), -1, "day");
      return dateToStr(date) + " - " + dateToStr(endDate);
    };
    gantt.date.five_days_start = function (date) {
      return date;
    };

    gantt.date.add_five_days = function (date, inc) {
      if (inc < 0) {
        // the first scale cell should start on monday
        const weekDay = date.getDay();
        if (weekDay != 1) {
          const diff = Math.abs(weekDay - 1);
          return gantt.date.add(date, -diff, "day");
        }
      }
      if (date.getDay() == 0 || date.getDay() == 6) {
        return gantt.date.add(date, 1 * inc, "day");
      }
      gantt.date.week_start(date);
      return gantt.date.add(date, 5 * inc, "day");
    };

    //#endregion

    gantt.templates.timeline_cell_class = function (task, date) {
      if (!gantt.isWorkTime({ date: date, task: task })) {
        return "weekend";
      }
    };
    const zoomConfig = {
      levels: [
        {
          name: "minutes",
          scales: [
            { unit: "day", step: 1, format: "%j %M" },
            { unit: "hour", step: 1, format: "%H:%i" },
            { unit: "minute", step: 10, format: "%i" },
          ],
          round_dnd_dates: false,
          min_column_width: 40,
          scale_height: 60,
        },
        {
          name: "hours",
          scales: [
            // { unit: "day", step: 1, format: "%j" },
            { unit: "hour", step: 1, format: "%H:%i" },
            { unit: "minute", step: 30, format: "%i" },
          ],
          round_dnd_dates: true,
          min_column_width: 60,
          scale_height: 60,
        },
        {
          name: "days",
          scales: [
            {
              unit: "day",
              step: 1,
              format: "%j %D",
              // css: function (date) {
              //   if (gantt.isWorkTime(date)) {
              //     console.log(date);
              //     return "week-end";
              //   }
              // },
            },
            { unit: "hour", step: 1, format: "%H:%i" },
          ],
          round_dnd_dates: false,
          min_column_width: 60,
          scale_height: 60,
        },
        {
          name: "months",
          scales: [
            { unit: "month", step: 1, format: "%M" },
            // { unit: "day", step: 1, format: "%j" },
            { unit: "five_days", step: 1, format: weekScaleTemplate },

            // { unit: "hour", step: 1, format: "%H:%i" },
          ],
          round_dnd_dates: false,
          min_column_width: 90,
          scale_height: 60,
        },
        {
          name: "years",
          scales: [
            { unit: "month", step: 1, format: "%M" },
            { unit: "day", step: 1, format: "%j" },
            // { unit: "hour", step: 1, format: "%H:%i" },
          ],
          round_dnd_dates: false,
          min_column_width: 50,
          scale_height: 60,
        },
      ],
    };
    // gantt.config.inherit_scale_class = true;

    // gantt.templates.grid_row_class = function (start, end, task) {
    //   return gantt.hasChild(task.id) ? "gantt_parent_row" : "";
    // };

    const font_width_ratio = 7;

    gantt.plugins({
      grouping : true,
      marker: true,
      fullscreen: true,
      critical_path: true,
      auto_scheduling: true,
      tooltip: true,
      undo: true,
      export_api: true,
    });

    //#region compare sulla griglia una barra che identifica il giorno odierno
    // const date_to_str = gantt.date.date_to_str(gantt.config.task_date);
    // var dateObj = new Date();
    // var month = dateObj.getUTCMonth() + 1; //months from 1-12
    // var day = dateObj.getUTCDate();
    // var year = dateObj.getUTCFullYear();
    // todayDate = year + ", " + month + ", " + day;
    // const today = new Date(todayDate);
    // gantt.addMarker({
    //   start_date: today,
    //   css: "today",
    //   text: "Today",
    //   title: "Today: " + date_to_str(today),
    // });
    //#endregion

    const start = new Date(2023, 4, 29);
    // gantt.addMarker({
    //   start_date: start,
    //   css: "status_line",
    //   text: "Start project",
    //   title: "Start project: " + date_to_str(start),
    // });

    gantt.ext.fullscreen.getFullscreenElement = function () {
      return document.querySelector(".demo-main-container");
    };

    const durationFormatter = gantt.ext.formatters.durationFormatter({
      enter: "day",
      store: "hour",
      format: "auto",
      short: false,
      minutesPerHour: 60,
      hoursPerDay: 8,
      hoursPerWeek: 40,
      daysPerMonth: 30,
      labels: {
        minute: {
          full: "minute",
          plural: "minutes",
          short: "min",
        },
        hour: {
          full: "hour",
          plural: "hours",
          short: "h",
        },
        day: {
          full: "day",
          plural: "days",
          short: "d",
        },
        week: {
          full: "week",
          plural: "weeks",
          short: "wk",
        },
        month: {
          full: "month",
          plural: "months",
          short: "mon",
        },
        year: {
          full: "year",
          plural: "years",
          short: "y",
        },
      },
    });
    const linksFormatter = gantt.ext.formatters.linkFormatter({
      durationFormatter: durationFormatter,
    });

    const hourFormatter = gantt.ext.formatters.durationFormatter({
      enter: "hour",
      store: "minute",
      format: "hour",
      short: true,
    });
    var autoFormatter = gantt.ext.formatters.durationFormatter({
      enter: "day",
      store: "minute",
      format: "auto",
    });
    const textEditor = { type: "text", map_to: "text" };
    // const owner = findById(task.owner_id);
    // gantt.locale.labels.section_priority = "Priority";

    const ownerEditor = { type: "select", map_to: "textColor", options: owners };
    let filterValue = "";

    function updateFilter(owner) {
      filterValue = owner;
      gantt.render();
    }

    const dateEditor = {
      type: "date",
      map_to: "start_date",
      min: new Date(2023, 0, 1),
      max: new Date(2024, 0, 1),
    };
    const durationEditor = {
      type: "duration",
      map_to: "duration",
      formatter: durationFormatter,
      min: 0,
      max: 10000,
    };
    const progressEditor = {
      type: "number",
      map_to: "progress",
      min: 0,
      max: 100,
    };

    const hourDurationEditor = {
      type: "duration",
      map_to: "duration",
      formatter: hourFormatter,
      min: 0,
      max: 10000,
    };
    var dayFormatter = gantt.ext.formatters.durationFormatter({
      enter: "day",
      store: "minute",
      format: "day",
      hoursPerDay: 8,
      hoursPerWeek: 40,
      daysPerMonth: 30,
      short: false,
    });
    const dayDurationEditor = {
      type: "duration",
      map_to: "duration",
      formatter: dayFormatter,
      min: 0,
      max: 1000,
    };

    gantt.config.columns = [
          {
        name: "owner", align: "center", width: 75, label: "Lavoratore", template: function (task) {
            if (task.type == gantt.config.types.project) {
                return "";
            }

            const store = gantt.getDatastore("resource");
            const assignments = task[gantt.config.resource_property];

            if (!assignments || !assignments.length) {
                return "Unassigned";
            }

            if (assignments.length == 1) {
                return store.getItem(assignments[0].resource_id).text;
            }

            let result = "";
            assignments.forEach(function (assignment) {
                const owner = store.getItem(assignment.resource_id);
                if (!owner)
                    return;
                result += "<div class='owner-label' title='" + owner.text + "'>" + owner.text.substr(0, 1) + "</div>";

            });

            return result;
        }, resize: true
    },
      {
        name: "text",
        tree: true,
        width: 190,
        resize: true,
        editor: textEditor,
      },
      {
        label: "Data Inizio",
        name: "start_date",
        align: "center",
        resize: true,
        width: 80,
        editor: dateEditor,
      },
      {
        name: "duration",
        label: "Durata",
        resize: true,
        align: "center",
        template: function (task) {
          return autoFormatter.format(task.duration);
        },
        editor: durationEditor,
        width: 100,
      },
      // {
      //   name: "dayDuration",
      //   label: "Duration (days)",
      //   resize: true,
      //   align: "center",
      //   template: function (task) {
      //     return dayFormatter.format(task.duration);
      //   },
      //   editor: dayDurationEditor,
      //   width: 100,
      // },
      {
        name: "hourDuration",
        label: "Durata (ore)",
        resize: true,
        align: "center",
        template: function (task) {
          return hourFormatter.format(task.duration);
        },
        editor: hourDurationEditor,
        width: 100,
      },

      // {
      //   name: "progress",
      //   label: "Progress",
      //   align: "center",
      //   width: 80,
      //   resize: true,
      //   editor: progressEditor,
      //   template: function (task) {
      //     return Math.round(task.progress * 100) + "%";
      //   },
      // },
      { name: "add", width: 44 },
    ];

    gantt.config.lightbox.sections = [
      {
        name: "description",
        height: 70,
        map_to: "text",
        type: "textarea",
        focus: true,
      },
      {
        name: "type",
        type: "typeselect",
        map_to: "type",
        filter: function (name, value) {
          return !!(value != gantt.config.types.project);
        },
      },
      {
        name: "time",
        type: "duration",
        map_to: "auto",
        formatter: durationFormatter,
      },
    ];
    gantt.config.lightbox.project_sections = [
      {
        name: "description",
        height: 70,
        map_to: "text",
        type: "textarea",
        focus: true,
      },

      {
        name: "time",
        type: "duration",
        readonly: true,
        map_to: "auto",
        formatter: durationFormatter,
      },
    ];
    gantt.config.lightbox.milestone_sections = [
      {
        name: "description",
        height: 70,
        map_to: "text",
        type: "textarea",
        focus: true,
      },
      {
        name: "type",
        type: "typeselect",
        map_to: "type",
        filter: function (name, value) {
          return !!(value != gantt.config.types.project);
        },
      },
      {
        name: "time",
        type: "duration",
        single_date: true,
        map_to: "auto",
        formatter: durationFormatter,
      },
    ];

    gantt.attachEvent("onColumnResizeStart", function (ind, column) {
      if (!column.tree || ind == 0) return;

      setTimeout(function () {
        const marker = document.querySelector(".gantt_grid_resize_area");
        if (!marker) return;
        const cols = gantt.getGridColumns();
        const delta = cols[ind - 1].width || 0;
        if (!delta) return;

        marker.style.boxSizing = "content-box";
        marker.style.marginLeft = -delta + "px";
        marker.style.paddingRight = delta + "px";
      }, 1);
    });

    gantt.templates.tooltip_text = function (start, end, task) {
      const links = task.$target;
      const labels = [];
      for (let i = 0; i < links.length; i++) {
        const link = gantt.getLink(links[i]);
        labels.push(linksFormatter.format(link));
      }
      // const predecessors = labels.join(", ");

      // let html =
      //   "<b>Task:</b> " +
      //   task.text +
      //   "<br/><b>Start:</b> " +
      //   gantt.templates.tooltip_date_format(start) +
      //   "<br/><b>End:</b> " +
      //   gantt.templates.tooltip_date_format(end) +
      //   "<br><b>Duration:</b> " +
      //   durationFormatter.format(task.duration);
      // if (predecessors) {
      //   html += "<br><b>Predecessors:</b>" + predecessors;
      // }
      // return html;
    };


    gantt.init("gantt_here");

    const navBar = document.querySelector(".gantt-controls");
    gantt.event(navBar, "click", function (e) {
      let target = e.target || e.srcElement;
      while (!target.hasAttribute("data-action") && target !== document.body) {
        target = target.parentNode;
      }

      if (target && target.hasAttribute("data-action")) {
        const action = target.getAttribute("data-action");
        if (toolbarMenu[action]) {
          toolbarMenu[action]();
        }
      }
    });

    gantt.templates.timeline_cell_class = function (task, date) {
      if (!gantt.isWorkTime(date)) return "week_end";
      return "";
    };

    let loadedTasks = 500; // Numero di record già caricati
    const tasksPerLoad = 500; // Numero di record da caricare ad ogni caricamento successivo

    gantt.attachEvent("onAfterTaskAdd", function (id, item) {
      colorizeTask(item);
    });

    gantt.attachEvent("onAfterTaskUpdate", function (id, item) {
      colorizeTask(item);
    });

    function filterCheck(task) {
      // console.log(task.owner[0].resource_id,filterValue.toLowerCase())
      return (
        findById(task.owner_id).text.toLowerCase() != filterValue.toLowerCase()
      );
    }

    gantt.attachEvent("onBeforeTaskDisplay", function (id, task) {
      if (filterValue && filterCheck(task)) {
        return false;
      }
      return true;
    });

    gantt.config.open_tree_initially = true;

    //parte di destra
    gantt.templates.rightside_text = function (start, end, task) {
      const percent = `<span>${Math.round(task.progress * 100)}%<span>`;
      let owner = "";
      if (task.owner_id) {
        owner = `<img height=${gantt.config.row_height / 1.5} src='
        ${findById(task.owner_id).img}'> `;
      }
      return owner + percent;
    };

    function loadTasks() {
      const startIndex = loadedTasks;
      const endIndex = startIndex + tasksPerLoad;
      const newTasks = taskData.data.slice(startIndex, endIndex);

      if (newTasks.length > 0) {
        gantt.parse({ data: newTasks, links: newTasks.links });
        loadedTasks += newTasks.length;
      }
    }

    gantt.attachEvent("onGanttScroll", function (left, top) {
      const visibleTasks = gantt.getVisibleTaskCount();
      const lastVisibleTask = gantt.getTaskByIndex(visibleTasks - 1);

      if (gantt.getTaskRowNode(lastVisibleTask.id)) {
        loadTasks();
      }
    });
    const initialTasks = taskData.data.slice(0, 500);
    gantt.parse({ data: initialTasks });

    gantt.batchUpdate(function () {
      gantt.eachTask(function (task) {
        colorizeTask(task);
      });
    });
