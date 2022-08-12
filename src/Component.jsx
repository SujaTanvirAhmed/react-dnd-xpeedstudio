import React, { useRef, useState } from "react";
import { useDrag } from "react-dnd";
import { COMPONENT } from "./constants";

const style = {
  border: "1px dashed black",
  padding: "0.5rem 1rem",
  backgroundColor: "white",
  cursor: "move"
};

const Component = ({ data, components, path }) => {
  const ref = useRef(null);

  const [{ isDragging }, drag] = useDrag({
    item: { type: COMPONENT, id: data.id, path },
    collect: monitor => ({
      isDragging: monitor.isDragging()
    })
  });

  const opacity = isDragging ? 0 : 1;
  drag(ref);

  const component = components[data.id];

  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <div
        ref={ref}
        style={{ ...style, opacity }}
        className="component draggable"
        onClick={() => {
          setShowModal(true);
        }}
      >
        <div>{data.id}</div>
        <div>{component.content}</div>
      </div>

      {
        // Modal starts
        showModal &&
        <div className="modal" id="modal-one">
          <div
            className="modal-bg modal-exit"
            onClick={() => { setShowModal(false) }}
          ></div>
          <div className="modal-container">
            <h2>ID: {data.id}</h2>
            <button
              className="modal-close modal-exit"
              onClick={() => { setShowModal(false) }}
            >X</button>
          </div>
        </div>
        // Modal ends
      }

    </>
  );

};

export default Component;
