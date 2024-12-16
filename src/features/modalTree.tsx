﻿import { Window } from "@progress/kendo-react-dialogs";
import React, { useMemo, useState } from "react";
import {
  TreeView,
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

  const [samples, setSamples] = useState<Map<number, Sample[]>>(new Map());

  const [nodesSelected, setNodesSelected] = useState<number[]>([]);
  const [nodesExpanded, setNodesExpanded] = useState<number[]>([]);

  const fetchSampleById = async (id: number) => {
    if (samples.has(id)) {
      return;
    }
    try {
      const response = await apiClient.get<Sample[]>(`/sample/${id}`);

      const newMap = new Map(samples);
      newMap.set(id, response.data);
      setSamples(newMap);
      console.log(response.data);
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
    if (notCashedIds.length == 0) {
      return;
    }

    try {
      const response = await apiClient.post<Sample[]>(
        "/sample/by-node-ids",
        notCashedIds
      );
      const newMap = new Map(samples);
      for (let i = 0; i < notCashedIds.length; i++) {
        newMap.set(
          notCashedIds[i],
          response.data.filter((n) => n.nodeId === notCashedIds[i])
        );
      }
      setSamples(newMap);
      console.log(response.data);
    } catch (err) {
      console.error("Error:", (err as Error).message);
    }
  };

  const onExpandChange = (event: TreeViewExpandChangeEvent) => {
    if (nodesExpanded.includes(event.item.id)) {
      setNodesExpanded(nodesExpanded.filter((item) => item !== event.item.id));
    } else {
      setNodesExpanded([...nodesExpanded, event.item.id]);
    }
  };

  const onItemClick = (event: TreeViewItemClickEvent) => {
    if (event.itemHierarchicalIndex.length !== 1) {
      if (!nodesSelected.includes(event.item.id)) {
        setNodesSelected([...nodesSelected, event.item.id]);
        fetchSampleById(event.item.id);
      } else {
        setNodesSelected(
          nodesSelected.filter((item) => item !== event.item.id)
        );
      }
    } else {
      if (!nodesSelected.includes(event.item.id)) {
        const indexes = allIndexesParent(event.item);
        setNodesSelected([
          ...nodesSelected,
          ...indexes.filter((item) => !nodesSelected.includes(item)),
        ]);
        fetchSampleByIds(indexes);
      } else {
        const indexes = allIndexesParent(event.item);
        setNodesSelected(
          nodesSelected.filter((item) => !indexes.includes(item))
        );
      }
    }
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
    </Window>
  );
};

export default ModalTree;
