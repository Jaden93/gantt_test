
window.ganttModules = {};


function addClass(node, className) {
  node.className += " " + className;
}

function removeClass(node, className) {
  node.className = node.className.replace(new RegExp(" *" + className.replace(/\-/g, "\\-"), "g"), "");
}

function getButton(name) {
  return document.querySelector(".gantt-controls [data-action='" + name + "']");
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
    toggleZoomToFitBtn()
  },
  zoomOut: function () {
    ganttModules.zoomToFit.disable();
    ganttModules.zoom.zoomOut();
    refreshZoomBtns();
    toggleZoomToFitBtn()
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
      unhighlightButton("toggleAutoScheduling")
    }
  },
  toggleCriticalPath: function () {
    gantt.config.highlight_critical_path = !gantt.config.highlight_critical_path;
    if (gantt.config.highlight_critical_path) {
      highlightButton("toggleCriticalPath");
    } else {
      unhighlightButton("toggleCriticalPath")
    }
    gantt.render();
  },
  toPDF: function () {
    // workaround for the bug with the export
    gantt.config.columns[5].editor = null;
    gantt.exportToPDF({
      header: `<style>.timeline_cell{width: ${gantt.$task_data.scrollWidth}px !important;}</style>`,
      raw: true
    });
    gantt.config.columns[5].editor = predecessorEditor;
  },
  toPNG: function () {
    // workaround for the bug with the export
    gantt.config.columns[5].editor = null;
    gantt.exportToPNG({
      header: `<style>.timeline_cell{width: ${gantt.$task_data.scrollWidth}px !important;}</style>`,
      raw: true
    });
    gantt.config.columns[5].editor = predecessorEditor;
  },
  toExcel: function () {
    // workaround for the bug with the export
    gantt.config.columns[5].editor = null;
    gantt.exportToExcel();
    gantt.config.columns[5].editor = predecessorEditor;
  },
  toMSProject: function () {
    // workaround for the bug with the export
    gantt.config.columns[5].editor = null;
    gantt.exportToMSProject();
    gantt.config.columns[5].editor = predecessorEditor;
  }
};



const zoomConfig = {
  levels: [
    {
      name: "hours",
      scales: [
        { unit: "day", step: 1, format: "%j %M" },
        { unit: "hour", step: 1, format: "%H:%i" },
      ],
      round_dnd_dates: true,
      min_column_width: 30,
      scale_height: 60
    },
    {
      name: "days",
      scales: [
        { unit: "week", step: 1, format: "%W" },
        { unit: "day", step: 1, format: "%j" },
      ],
      round_dnd_dates: true,
      min_column_width: 60,
      scale_height: 60
    },
    {
      name: "weeks",
      scales: [
        { unit: "month", step: 1, format: "%M" },
        {
          unit: "week", step: 1, format: function (date) {
            const dateToStr = gantt.date.date_to_str("%d %M");
            const endDate = gantt.date.add(gantt.date.add(date, 1, "week"), -1, "day");
            return dateToStr(date) + " - " + dateToStr(endDate);
          }
        }
      ],
      round_dnd_dates: false,
      min_column_width: 60,
      scale_height: 60
    },
    {
      name: "months",
      scales: [
        { unit: "year", step: 1, format: "%Y" },
        {
          unit: "quarter", step: 1, format: function quarterLabel(date) {
            const month = date.getMonth();
            let q_num;

            if (month >= 9) {
              q_num = 4;
            } else if (month >= 6) {
              q_num = 3;
            } else if (month >= 3) {
              q_num = 2;
            } else {
              q_num = 1;
            }

            return "Q" + q_num;
          }
        },
        { unit: "month", step: 1, format: "%M" }
      ],
      round_dnd_dates: false,
      min_column_width: 50,
      scale_height: 60
    },
    {
      name: "years",
      scales: [
        { unit: "year", step: 1, format: "%Y" },
        {
          unit: "year", step: 5, format: function (date) {
            const dateToStr = gantt.date.date_to_str("%Y");
            const endDate = gantt.date.add(gantt.date.add(date, 5, "year"), -1, "day");
            return dateToStr(date) + " - " + dateToStr(endDate);
          }
        }
      ],
      round_dnd_dates: false,
      min_column_width: 50,
      scale_height: 60
    },
    {
      name: "years",
      scales: [
        {
          unit: "year", step: 10, format: function (date) {
            const dateToStr = gantt.date.date_to_str("%Y");
            const endDate = gantt.date.add(gantt.date.add(date, 10, "year"), -1, "day");
            return dateToStr(date) + " - " + dateToStr(endDate);
          }
        },
        {
          unit: "year", step: 100, format: function (date) {
            const dateToStr = gantt.date.date_to_str("%Y");
            const endDate = gantt.date.add(gantt.date.add(date, 100, "year"), -1, "day");
            return dateToStr(date) + " - " + dateToStr(endDate);
          }
        }
      ],
      round_dnd_dates: false,
      min_column_width: 50,
      scale_height: 60
    }
  ]

}

ganttModules.zoom = (function (gantt) {

  gantt.ext.zoom.init(zoomConfig);

  let isActive = true;

  return {
    deactivate: function () {
      isActive = false;
    },
    setZoom: function (level) {
      isActive = true;
      gantt.ext.zoom.setLevel(level);
    },
    zoomOut: function () {
      isActive = true;
      gantt.ext.zoom.zoomOut();
      gantt.render();
    },
    zoomIn: function () {
      isActive = true;
      gantt.ext.zoom.zoomIn();
      gantt.render();
    },
    canZoomOut: function () {
      const level = gantt.ext.zoom.getCurrentLevel();

      return !isActive || !(level > 5);
    },
    canZoomIn: function () {
      const level = gantt.ext.zoom.getCurrentLevel();
      return !isActive || !(level === 0);
    }
  };
})(gantt);


ganttModules.zoomToFit = (function (gantt) {
  let cachedSettings = {};

  function saveConfig() {
    const config = gantt.config;
    cachedSettings = {};
    cachedSettings.scales = config.scales;
    cachedSettings.template = gantt.templates.date_scale;
    cachedSettings.start_date = config.start_date;
    cachedSettings.end_date = config.end_date;
  }

  function restoreConfig() {
    applyConfig(cachedSettings);
  }

  function applyConfig(config, dates) {
    if (config.scales[0].date) {
      gantt.templates.date_scale = null;
    }
    else {
      gantt.templates.date_scale = config.scales[0].template;
    }

    gantt.config.scales = config.scales;

    if (dates && dates.start_date && dates.start_date) {
      gantt.config.start_date = gantt.date.add(dates.start_date, -1, config.scales[0].unit);
      gantt.config.end_date = gantt.date.add(gantt.date[config.scales[0].unit + "_start"](dates.end_date), 2, config.scales[0].unit);
    } else {
      gantt.config.start_date = gantt.config.end_date = null;
    }
  }


  function zoomToFit() {
    const project = gantt.getSubtaskDates(),
      areaWidth = gantt.$task.offsetWidth;
    const scaleConfigs = zoomConfig.levels

    let zoomLevel = 0;
    for (let i = 0; i < scaleConfigs.length; i++) {
      zoomLevel = i;
      const columnCount = getUnitsBetween(project.start_date, project.end_date, scaleConfigs[i].scales[scaleConfigs[i].scales.length - 1].unit, scaleConfigs[i].scales[0].step || 1);
      if ((columnCount + 2) * gantt.config.min_column_width <= areaWidth) {
        break;
      }
    }

    if (zoomLevel == scaleConfigs.length) {
      zoomLevel--;
    }

    applyConfig(scaleConfigs[zoomLevel], project);
    gantt.render();
  }

  // get number of columns in timeline
  function getUnitsBetween(from, to, unit, step) {
    let start = new Date(from),
      end = new Date(to);
    let units = 0;
    while (start.valueOf() < end.valueOf()) {
      units++;
      start = gantt.date.add(start, step, unit);
    }
    return units;
  }

  let enabled = false;
  return {
    enable: function () {
      if (!enabled) {
        enabled = true;
        saveConfig();
        zoomToFit();
        gantt.render();
      }
    },
    isEnabled: function () {
      return enabled;
    },
    toggle: function () {
      if (this.isEnabled()) {
        this.disable();
      } else {
        this.enable();
      }
    },
    disable: function () {
      if (enabled) {
        enabled = false;
        restoreConfig();
        gantt.render();
      }
    }
  };

})(gantt);




