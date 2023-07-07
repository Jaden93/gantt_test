
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

window.ganttModules = {};
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
          css: function (date) {
            if (gantt.isWorkTime(date)) {
              console.log(date);
              return "week-end";
            }
          },
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
        { unit: "day", step: 1, format: "%j" },
        { unit: "hour", step: 1, format: "%H:%i" },
      ],
      round_dnd_dates: false,
      min_column_width: 90,
      scale_height: 60,
    },
    {
      name: "years",
      scales: [
        { unit: "year", step: 1, format: "%Y" },
        { unit: "month", step: 1, format: "%M" },
        { unit: "day", step: 1, format: "%j" },
        { unit: "hour", step: 1, format: "%H:%i" },
        // { unit: "five_days", step: 1, format: weekScaleTemplate },
      ],
      round_dnd_dates: true,
      min_column_width: 30,
      scale_height: 40,
    },
  ],
};
ganttModules.zoom = (function (gantt) {
  gantt.ext.zoom.init(zoomConfig);

  let isActive = true;

  return {
    deactivate: function () {
      isActive = false;
    },
    //imposto di default al dettaglio
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
    },
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
    // cachedSettings.end_date = config.end_date;
  }

  function restoreConfig() {
    applyConfig(cachedSettings);
  }

  // MOSTRA DATE DA A griglia
  function applyConfig(config, dates) {
    if (config.scales[0].date) {
      gantt.templates.date_scale = null;
    } else {
      gantt.templates.date_scale = config.scales[0].template;
    }

    if (dates && dates.start_date && dates.start_date) {
      gantt.config.start_date = gantt.date.add(
        dates.start_date,
        -1,
        config.scales[0].unit
      );
      // gantt.config.end_date = gantt.date.add(
      //   gantt.date[config.scales[0].unit + "_start"](dates.end_date),
      //   2,
      //   config.scales[0].unit
      // );
    } else {
      gantt.config.start_date = gantt.config.end_date = null;
    }
  }

  function zoomToFit() {
    let areaWidth = gantt.$task.offsetWidth;
    const scaleConfigs = zoomConfig.levels;

    let zoomLevel = 0;
    for (let i = 0; i < scaleConfigs.length; i++) {
      zoomLevel = i;
      const columnCount = getUnitsBetween(
        project.start_date,
        // project.end_date,
        scaleConfigs[i].scales[scaleConfigs[i].scales.length - 1].unit,
        scaleConfigs[i].scales[0].step || 1
      );
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
    },
  };
})(gantt);


function toggleZoomToFitBtn() {
  if (ganttModules.zoomToFit.isEnabled()) {
    highlightButton("zoomToFit");
  } else {
    unhighlightButton("zoomToFit");
  }
}

ganttModules.zoom = (function (gantt) {
  gantt.ext.zoom.init(zoomConfig);

  let isActive = true;

  return {
    deactivate: function () {
      isActive = false;
    },
    //imposto di default al dettaglio
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
    },
  };
})(gantt);

ganttModules.zoom.setZoom("years");
