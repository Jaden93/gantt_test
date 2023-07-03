 const owners = [
    { id: 1, text: "QA", parent: null },
    { id: 2, text: "Development", parent: null },
    { id: 3, text: "Sales", parent: null },
    { id: 4, text: "Other", parent: null },
    { id: 5, text: "Unassigned", parent: 4 },
    { id: 6,backgroundColor:"#03A9F4", textColor:"#FFF", text: "John", default_value:8, type:"work",parent: 1, unit: "hours/day" },
    { id: 7, text: "Mike", parent: 2, unit: "hours/day" ,default_value:8, type:"work"},
    { id: 8, text: "Anna", parent: 2, unit: "hours/day",default_value:8, type:"work" },
    { id: 9, text: "Bill", parent: 3, unit: "hours/day",default_value:8, type:"work" },
    { id: 10, text: "Floe", parent: 3, unit: "hours/day" ,default_value:8, type:"work"}
];
