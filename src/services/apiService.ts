import { Sample, TreeViewDataItem } from "../interfaces";
import { jwtDecode } from "jwt-decode";
import { apiClient } from "../axios";
import { SetStateAction } from "react";

export const fetchAddSample = async (item: Sample, nodeId: number) => {
  const sampleDto = {
    name: item.name,
    createDate: item.createDate,
    nodeId: nodeId,
  };
  const jwt = localStorage.getItem("jwt")!;
  const queryString = jwtDecode(jwt).sub!;
  const queryParams = { login: queryString };
  try {
    const response = await apiClient.post("/Sample/add-sample", sampleDto, {
      params: queryParams,
      headers: { Authorization: `Bearer ${jwt}` },
    });

    return response.data;
  } catch (err) {
    console.error("Error:", (err as Error).message);
  }
};

export const fetchDeleteSamples = async (
  ids: number[],
  setSamples: (value: SetStateAction<Sample[]>) => void
) => {
  const jwt = localStorage.getItem("jwt")!;

  try {
    const response = await apiClient.post("/Sample/delete-samples", ids, {
      headers: { Authorization: `Bearer ${jwt}` },
    });

    const deletedIds: number[] = response.data.deletedIds;
    setSamples((prev) => prev.filter((s) => !deletedIds.includes(s.id!)));
  } catch (err) {
    console.error("Error:", (err as Error).message);
  }
};

export const fetchSampleByIds = async (
  ids: number[],
  cachedSamples: number[],
  setSamples: (value: SetStateAction<Sample[]>) => void,
  setCachedSamples: (value: SetStateAction<number[]>) => void
) => {
  const notCachedIds: number[] = [];
  for (let i = 0; i < ids.length; i++) {
    if (!cachedSamples.includes(ids[i])) {
      notCachedIds.push(ids[i]);
    }
  }
  if (notCachedIds.length === 0) {
    return;
  }

  try {
    const jwt = localStorage.getItem("jwt");
    const response = await apiClient.post<Sample[]>(
      "/sample/by-node-ids",
      notCachedIds,
      {
        headers: { Authorization: `Bearer ${jwt}` },
      }
    );

    const responseData = response.data.map((s) => ({
      ...s,
      createDate: new Date(s.createDate),
    }));

    setSamples((prev) => {
      return [...responseData, ...prev];
    });
    setCachedSamples((prev) => [...prev, ...notCachedIds]);
  } catch (err) {
    console.error("Error:", (err as Error).message);
  }
};

export const fetchSampleById = async (
  id: number,
  cachedSamples: number[],
  setSamples: (value: SetStateAction<Sample[]>) => void,
  setCachedSamples: (value: SetStateAction<number[]>) => void
) => {
  if (cachedSamples.includes(id)) {
    return;
  }

  try {
    const jwt = localStorage.getItem("jwt");
    const response = await apiClient.get<Sample[]>(`/sample/${id}`, {
      headers: { Authorization: `Bearer ${jwt}` },
    });

    const responseData = response.data.map((s) => ({
      ...s,
      createDate: new Date(s.createDate),
    }));

    setSamples((prev) => [...responseData, ...prev]);
    setCachedSamples((prev) => [...prev, id]);
  } catch (err) {
    console.error("Error:", (err as Error).message);
  }
};

export const fetchNodes = async (
  setIsLoading: (value: SetStateAction<boolean>) => void,
  setTree: (value: SetStateAction<TreeViewDataItem[] | undefined>) => void,
  setError: (value: SetStateAction<string | null>) => void
) => {
  try {
    setIsLoading(true);
    const jwt = localStorage.getItem("jwt");
    const response = await apiClient.get<TreeViewDataItem[]>("/nodes", {
      headers: { Authorization: `Bearer ${jwt}` },
    });
    setTree(response.data);
  } catch (err) {
    setError(err instanceof Error ? err.message : "Ошибка");
  } finally {
    setIsLoading(false);
  }
};
