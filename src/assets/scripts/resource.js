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


// gantt.attachEvent("onBeforeTaskDisplay", function (id, task) {
//     if (selectedResource) {
//         let showTask = false;
//         const assignments = gantt.getTaskAssignments(id);
//         assignments.forEach(function (assignment) {
//             if (assignment.resource_id == selectedResource) {
//                 showTask = true;
//             }
//         })
//         return showTask;
//     }
//     return true;
// });
gantt.config.reorder_grid_columns = true;

const resourceConfig = {
    columns: [
        {
            name: "name", label: "Nome", tree: true, template: function (resource) {
                return resource.text;
            }
        },
		{
				name: "workload", label: "Workload", template: function (resource) {
					var tasks;
					var store = gantt.getDatastore(gantt.config.resource_store),
						field = gantt.config.resource_property;

					if (store.hasChild(resource.id)) {
						tasks = gantt.getTaskBy(field, store.getChildren(resource.id));
					} else {
						tasks = gantt.getTaskBy(field, resource.id);
					}

					var totalDuration = 0;
					for (var i = 0; i < tasks.length; i++) {
						totalDuration += tasks[i].duration;
					}

					return (totalDuration || 0) * 8 + "h";
				}
			}
    ]
};

gantt.templates.resource_cell_class = function(start_date, end_date, resource, tasks){
		var css = [];
		css.push("resource_marker");
		if (tasks.length <= 1) {
			css.push("workday_ok");
		} else {
			css.push("workday_over");
		}
		return css.join(" ");
	};
	gantt.templates.resource_cell_value = function(start_date, end_date, resource, tasks){
		var result = 0;
		tasks.forEach(function(item) {
			var assignments = gantt.getResourceAssignments(resource.id, item.id);
			assignments.forEach(function(assignment){
				var task = gantt.getTask(assignment.task_id);
				if(resource.type == "work"){
					result += assignment.value * 1;
				}else{
					result += assignment.value / (task.duration || 1);
				}
			});
		});

		if(result % 1){
      console.log(result)
			result = Math.round(result * 10)/10;
		}
		return "<div>" + result + "</div>";
	};


// gantt.locale.labels.section_resources = "Owners";
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
				gravity: 2,
				cols: [
					{view: "grid", group:"grids", scrollY: "scrollVer"},
					{resizer: true, width: 1},
					{view: "timeline", scrollX: "scrollHor", scrollY: "scrollVer"},
					{view: "scrollbar", id: "scrollVer", group:"vertical"}
				]
			},
			{ resizer: true, width: 1, next: "resources"},
			{
				height: 35,
				cols: [
					{ html:"", group:"grids"},
					{ resizer: true, width: 1},
					{ html:""}
				]
			},

			{
				gravity:1,
				id: "resources",
				config: resourceConfig,
				templates: resourceTemplates,
				cols: [
					{ view: "resourceGrid", group:"grids", scrollY: "resourceVScroll" },
					{ resizer: true, width: 1},
					{ view: "resourceTimeline", scrollX: "scrollHor", scrollY: "resourceVScroll"},
					{ view: "scrollbar", id: "resourceVScroll", group:"vertical"}
				]
			},
			{view: "scrollbar", id: "scrollHor"}
		]
	};
	// function shouldHighlightTask(task) {
	// 		var store = gantt.$resourcesStore;
	// 		var taskResource = task[gantt.config.resource_property],
	// 			selectedResource = store.getSelectedId();
	// 		if (taskResource == selectedResource || store.isChildOf(taskResource, selectedResource)) {
	// 			return true;
	// 		}
	// 	}

	// 	gantt.templates.histogram_cell_class = function(start_date, end_date, resource, tasks) {
	// 		if(resource.$level === 1){
	// 			if (getAllocatedValue(tasks, resource) > getCapacity(start_date, resource)) {
	// 				return "column_overload";
	// 			}
	// 		}else if(resource.$level === 2){
	// 			return "resource_task_cell";
	// 		}
	// 	};

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


// const resourcesStore = gantt.createDatastore({
//     name: gantt.config.resource_store,
//     type: "treeDatastore",
//     initItem: function (item) {
//         item.parent = item.parent || gantt.config.root_id;
//         item[gantt.config.resource_property] = item.parent;
//         item.open = true;
//         return item;
//     }
// });


// resourcesStore.attachEvent("onParse", function () {
//     const people = [];
//     resourcesStore.eachItem(function (res) {
//         if (!resourcesStore.hasChild(res.id)) {
//             const copy = gantt.copy(res);
//             copy.key = res.id;
//             copy.label = res.text;
//             people.push(copy);
//         }
//     });
//     gantt.updateCollection("people", people);
// });

// resourcesStore.parse(
// owners
// );



gantt.$resourcesStore = gantt.createDatastore({
		name: gantt.config.resource_store,
		type: "treeDatastore",
		initItem: function (item) {
			item.parent = item.parent || gantt.config.root_id;
			item[gantt.config.resource_property] = item.parent;
			item.open = true;
			return item;
		}
	});


	gantt.$resourcesStore.attachEvent("onFilterItem", function(id, item) {
		return gantt.getResourceAssignments(id).length > 0;
	});

	gantt.init("gantt_here");

	gantt.$resourcesStore.attachEvent("onParse", function(){
		var people = [];
		gantt.$resourcesStore.eachItem(function(res){
			if(!gantt.$resourcesStore.hasChild(res.id)){
				var copy = gantt.copy(res);
				copy.key = res.id;
				copy.label = res.text;
				people.push(copy);
			}
		});
		gantt.updateCollection("people", people);
	});
	gantt.attachEvent("onParse", function(){
		gantt.render();
	});
	gantt.$resourcesStore.parse(owners);
