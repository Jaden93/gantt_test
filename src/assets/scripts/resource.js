// gantt.attachEvent("onEmptyClick", function (e) {
//     setTimeout(filterByResource, 20)
// });

let selectedResource = null;
function filterByResource() {
    selectedResource = gantt.getDatastore("resource").getSelectedId();
    gantt.render();
}

function resetResourceFilter() {
    selectedResource = null;
    gantt.render();
}


gantt.attachEvent("onBeforeTaskDisplay", function (id, task) {
    if (selectedResource) {
        let showTask = false;
        const assignments = gantt.getTaskAssignments(id);
        assignments.forEach(function (assignment) {
            if (assignment.resource_id == selectedResource) {
                showTask = true;
            }
        })
        return showTask;
    }
    return true;
});


function getResourceAssignments(resourceId) {
    let assignments;
    const store = gantt.getDatastore(gantt.config.resource_store);
    const resource = store.getItem(resourceId);

    if (resource.$level === 0) {
        assignments = [];
        store.getChildren(resourceId).forEach(function (childId) {
            assignments = assignments.concat(gantt.getResourceAssignments(childId));
        });
    } else if (resource.$level === 1) {
        assignments = gantt.getResourceAssignments(resourceId);
      } else {
        assignments = gantt.getResourceAssignments(resource.$resource_id, resource.$task_id);
    }
    return assignments;
}
let WORK_DAY = 8

const resourceConfig = {
    columns: [
        {
            name: "name", label: "Name", tree: true, template: function (resource) {
                return resource.text;
            }
        },
        {
            name: "workload", label: "Workload", template: function (resource) {
                var totalDuration = 0;
                if (resource.$level == 2) {
                  const assignment = gantt.getResourceAssignments(resource.$resource_id, resource.$task_id)[0];
                  totalDuration = resource.duration * assignment.value;
                } else {
                    const assignments = getResourceAssignments(resource.id);
                    assignments.forEach(function (assignment) {
                        const task = gantt.getTask(assignment.task_id);

                        if (task.duration >= 60)
                          totalDuration += task.duration / 60

                    });

                  return ( totalDuration.toFixed(2) || 0) + "h";
  }
            }
        },
	{
					name: "progress", label: "Complete", align:"center", template: function(resource) {
						var store = gantt.getDatastore(gantt.config.resource_store);
						var totalToDo = 0,
							totalDone = 0;

						if (resource.$level == 2) {
							completion = resource.progress * 100;
						} else {
							var assignments = getResourceAssignments(resource.id);
							assignments.forEach(function(assignment){
								var task = gantt.getTask(assignment.task_id);
								totalToDo += task.duration;
								totalDone += task.duration * (task.progress || 0);
							});

							var completion = 0;
							if (totalToDo) {
								completion = (totalDone / totalToDo) * 100;
							}
						}


						return Math.floor(completion) + "%";
					}, resize: true
				},
				{
					name: "capacity", label: "Capacity", align:"center", template: function(resource) {
						if(resource.$level == 2){
							return resource.duration * WORK_DAY + "h";
						}
						var store = gantt.getDatastore(gantt.config.resource_store);
						var n = (resource.$level === 0) ? store.getChildren(resource.id).length : 1

						var state = gantt.getState();
						return gantt.calculateDuration(state.min_date, state.max_date) * n * WORK_DAY + "h";
					}
				}
    ]
};

gantt.templates.resource_cell_class = function (start_date, end_date, resource, tasks) {
    const css = [];
    css.push("resource_marker");
    if (tasks.length <= 1) {
        css.push("workday_ok");
    } else {
        css.push("workday_over");
    }
    return css.join(" ");
};

gantt.templates.resource_cell_value = function (start_date, end_date, resource, tasks) {
    let result = 0;
    tasks.forEach(function (item) {
        const assignments = gantt.getResourceAssignments(resource.id, item.id);
        assignments.forEach(function (assignment) {
            // const task = gantt.getTask(assignment.task_id);
            result += assignment.value * 1;
        });
    });

    if (result % 1) {
        result = Math.round(result * 10) / 10;
    }
    return "<div>" + result + "</div>";
};

gantt.locale.labels.section_resources = "Owners";
gantt.config.lightbox.sections = [
    { name: "description", height: 38, map_to: "text", type: "textarea", focus: true },
    {
        name: "resources", type: "resources", map_to: "owner", options: gantt.serverList("people"), default_value: 8
    },

    { name: "time", type: "duration", map_to: "auto" }
];

gantt.config.resource_store = "resource";
gantt.config.resource_property = "owner";
gantt.config.order_branch = true;
gantt.config.open_tree_initially = true;
gantt.config.layout = {
    css: "gantt_container",
    rows: [
        {
            cols: [
                { view: "grid", group: "grids", scrollY: "scrollVer" },
                { resizer: true, width: 1 },
                { view: "timeline", scrollX: "scrollHor", scrollY: "scrollVer" },
                { view: "scrollbar", id: "scrollVer", group: "vertical" }
            ],
            gravity: 2
        },
        { resizer: true, width: 1 },
        {
            config: resourceConfig,
            cols: [
                { view: "resourceGrid", group: "grids", width: 435, scrollY: "resourceVScroll" },
                { resizer: true, width: 1 },
                { view: "resourceTimeline", scrollX: "scrollHor", scrollY: "resourceVScroll" },
                { view: "scrollbar", id: "resourceVScroll", group: "vertical" }
            ],
            gravity: 1
        },
        { view: "scrollbar", id: "scrollHor" }
    ]
};

	function shouldHighlightTask(task) {
			var store = gantt.$resourcesStore;
			var taskResource = task[gantt.config.resource_property],
				selectedResource = store.getSelectedId();
			if (taskResource == selectedResource || store.isChildOf(taskResource, selectedResource)) {
				return true;
			}
		}
function getCapacity(date, resource) {
			/* it is sample function your could to define your own function for get Capability of resources in day */
			// 1st level - resource groups
			// 2nd level - resources
			// 3rd level - assigned tasks
			if (resource.$level !== 1) {
				return -1;
			}

			var val = date.valueOf();
			if (!cap[val + resource.id]) {
				cap[val + resource.id] = [0, 1, 2, 3][Math.floor(Math.random() * 100) % 4];
			}
			return cap[val + resource.id] * WORK_DAY;
		}

		gantt.templates.histogram_cell_class = function(start_date, end_date, resource, tasks) {
			if(resource.$level === 1){
				if (getAllocatedValue(tasks, resource) > getCapacity(start_date, resource)) {
					return "column_overload";
				}
			}else if(resource.$level === 2){
				return "resource_task_cell";
			}
		};

		gantt.templates.histogram_cell_label = function(start_date, end_date, resource, tasks) {
			if (tasks.length && resource.$level === 1) {
				return getAllocatedValue(tasks, resource) + "/" + getCapacity(start_date, resource);
			} else if (resource.$level === 0) {
				return '';
			}else if (resource.$level === 2) {
				if(gantt.isWorkTime({date: start_date, task: gantt.getTask(resource.$task_id)})){
					if(start_date.valueOf() < resource.end_date.valueOf() &&
						end_date.valueOf() > resource.start_date.valueOf()){
						var assignment = gantt.getResourceAssignments(resource.$resource_id, resource.$task_id)[0];
						return assignment.value;
					}else{
						return '&ndash;'
					}
				}
			}
			return '&ndash;';

		};
		gantt.templates.histogram_cell_allocated = function(start_date, end_date, resource, tasks) {
			return getAllocatedValue(tasks, resource);
		};

		gantt.templates.histogram_cell_capacity = function(start_date, end_date, resource, tasks) {
			if (!gantt.isWorkTime(start_date)) {
				return 0;
			}
			return getCapacity(start_date, resource);
		};

		function shouldHighlightResource(resource) {
			var selectedTaskId = gantt.getState().selected_task;
			if (gantt.isTaskExists(selectedTaskId)) {
				var selectedTask = gantt.getTask(selectedTaskId),
					selectedResource = selectedTask[gantt.config.resource_property];

				if (resource.id == selectedResource) {
					return true;
				} else if (gantt.$resourcesStore.isChildOf(selectedResource, resource.id)) {
					return true;
				}
			}
			return false;
		}

	var resourceTemplates = {
			grid_row_class: function(start, end, resource) {
				var css = [];
				if (resource.$level === 0) {
					css.push("folder_row");
					css.push("group_row");
				}
				if (shouldHighlightResource(resource)) {
					css.push("highlighted_resource");
				}
				return css.join(" ");
			},
			task_row_class: function(start, end, resource) {
				var css = [];
				if (shouldHighlightResource(resource)) {
					css.push("highlighted_resource");
				}
				if (resource.$level === 0) {
					css.push("group_row");
				}

				return css.join(" ");
			}
		};
const resourcesStore = gantt.createDatastore({
    name: gantt.config.resource_store,
    type: "treeDatastore",
    initItem: function (item) {
        item.parent = item.parent || gantt.config.root_id;
        item[gantt.config.resource_property] = item.parent;
        item.open = true;
        return item;
    }
});


resourcesStore.attachEvent("onParse", function () {
    const people = [];
    resourcesStore.eachItem(function (res) {
        if (!resourcesStore.hasChild(res.id)) {
            const copy = gantt.copy(res);
            copy.key = res.id;
            copy.label = res.text;
            people.push(copy);
        }
    });
    gantt.updateCollection("people", people);
});

resourcesStore.parse(
owners
);
