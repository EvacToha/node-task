import { NodeFilterProps, TreeViewDataItem } from "../interfaces";

export const treeFilter = ({ node, callbackFilter }: NodeFilterProps) => {
  if (!callbackFilter(node)) {
    return false;
  }
  node.children = node.children?.filter((child) =>
    treeFilter({ node: child, callbackFilter })
  );
  return true;
};

export const allIndexesParent = (item: TreeViewDataItem): number[] => {
  return [
    item.id,
    ...item.children!.flatMap((child: TreeViewDataItem) =>
      allIndexesParent(child)
    ),
  ];
};
