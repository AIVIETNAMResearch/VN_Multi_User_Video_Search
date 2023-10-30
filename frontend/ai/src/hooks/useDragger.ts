import React, { useEffect, useRef } from "react";

function useDragger(id: string, handleMove: Function): void {
  const PANEL_SIZE = 270
  const isClicked = useRef<boolean>(false);
  const isDClicked = useRef<boolean>(false);

  const coords = useRef<{
    startX: number,
    startY: number,
    lastX: number,
    lastY: number
  }>({
    startX: 0,
    startY: 0,
    lastX: 0,
    lastY: 0
  })

  useEffect(() => {

    const target = document.getElementById(id);
    if (!target) throw new Error("Element with given id doesn't exist");

    const container = target.parentElement;
    if (!container) throw new Error("target element must have a parent");

    const onDClick = () => {
      isDClicked.current = !isDClicked.current
    }

    const onMouseDown = (e: MouseEvent) => {
      isClicked.current = true;
      target.style.zIndex = '10'
      coords.current.startX = e.clientX;
      coords.current.startY = e.clientY;
    }
    
    const onMouseUp = (e: MouseEvent) => {
      isClicked.current = false;
      target.style.zIndex = '1'
      coords.current.lastX = target.offsetLeft;
      coords.current.lastY = target.offsetTop;
      handleMove()
    }

    const onMouseMove = (e: MouseEvent) => {
      if (!isClicked.current) return;
      if (isDClicked.current) return;

      let nextX = e.clientX - coords.current.startX + coords.current.lastX;
      let nextY = e.clientY - coords.current.startY + coords.current.lastY;

      const rightBorder = PANEL_SIZE - target.clientWidth
      const bottomBorder = PANEL_SIZE - target.clientHeight
      if (nextX < 0) nextX = 0
      if (nextY < 0) nextY = 0
      if (nextX > rightBorder ) nextX = rightBorder
      if (nextY > bottomBorder ) nextY = bottomBorder

      target.style.top = `${nextY}px`;
      target.style.left = `${nextX}px`;
    }

    target.addEventListener('mousedown', onMouseDown);
    target.addEventListener('mouseup', onMouseUp);
    target.addEventListener("dblclick", onDClick)
    container.addEventListener('mousemove', onMouseMove);
    container.addEventListener('mouseleave', onMouseUp);

    const cleanup = () => {
      target.removeEventListener('mousedown', onMouseDown);
      target.removeEventListener('mouseup', onMouseUp);
      target.removeEventListener('dblclick', onDClick);
      container.removeEventListener('mousemove', onMouseMove);
      container.removeEventListener('mouseleave', onMouseUp);
    }

    return cleanup;
  }, [id, handleMove])

}

export default useDragger;

