

gantt.init("gantt_here")

// gantt.attachEvent("onBeforeDataRender", function () {
//   var visibleRange = gantt.getVisibleTaskRange();
//   var startIndex = visibleRange.startIndex;
//   var endIndex = visibleRange.endIndex;

//   // Carica solo i record dallo startIndex all'endIndex utilizzando il tuo metodo di caricamento dati
//   // ad esempio tramite una chiamata HTTP o caricamento da un file JSON
//   // Esempio: carica solo i record 0-99 (i primi 100 record)
//   var dataToLoad = data.slice(startIndex, endIndex + 1);

//   // Carica i dati utilizzando il metodo gantt.parse()
//   gantt.parse({ data: dataToLoad.data, links : dataToLoad.links });
// });
gantt.parse({ data: taskData.data, links: taskData.links });

function updIcon(el) {
  el.parentElement.classList.toggle("checked_label");

  var iconEl = el.parentElement.querySelector("i"),
    checked = "check_box",
    unchecked = "check_box_outline_blank",
    className = "icon_color";

  iconEl.textContent = iconEl.textContent == checked ? unchecked : checked;
  iconEl.classList.toggle(className);
}


    // gantt.batchUpdate(function () {
    //   gantt.eachTask(function (task) {
    //     colorizeTask(task);
    //   });
    // });
