  gantt.config.layout = {
      css: "gantt_container",
      cols: [
        {
          width: 620,
          min_width: 400,

          // adding horizontal scrollbar to the grid via the scrollX attribute
          rows: [
            {
              view: "grid",
              scrollX: "gridScroll",
              scrollable: true,
              scrollY: "scrollVer",
            },
            { view: "scrollbar", id: "gridScroll", group: "horizontalScrolls" },
          ],
        },
        { resizer: true, width: 1 },
        {
          rows: [
            { view: "timeline", scrollX: "scrollHor", scrollY: "scrollVer" },
            { view: "scrollbar", id: "scrollHor", group: "horizontalScrolls" },
          ],
        },
        { view: "scrollbar", id: "scrollVer" },
      ],
    };
