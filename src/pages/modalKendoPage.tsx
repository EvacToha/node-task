import React, { useEffect, useState } from "react";

import ModalTree from "../features/modalTree";

import { TreeViewDataItem } from "../interfaces";
import axios from "axios";

export const ModalKendoPage = () => {
  const [tree, setTree] = useState<TreeViewDataItem[]>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNodes = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get<TreeViewDataItem[]>(
          "http://localhost:5128/api/nodes"
        );
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
