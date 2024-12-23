﻿import React, { useEffect, useState } from "react";

import ModalTree from "../features/modalTree";

import { TreeViewDataItem } from "../interfaces";

import { apiClient } from "../axios";

export const ModalKendoPage = () => {
  const [tree, setTree] = useState<TreeViewDataItem[]>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNodes = async () => {
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
    fetchNodes();
  }, []);

  if (isLoading) return <div>Загрузка.</div>;
  if (error) return <div>Ошибка: {error}</div>;

  return (
    <>
      <ModalTree tree={tree!} callbackFilter={() => true} />
    </>
  );
};
