import React, { useState } from "react";
import { Button } from "@progress/kendo-react-buttons";
import { CommandCellProps } from "../interfaces";
import { Dialog, DialogActionsBar } from "@progress/kendo-react-dialogs";

export const MyCommandCell = (props: CommandCellProps) => {
  const { dataItem } = props;
  const [visible, setVisible] = useState(false);
  const [error, setError] = useState("");

  const toggleDialog = () => {
    setVisible((prev) => !prev);
  };

  const handleAddClick = () => {
    if (!validate()) {
      setVisible(true);
      return;
    }
    props.add(dataItem);
  };

  const validate = () => {
    if (!dataItem.name) {
      setError("Название обязательно.");
      return false;
    }

    const currentDate = new Date();
    if (dataItem.createDate > currentDate) {
      setError("Некорректная дата.");
      return false;
    }

    return true;
  };

  return (
    <td className="k-command-cell">
      {!dataItem.id && (
        <>
          <Button themeColor={"primary"} onClick={handleAddClick}>
            {"Добавить"}
          </Button>
          <Button themeColor={"primary"} onClick={() => props.discard()}>
            {"Отмена"}
          </Button>
        </>
      )}
      {visible && (
        <Dialog title={"Ошибка"} onClose={toggleDialog} width={350}>
          <div>{error}</div>
          <DialogActionsBar>
            <Button onClick={toggleDialog}>Назад</Button>
          </DialogActionsBar>
        </Dialog>
      )}
    </td>
  );
};
