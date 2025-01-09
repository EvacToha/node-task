import React, { useEffect, useState } from "react";

import ModalTree from "../features/modalTree";

import { TreeViewDataItem } from "../interfaces";

import { fetchNodes } from "../services/apiService";

export const ModalKendoPage = () => {
  const [tree, setTree] = useState<TreeViewDataItem[]>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchNodes(setIsLoading, setTree, setError);
  }, []);

  if (isLoading) return <div>Загрузка.</div>;
  if (error) return <div>Ошибка: {error}</div>;

  return (
    <>
      <ModalTree tree={tree!} callbackFilter={() => true} />
    </>
  );
};
