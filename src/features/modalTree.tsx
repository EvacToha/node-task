import { Window } from "@progress/kendo-react-dialogs";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  TreeView,
  TreeViewContextMenuEvent,
  TreeViewExpandChangeEvent,
  TreeViewItemClickEvent,
} from "@progress/kendo-react-treeview";

import {
  CommandCellProps,
  ModalTreeProps,
  Sample,
  TreeViewDataItem,
} from "../interfaces";

import {
  getSelectedState,
  Grid,
  GridColumn as Column,
  GridContextMenuEvent,
  GridItemChangeEvent,
  GridSelectionChangeEvent,
} from "@progress/kendo-react-grid";

import {
  HorizontalContainer,
  StyledGrid,
  StyledTreeView,
} from "../styles/modalWindowStyle";
import { Offset, Popup } from "@progress/kendo-react-popup";
import { Menu, MenuItem, MenuSelectEvent } from "@progress/kendo-react-layout";
import { MyCommandCell } from "./myCommandCell";
import {
  fetchAddSample,
  fetchDeleteSamples,
  fetchSampleById,
  fetchSampleByIds,
} from "../services/apiService";
import { allIndexesParent, treeFilter } from "../helpers/treeHelpers";
import { getter } from "@progress/kendo-react-common";

const editField = "inEdit";
const DATA_ITEM_KEY = "id";
const SELECTED_FIELD = "selected";
const idGetter = getter(DATA_ITEM_KEY);

const CommandCell = (props: CommandCellProps) => {
  const { add, discard } = props;
  return <MyCommandCell {...props} add={add} discard={discard} />;
};

const ModalTree = ({ tree, callbackFilter }: ModalTreeProps) => {
  const data = useMemo(
    () => tree.filter((n) => treeFilter({ node: n, callbackFilter })),
    [tree, callbackFilter]
  );
  const treeOffSet = useRef<Offset>({ left: 0, top: 0 });
  const gridOffSet = useRef<Offset>({ left: 0, top: 0 });

  const [showTreeContextMenu, setShowTreeContextMenu] = useState(false);
  const [showGridContextMenu, setShowGridContextMenu] = useState(false);
  const [prevSample, setPrevSample] = useState<Sample>();

  const [samples, setSamples] = useState<Sample[]>(() => {
    const tempSamples: Sample[] = JSON.parse(
      localStorage.getItem("samples") || ""
    );

    // const storagePrevSample: Sample | null = (() => {
    //   const storedData = localStorage.getItem("prevSample");
    //   return storedData ? (JSON.parse(storedData) as Sample) : null;
    // })();
    //
    // if (storagePrevSample) {
    //   tempSamples = tempSamples.map((s) =>
    //     s.id === storagePrevSample.id ? storagePrevSample : s
    //   );
    // }
    return tempSamples.map((s) => ({
      ...s,
      createDate: new Date(s.createDate),
    }));
  });

  const [selectedSamples, setSelectedSamples] = React.useState<{
    [id: string]: boolean | number[];
  }>({});
  const [cachedSamples, setCachedSamples] = useState<number[]>(() =>
    (localStorage.getItem("cachedSamples") || "")
      .split(",")
      .filter(Boolean)
      .map(Number)
  );
  const [selectedNodes, setSelectedNodes] = useState<number[]>(() =>
    (localStorage.getItem("selectedNodes") || "")
      .split(",")
      .filter(Boolean)
      .map(Number)
  );
  const [expandedNodes, setExpandedNodes] = useState<number[]>(() =>
    (localStorage.getItem("expandedNodes") || "")
      .split(",")
      .filter(Boolean)
      .map(Number)
  );
  const [selectedNode, setSelectedNode] = useState<number>(0);

  useEffect(() => {
    const hideTreeContextMenu = () => setShowTreeContextMenu(false);
    document.addEventListener("click", hideTreeContextMenu);
    return () => document.removeEventListener("click", hideTreeContextMenu);
  }, []);

  useEffect(() => {
    const hideGridContextMenu = () => setShowGridContextMenu(false);
    document.addEventListener("click", hideGridContextMenu);
    return () => document.removeEventListener("click", hideGridContextMenu);
  }, []);

  useEffect(() => {
    localStorage.setItem("expandedNodes", expandedNodes.toString());
  }, [expandedNodes]);
  useEffect(() => {
    localStorage.setItem("selectedNodes", selectedNodes.toString());
  }, [selectedNodes]);
  useEffect(() => {
    localStorage.setItem("cachedSamples", cachedSamples.toString());
  }, [cachedSamples]);
  useEffect(() => {
    localStorage.setItem("samples", JSON.stringify(samples));
  }, [samples]);
  useEffect(() => {
    localStorage.setItem("prevSample", JSON.stringify(prevSample));
  }, [prevSample]);

  const handleContextMenu = (e: TreeViewContextMenuEvent) => {
    e.syntheticEvent.preventDefault();

    if (e.itemID.length !== 1) {
      treeOffSet.current = {
        left: e.syntheticEvent.clientX,
        top: e.syntheticEvent.clientY,
      };
      setShowTreeContextMenu((prev) => !prev);
      setSelectedNode(e.item.id);
    }
  };

  const handleGridContextMenu = (e: GridContextMenuEvent) => {
    e.syntheticEvent.preventDefault();

    if (selectedSamples[e.dataItem.id]) {
      gridOffSet.current = {
        left: e.syntheticEvent.clientX,
        top: e.syntheticEvent.clientY,
      };
      setShowGridContextMenu((prev) => !prev);
    }
  };

  const handleTreeSelectMenu = (e: MenuSelectEvent) => {
    switch (e.itemId) {
      case "0":
        handleAddSample();
        break;
    }
  };

  const handleAddSample = () => {
    if (!selectedNodes.includes(selectedNode)) {
      return;
    }

    setSamples((prev) => {
      return [
        {
          id: null,
          nodeId: selectedNode,
          createdBy: "",
          createDate: new Date(Date.now()),
          name: "",
          inEdit: true,
        },
        ...prev,
      ];
    });
  };

  const handleGridSelectMenu = async () => {
    await handleDeleteSample();
  };

  const handleDeleteSample = async () => {
    const samplesIds: number[] = [];
    for (const i in selectedSamples) {
      if (selectedSamples[i]) samplesIds.push(+i);
    }
    await fetchDeleteSamples(samplesIds, setSamples);
  };

  const add = async (item: Sample) => {
    discard();

    const response = await fetchAddSample(item, selectedNode);
    item.inEdit = false;
    item.createdBy = response.createdBy;
    item.id = response.id;

    setSamples((prev) => [...prev.filter((s) => s.id !== item.id), item]);
  };

  const discard = () => {
    setSamples((prev) => {
      return prev.filter((s) => s.id !== null);
    });
  };

  const commandCellProps = {
    add: add,
    discard: discard,
  };

  const itemChange = (event: GridItemChangeEvent) => {
    const newSamples = samples.map((sample) =>
      sample.id === event.dataItem.id
        ? {
            ...sample,
            [event.field || ""]: event.value,
          }
        : sample
    );
    setSamples(newSamples);
  };

  const onExpandChange = (e: TreeViewExpandChangeEvent) => {
    if (!expandedNodes.includes(e.item.id)) {
      setExpandedNodes((prev) => [...prev, e.item.id]);
      return;
    }
    setExpandedNodes((prev) => prev.filter((item) => item !== e.item.id));
  };

  const onItemClick = async (e: TreeViewItemClickEvent) => {
    discard();

    if (e.itemHierarchicalIndex.length === 1) {
      if (!selectedNodes.includes(e.item.id)) {
        const indexes = allIndexesParent(e.item);

        await fetchSampleByIds(
          indexes,
          cachedSamples,
          setSamples,
          setCachedSamples
        );

        setSelectedNodes((prev) => [
          ...prev,
          ...indexes.filter((item) => !prev.includes(item)),
        ]);
        return;
      }
      const indexes = allIndexesParent(e.item);
      setSelectedNodes((prev) =>
        prev.filter((item) => !indexes.includes(item))
      );
      return;
    }
    if (!selectedNodes.includes(e.item.id)) {
      await fetchSampleById(
        e.item.id,
        cachedSamples,
        setSamples,
        setCachedSamples
      );

      setSelectedNodes((prev) => [...prev, e.item.id]);
      return;
    }
    setSelectedNodes((prev) => prev.filter((item) => item !== e.item.id));
  };

  const onSelectionChange = (e: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event: e,
      selectedState: selectedSamples,
      dataItemKey: DATA_ITEM_KEY,
    });
    let currentSamples = samples.map((s) => ({ ...s, inEdit: false }));

    const selectedStateKeys = Object.keys(selectedSamples);
    const newSelectedStateKeys = Object.keys(newSelectedState);

    if (
      selectedStateKeys.length === 1 &&
      newSelectedStateKeys.length === 1 &&
      selectedStateKeys[0] === newSelectedStateKeys[0]
    ) {
      setPrevSample(samples.find((s) => s.id === +selectedStateKeys[0]));

      currentSamples = currentSamples.map((s) =>
        s.id === +selectedStateKeys[0] ? { ...s, inEdit: true } : s
      );
    }

    setSamples(currentSamples);
    setSelectedSamples(newSelectedState);
  };

  const updateNodeState = (
    node: TreeViewDataItem,
    stateKey: "selected" | "expanded"
  ) => {
    node[stateKey] =
      stateKey === "selected"
        ? selectedNodes.includes(node.id)
        : expandedNodes.includes(node.id);

    node.children?.forEach((child: TreeViewDataItem) => {
      updateNodeState(child, stateKey);
    });
  };

  const processData = () => {
    data.forEach((node) => {
      updateNodeState(node, "selected");
      updateNodeState(node, "expanded");
    });
    return data;
  };

  const processSamples = () => {
    let procSamples = selectedNodes.flatMap((node) =>
      samples.filter((s) => s.nodeId === node)
    );
    procSamples = procSamples.map((s) => ({
      ...s,
      [SELECTED_FIELD]: selectedSamples[idGetter(s)],
    }));

    return procSamples;
  };

  return (
    <Window title={"Дерево узлов"} height={700} width={1200}>
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
          <Grid
            data={processSamples()}
            onItemChange={itemChange}
            editField={editField}
            dataItemKey={DATA_ITEM_KEY}
            selectedField={SELECTED_FIELD}
            selectable={{
              enabled: true,
              drag: true,
              mode: "multiple",
            }}
            onSelectionChange={onSelectionChange}
            onContextMenu={handleGridContextMenu}
          >
            <Column field={"id"} title={"Номер"} width={100} editable={false} />
            <Column field={"name"} title={"Название"} />
            <Column
              field={"createDate"}
              title={"Дата создания"}
              format="{0:MM/dd/yyyy}"
              editor="date"
            />
            <Column field={"createdBy"} title={"Кем создан"} editable={false} />
            <Column
              cells={{
                data: (props) => (
                  <CommandCell {...props} {...commandCellProps} />
                ),
              }}
              width="200px"
            />
          </Grid>
        </StyledGrid>
      </HorizontalContainer>
      <Popup show={showTreeContextMenu} offset={treeOffSet.current}>
        <Menu
          onSelect={handleTreeSelectMenu}
          vertical={true}
          style={{ display: "inline-block" }}
        >
          <MenuItem text="Создать объект"></MenuItem>
        </Menu>
      </Popup>
      <Popup show={showGridContextMenu} offset={gridOffSet.current}>
        <Menu
          onSelect={handleGridSelectMenu}
          vertical={true}
          style={{ display: "inline-block" }}
        >
          <MenuItem text="Удалить"></MenuItem>
        </Menu>
      </Popup>
    </Window>
  );
};

export default ModalTree;
