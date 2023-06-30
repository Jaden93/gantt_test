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

const resourceConfig = {
    columns: [
        {
            name: "name", label: "Name", tree: true, template: function (resource) {
                return resource.text;
            }
        },
        {
            name: "workload", label: "Workload", template: function (resource) {
                let totalDuration = 0;
                if (resource.$level == 2) {
                    const assignment = gantt.getResourceAssignments(resource.$resource_id, resource.$task_id)[0];
                    totalDuration = resource.duration * assignment.value;
                } else {
                    const assignments = getResourceAssignments(resource.id);
                    assignments.forEach(function (assignment) {
                        const task = gantt.getTask(assignment.task_id);
                        totalDuration += Number(assignment.value) * task.duration;
                    });
                }

                return (totalDuration || 0) + "h";
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
