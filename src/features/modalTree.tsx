import { Window } from "@progress/kendo-react-dialogs";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  TreeView,
  TreeViewContextMenuEvent,
  TreeViewExpandChangeEvent,
  TreeViewItemClickEvent,
} from "@progress/kendo-react-treeview";

import {
  ModalTreeProps,
  NodeFilterProps,
  Sample,
  TreeViewDataItem,
} from "../interfaces";

import { Grid, GridColumn as Column } from "@progress/kendo-react-grid";
import { apiClient } from "../axios";

import {
  HorizontalContainer,
  StyledGrid,
  StyledTreeView,
} from "../styles/modalWindowStyle";
import { Offset, Popup } from "@progress/kendo-react-popup";
import { Menu, MenuItem } from "@progress/kendo-react-layout";

const treeFilter = ({ node, callbackFilter }: NodeFilterProps) => {
  if (!callbackFilter(node)) {
    return false;
  }
  node.children = node.children?.filter((child) =>
    treeFilter({ node: child, callbackFilter })
  );
  return true;
};

const allIndexesParent = (item: TreeViewDataItem): number[] => {
  return [
    item.id,
    ...item.children!.flatMap((child: TreeViewDataItem) =>
      allIndexesParent(child)
    ),
  ];
};

const ModalTree = ({ tree, callbackFilter }: ModalTreeProps) => {
  const data = useMemo(
    () => tree.filter((n) => treeFilter({ node: n, callbackFilter })),
    [tree, callbackFilter]
  );
  const offSet = useRef<Offset>({ left: 0, top: 0 });
  const [show, setShow] = useState(false);

  const [samples, setSamples] = useState<Map<number, Sample[]>>(new Map());

  const [nodesSelected, setNodesSelected] = useState<number[]>([]);
  const [nodesExpanded, setNodesExpanded] = useState<number[]>([]);

  useEffect(() => {
    document.addEventListener("click", () => {
      if (show) {
        setShow(() => false);
      }
    });
  }, [show]);

  const fetchSampleById = async (id: number) => {
    if (samples.has(id)) {
      return;
    }

    try {
      const jwt = localStorage.getItem("jwt");
      const response = await apiClient.get<Sample[]>(`/sample/${id}`, {
        headers: { Authorization: `Bearer ${jwt}` },
      });

      setSamples((prevMap) => {
        const newMap = new Map(prevMap);
        newMap.set(id, response.data);
        return newMap;
      });
    } catch (err) {
      console.error("Error:", (err as Error).message);
    }
  };

  const fetchSampleByIds = async (ids: number[]) => {
    const notCashedIds: number[] = [];
    for (let i = 0; i < ids.length; i++) {
      if (!samples.has(ids[i])) {
        notCashedIds.push(ids[i]);
      }
    }
    if (notCashedIds.length === 0) {
      return;
    }

    try {
      const jwt = localStorage.getItem("jwt");
      const response = await apiClient.post<Sample[]>(
        "/sample/by-node-ids",
        notCashedIds,
        {
          headers: { Authorization: `Bearer ${jwt}` },
        }
      );

      setSamples((prevMap) => {
        const newMap = new Map(prevMap);
        for (let i = 0; i < notCashedIds.length; i++) {
          newMap.set(
            notCashedIds[i],
            response.data.filter((n) => n.nodeId === notCashedIds[i])
          );
        }
        return newMap;
      });
    } catch (err) {
      console.error("Error:", (err as Error).message);
    }
  };

  const onExpandChange = (event: TreeViewExpandChangeEvent) => {
    if (!nodesExpanded.includes(event.item.id)) {
      setNodesExpanded((prevNodes) => [...prevNodes, event.item.id]);
      return;
    }
    setNodesExpanded((prevNodes) =>
      prevNodes.filter((item) => item !== event.item.id)
    );
  };

  const handleContextMenu = (e: TreeViewContextMenuEvent) => {
    e.syntheticEvent.preventDefault();

    if (e.itemID.length !== 1) {
      offSet.current = {
        left: e.syntheticEvent.clientX,
        top: e.syntheticEvent.clientY,
      };
      setShow((prevState) => !prevState);
    }
  };

  const onItemClick = async (event: TreeViewItemClickEvent) => {
    if (event.itemHierarchicalIndex.length === 1) {
      if (!nodesSelected.includes(event.item.id)) {
        const indexes = allIndexesParent(event.item);
        await fetchSampleByIds(indexes);
        setNodesSelected((prevNodes) => [
          ...prevNodes,
          ...indexes.filter((item) => !prevNodes.includes(item)),
        ]);
        return;
      }
      const indexes = allIndexesParent(event.item);
      setNodesSelected((prevNodes) =>
        prevNodes.filter((item) => !indexes.includes(item))
      );
      return;
    }
    if (!nodesSelected.includes(event.item.id)) {
      await fetchSampleById(event.item.id);
      setNodesSelected((prevNodes) => [...prevNodes, event.item.id]);
      return;
    }
    setNodesSelected((prevNodes) =>
      prevNodes.filter((item) => item !== event.item.id)
    );
  };

  const treeSelect = (node: TreeViewDataItem) => {
    node.selected = nodesSelected.includes(node.id);
    node.children?.forEach((child: TreeViewDataItem) => {
      treeSelect(child);
    });
  };

  const treeExpand = (node: TreeViewDataItem) => {
    node.expanded = nodesExpanded.includes(node.id);
    node.children?.forEach((child: TreeViewDataItem) => {
      treeExpand(child);
    });
  };

  const processData = () => {
    data.forEach((node) => treeSelect(node));
    data.forEach((node) => treeExpand(node));
    return data;
  };

  const processSamples = () => {
    return nodesSelected.flatMap((node) => samples.get(node));
  };

  return (
    <Window title={"Дерево узлов"} height={800} width={1200}>
      <HorizontalContainer>
        <StyledTreeView>
          <TreeView
            data={processData()}
            expandIcons={true}
            onExpandChange={onExpandChange}
            onItemClick={onItemClick}
            textField={"name"}
            childrenField={"children"}
            onContextMenu={handleContextMenu}
          />
        </StyledTreeView>
        <StyledGrid>
          <Grid data={processSamples()}>
            <Column field={"name"} title={"Название"} />
            <Column field={"createDate"} title={"Дата создания"} />
            <Column field={"createdBy"} title={"Кем создан"} />
          </Grid>
        </StyledGrid>
      </HorizontalContainer>
      <Popup show={show} offset={offSet.current}>
        <Menu vertical={true} style={{ display: "inline-block" }}>
          <MenuItem text="Создать объект"></MenuItem>
        </Menu>
      </Popup>
    </Window>
  );
};

export default ModalTree;
