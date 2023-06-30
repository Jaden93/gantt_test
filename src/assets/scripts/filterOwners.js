
    const dropdownFilter = document.querySelector(".dropdown_filter");

    if (dropdownFilter){
    dropdownFilter.addEventListener("change", function (e) {
      updateFilter(e.target.value);
    });
owners.forEach(function (item) {
      const el = document.createElement("option");
      el.value = item.text;
      el.innerHTML = item.text;
      dropdownFilter.appendChild(el);
    });
  }

    function findById(ownerId) {
      for (let i = 0; i < owners.length; i++) {
        if (owners[i].id == ownerId) {
          return owners[i];
        }
      }
      return owners[0];
    }
    function colorizeTask(task) {
      if (task.owner[0]?.resource_id) {
          let owner = findById(task.owner[0].resource_id);
          task.color = owner.backgroundColor;
          task.textColor = owner.textColor;
      }
    }
