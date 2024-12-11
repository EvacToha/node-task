import { Dialog } from "@progress/kendo-react-dialogs";
import React, { useState } from "react";
import {
  TreeView,
  TreeViewExpandChangeEvent,
} from "@progress/kendo-react-treeview";

import { ModalTreeProps, NodeFilterProps } from "../interfaces";

const TreeFilter = ({ node, callbackFilter }: NodeFilterProps) => {
  if (!callbackFilter(node)) {
    return false;
  }
  node.children = node.children?.filter((child) =>
    TreeFilter({ node: child, callbackFilter })
  );
  return true;
};

const ModalTree = ({ tree, callbackFilter }: ModalTreeProps) => {
  const [data, setData] = useState(
    tree.filter((n) => TreeFilter({ node: n, callbackFilter }))
  );

  const onExpandChange = (event: TreeViewExpandChangeEvent) => {
    event.item.expanded = !event.item.expanded;
    setData([...data]);
  };

  return (
    <Dialog title={"Дерево узлов"}>
      <TreeView
        data={data}
        textField={"name"}
        childrenField={"children"}
        expandIcons={true}
        onExpandChange={onExpandChange}
      />
    </Dialog>
  );
};

export default ModalTree;
