import React from 'react'

import ModalTree from "../features/modalTree";
import {tree} from "../data/nodes";


export const ModalKendoPage = () => {
    return (
        <div>
            <ModalTree tree={tree}
                       callbackFilter={(n) => n.type === "Шаблон" && (n.name === "Шаблоны" || n.name.endsWith("1"))}/>
        </div>
    );
}