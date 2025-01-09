import { GridCustomCellProps } from "@progress/kendo-react-grid";

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
  id: number | null;
  nodeId: number;
  name: string;
  createDate: Date;
  createdBy: string;
  inEdit?: boolean;
}

export interface Token {
  token: string;
}

export interface ErrorData {
  message: string;
}

export interface CommandCellProps extends GridCustomCellProps {
  add: (item: Sample) => void;
  discard: () => void;
}
