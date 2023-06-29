import { gantt } from '../codebase/dhtmlxgantt';

export const weekScaleTemplate = function (date: any) {
  const dateToStr = gantt.date.date_to_str('%d %D');
  const endDate = gantt.date.add(gantt.date.add(date, 5, 'day'), -1, 'day');
  return dateToStr(date) + ' - ' + dateToStr(endDate);
};
