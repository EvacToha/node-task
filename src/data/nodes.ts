import {TreeViewDataItem} from "../interfaces";

export const tree : TreeViewDataItem[] = [

    {name: "Шаблоны", type: "Шаблон", children: [{name: "Шаблон 1", type: "Шаблон", children: []}, {name: "Шаблон 2", type: "Шаблон", children: []}, {name: "Шаблон 3", type: "Шаблон", children: []}]},
    {name: "Изделия", type: "Изделие", children: [{name: "Изделие 1", type: "Изделие", children: []}, {name: "Изделие 2", type: "Изделие", children: []}]},
    {name: "Документы", type: "Документ", children: [{name: "Документ 1", type: "Документ", children: []}, {name: "Документ 2", type: "Документ", children: []}, {name: "Документ 3", type: "Документ", children: []}, {name: "Документ 4", type: "Документ", children: []}]}

];