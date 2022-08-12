import React, { useState, useCallback, useEffect } from "react";

import DropZone from "./DropZone";
import TrashDropZone from "./TrashDropZone";
import SideBarItem from "./SideBarItem";
import Row from "./Row";
import initialData from "./initial-data";
import {
  handleMoveWithinParent,
  handleMoveToDifferentParent,
  handleMoveSidebarComponentIntoParent,
  handleRemoveItemFromLayout
} from "./helpers";

import { SIDEBAR_ITEMS, SIDEBAR_ITEM, COMPONENT, COLUMN } from "./constants";
import shortid from "shortid";

// 
// React table
// import {
//   createTable,
//   useTableInstance,
//   getCoreRowModel,
// } from "@tanstack/react-table";
// const STUDENTS = [
//   {
//     id: 1,
//     name: "Adhiraj",
//     age: 13
//   },
//   {
//     id: 2,
//     name: "Mihiraj",
//     age: 19
//   },
//   {
//     id: 3,
//     name: "Shudhiraj",
//     age: 33
//   }
// ];
// const table = createTable();
// const defaultData = [...STUDENTS];
// const defaultColumns = [
//   table.createDataColumn("id", {
//     id: "Id",
//   }),
//   table.createDataColumn("name", {
//     id: "Name",
//   }),
//   table.createDataColumn("age", {
//     id: "Age",
//   })
// ];
// 
// 
const Container = () => {

  // 
  // React table
  // const [data, setData] = useState([...defaultData]);
  // const [columns, setColumns] = useState([...defaultColumns]);

  // const instance = useTableInstance(table, {
  //   data,
  //   columns,
  //   getCoreRowModel: getCoreRowModel(),
  // });
  // console.log("rowModel:", instance.getRowModel());
  // 
  // 

  const initialLayout = initialData.layout;
  const initialComponents = initialData.components;
  const [layout, setLayout] = useState(initialLayout);
  const [components, setComponents] = useState(initialComponents);
  const [stringData, setStringData] = useState(JSON.stringify(initialData, null, 4));//

  useEffect(() => {
    const str = JSON.stringify({ layout, components }, null, 4);
    setStringData(str);
  }, [layout, components]);

  const handleDropToTrashBin = useCallback(
    (dropZone, item) => {
      const splitItemPath = item.path.split("-");
      setLayout(
        handleRemoveItemFromLayout(layout, splitItemPath)
      );
    },
    [layout]
  );

  const handleDrop = useCallback(
    (dropZone, item) => {
      console.log('dropZone', dropZone)
      console.log('item', item)

      const splitDropZonePath = dropZone.path.split("-");
      const pathToDropZone = splitDropZonePath.slice(0, -1).join("-");

      const newItem = { id: item.id, type: item.type };
      if (item.type === COLUMN) {
        newItem.children = item.children;
      }

      // sidebar into
      if (item.type === SIDEBAR_ITEM) {
        // 1. Move sidebar item into page
        const newComponent = {
          id: shortid.generate(),
          ...item.component
        };
        const newItem = {
          id: newComponent.id,
          type: COMPONENT
        };
        setComponents({
          ...components,
          [newComponent.id]: newComponent
        });
        setLayout(
          handleMoveSidebarComponentIntoParent(
            layout,
            splitDropZonePath,
            newItem
          )
        );
        return;
      }

      // move down here since sidebar items dont have path
      const splitItemPath = item.path.split("-");
      const pathToItem = splitItemPath.slice(0, -1).join("-");

      // 2. Pure move (no create)
      if (splitItemPath.length === splitDropZonePath.length) {
        // 2.a. move within parent
        if (pathToItem === pathToDropZone) {
          setLayout(
            handleMoveWithinParent(layout, splitDropZonePath, splitItemPath)
          );
          return;
        }

        // 2.b. OR move different parent
        // TODO FIX columns. item includes children
        setLayout(
          handleMoveToDifferentParent(
            layout,
            splitDropZonePath,
            splitItemPath,
            newItem
          )
        );
        return;
      }

      // 3. Move + Create
      setLayout(
        handleMoveToDifferentParent(
          layout,
          splitDropZonePath,
          splitItemPath,
          newItem
        )
      );
    },
    [layout, components]
  );

  const renderRow = (row, currentPath) => {
    return (
      <Row
        key={row.id}
        data={row}
        handleDrop={handleDrop}
        components={components}
        path={currentPath}
      />
    );
  };

  // dont use index for key when mapping over items
  // causes this issue - https://github.com/react-dnd/react-dnd/issues/342

  return (
    <div className="body">

      <div className="sideBar">
        {Object.values(SIDEBAR_ITEMS).map((sideBarItem, index) => (
          <SideBarItem key={sideBarItem.id} data={sideBarItem} />
        ))}
      </div>

      <div className="pageContainer">
        <div className="page">
          {
            layout.map((row, index) => {
              const currentPath = `${index}`;

              return (
                <React.Fragment key={row.id}>
                  <DropZone
                    data={{
                      path: currentPath,
                      childrenCount: layout.length
                    }}
                    onDrop={handleDrop}
                    path={currentPath}
                  />
                  {renderRow(row, currentPath)}
                </React.Fragment>
              );

            })
          }

          <DropZone
            data={{
              path: `${layout.length}`,
              childrenCount: layout.length
            }}
            onDrop={handleDrop}
            isLast
          />

        </div>

        <TrashDropZone
          data={{
            layout
          }}
          onDrop={handleDropToTrashBin}
        />

        <div style={{ margin: "15px" }}>
          <h3>Full Object Data:</h3>
          <div style={{ border: "2px solid blue", padding: "5px 10px" }}>
            <pre>{stringData}</pre>
          </div>
        </div>

      </div>

    </div>
  );
};

export default Container;
