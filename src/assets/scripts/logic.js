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



// gantt.setWorkTime({ hours: ["8:30-12:30", "13:30-17:30"] });


// var weekScaleTemplate = function (date) {
//   var dateToStr = gantt.date.date_to_str("%d %M");
//   var weekNum = gantt.date.date_to_str("(week %W)");
//   var endDate = gantt.date.add(gantt.date.add(date, 1, "week"), -1, "day");
//   return dateToStr(date) + " - " + dateToStr(endDate) + " " + weekNum(date);
// };
var textFilter = "<input data-text-filter type='text' oninput='gantt.$doFilter(this.value)'>"


gantt.ext.fullscreen.getFullscreenElement = function () {
  return document.querySelector(".demo-main-container");
};

const durationFormatter = gantt.ext.formatters.durationFormatter({
  enter: "day",
  store: "minute",
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
var labels = gantt.locale.labels;
// labels.column_priority = labels.section_priority = "Priorità";
// labels.column_owner = labels.section_owner = "Owner";

// const ownerEditor = { type: "select", map_to: "textColor", options: owners };

// function updateFilter(owner) {
//   filterValue = owner;
//   gantt.render();
// }

const dateEditor = {
  type: "date",
  map_to: "start_date",
  min: new Date(2023, 0, 1, 0o0),
  max: new Date(2024, 0, 1, 0o0),
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

gantt.serverList("priority", [
  { key: 1, label: "High" },
  { key: 2, label: "Normal" },
  { key: 3, label: "Low" }
]);
var filter_inputs = document.getElementById("filters_wrapper")
if (filter_inputs != null) {

  filter_inputs = filter_inputs.getElementsByTagName("input");
  for (var i = 0; i < filter_inputs.length; i++) {
    var filter_input = filter_inputs[i];

    // attach event handler to update filters object and refresh data (so filters will be applied)
    filter_input.onchange = function () {
      gantt.refreshData();
      updIcon(this);
    }
  }
}
gantt.config.columns = [
  { name: "text", label: textFilter, tree: true, width: '200', resize: true },
  {
    label: "Data Inizio",
    name: "start_date",
    align: "center",
    resize: true,
    width: 120,
    editor: dateEditor,
  },
  {
    name: "dayDuration", label: "Durata (giorni)", resize: true, align: "center", template: function (task) {
      return dayFormatter.format(task.duration);
    }, editor: dayDurationEditor, width: 100
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
  //   name: "hourDuration",
  //   label: "Durata (ore)",
  //   resize: true,
  //   align: "center",
  //   template: function (task) {
  //     return hourFormatter.format(task.duration);
  //   },
  //   editor: hourDurationEditor,
  //   width: 100,
  // },
  // {
  //   name: "priority", label: "Priority", align: "center", template: function (obj) {
  //     if (obj.priority == 1) return "High";
  //     if (obj.priority == 2) return "Normal";
  //     return "Low";
  //   }
  // },


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
// gantt.attachEvent("onAfterTaskUpdate",function(id,parent,tindex){
//   gantt.autoSchedule(id);
// })

// gantt.attachEvent("onAfterTaskAutoSchedule", function (task, new_date, constraint, predecessor) {
//   if (task && predecessor) {
//     gantt.message({
//       text: "<b>" + task.text + "</b> has been rescheduled to " + gantt.templates.task_date(new_date) + " due to <b>" + predecessor.text + "</b> constraint",
//       expire: 6000
//     });
//   }
// });

gantt.attachEvent("onAfterTaskDrag", function (id, mode) {
  if (id == 50002) {
    //task da muovere dinamicamente
    var linkedTask = gantt.getTask(1);
    //task da muovere per farsì che la linkedtask si sposti
    var taskMoved = gantt.getTask(id);

    var linkEndDate = gantt.calculateEndDate(taskMoved.end_date, 0);
    linkedTask.start_date = linkEndDate;
    //linkedTask mossa dinamicamnete a cavallo con l'end_date della taskMoved
    var calculateEndDate = gantt.calculateEndDate(taskMoved.end_date, 60);
    linkedTask.end_date = calculateEndDate;

    var tasksWithSameResource = gantt.getTaskBy(function (task) {
      return task.owner && task.owner.length > 0 && task.owner[0].resource_id === linkedTask.owner[0].resource_id;
    });

    var availableStartDate = calculateEndDate;
    var isTaskInserted = false;

    while (!isTaskInserted) {
      var isOccupied = false;
      tasksWithSameResource.forEach(function (task) {
        var taskEndDate = gantt.calculateEndDate(task.start_date, task.duration);
        if (task.start_date <= availableStartDate && availableStartDate <= taskEndDate) {
          isOccupied = true;
          availableStartDate = gantt.calculateEndDate(taskEndDate, 1, "minute");
        }
      });
      if (!isOccupied) {
        isTaskInserted = true;
        linkedTask.start_date = availableStartDate;
        linkedTask.end_date = gantt.calculateEndDate(availableStartDate, linkedTask.duration);
      }
    }

    gantt.updateTask(linkedTask.id);
    gantt.autoSchedule(linkedTask.id);
  }
});




// gantt.attachEvent("onTaskLoading ", function (task) {
  // console.log(task)
  // let taskWithTargets = gantt.getTask(40000).$target
  // taskWithTargets.forEach(element => {
  //     gantt.getLink(element).color = "green";
  //   });
// })




gantt.config.scales = [
  { unit: "month", step: 1, format: "%F, %Y" },
  { unit: "day", step: 1, format: "%D, %d" },
  { unit: "hour", step: 1, format: "%H" },
  // { unit: "minute", step: 10, format: "%i" }

]
gantt.templates.task_time = function (start, end, task) {
  return gantt.templates.task_date(start) + " - " + gantt.templates.task_end_date(end);
};

gantt.templates.timeline_cell_class = function (task, date) {
  // if (gantt.isWorkTime(date) == false && gantt.getWorkHours(date).length == 0)

  //ritorno la configurazione della scala temporale
  if (!gantt.isWorkTime({ date, task, unit: gantt.getScale().unit })) {
    return "weekend";
  }
  // return "";
};

gantt.init("gantt_here")

gantt.attachEvent("onTaskLoading", function (task) {
  //any custom logic here
  setTimeout(() => {
      if (task.$target.length >= 2) {
        task.$target.forEach(element => {
          gantt.getLink(element).color = "green";

        });
      gantt.updateTask(task.id);

      }
    },1)
  return true;
});


gantt.attachEvent("onAfterTaskAutoSchedule", function (task, start, link, predecessor) {
  // any custom logic here
  // console.log(task.id)
  // gantt.eachTask(function (element) {
  //  if (task.id != element.id) {
  //   console.log(element)
  // }
  // })
  //  console.log(task.end_date); })
  //
  // if (task.id)
});

gantt.parse({ data: taskData.data, links: taskData.links, resource: taskData.resources });

