export interface TreeViewDataItem {
    name: string;
    type?: string;
    expanded?: boolean;
    children?: TreeViewDataItem[];
}

export interface ModalTreeProps {
    tree: TreeViewDataItem[],
    callbackFilter: (node: TreeViewDataItem) => boolean,
}

export interface NodeFilterProps {
    node: TreeViewDataItem,
    callbackFilter: (node: TreeViewDataItem) => boolean,
}