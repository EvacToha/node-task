export interface TreeViewDataItem {
  id: number;
  name: string;
  type?: string;
  expanded?: boolean;
  selected?: boolean;
  children?: TreeViewDataItem[];
}

export interface ModalTreeProps {
  tree: TreeViewDataItem[];
  callbackFilter: (node: TreeViewDataItem) => boolean;
}

export interface NodeFilterProps {
  node: TreeViewDataItem;
  callbackFilter: (node: TreeViewDataItem) => boolean;
}

export interface Sample {
  nodeId: number;
  name: string;
  createDate: string;
  createdBy: string;
}
