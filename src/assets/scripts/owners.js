 const owners = [
    { id: 1, text: "QA", parent: null },
    { id: 2, text: "Development", parent: null },
    { id: 3, text: "Sales", parent: null },
    { id: 6, text: "Mauro", parent: 1, textColor: "#123123",  backgroundColor: "yellowgreen", unit: "hours/day" },
    { id: 7, text: "Mike", parent: 2, unit: "hours/day" },
    { id: 8, text: "Anna", parent: 2,   textColor: "#222",  backgroundColor: "salmon",unit: "hours/day" },
    { id: 9, text: "Bill", parent: 3, unit: "hours/day" },
    { id: 10, text: "Floe", parent: 3, unit: "hours/day" }
];
// { key: "0", label: "Generico", textColor: "", backgroundColor: "" },
// { key: "2", label: "Mauro", textColor: "#123123", backgroundColor: "yellowgreen", img: "./icons/mauro2.png" },
// { key: "2", label: "Gino", textColor: "#222", backgroundColor: "salmon", img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTlQ1V5kkouyC45gWlY3i9zqBwfpCMtuszT-HhO4MTJpBxjnDxc" },
// { key: "3", label: "Anna", textColor: "#222", backgroundColor: "gold", img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQnHw3Nnn0bk_14iTK00_u5wLpI2-ARjQdVpyVeDo2Nc6TOlCq7" },
