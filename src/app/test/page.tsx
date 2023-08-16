"use client";

import { useEffect, useMemo, useReducer, useState } from "react";

function Something(props: { a1: string; a2: string }) {
  console.log("이거까지 다시 렌더링?!");
  const [prevProps, setPrevProps] = useState(props);
  useEffect(() => {
    console.log("이게 달라진거냐?");
    setPrevProps(props);
  }, [props]);
  Object.is(props, prevProps);
  return <p>{props.a1 + props.a2}</p>;
}

export default function F_is_ma() {
  console.log("다시 렌더링");
  const [, forceUpdate] = useReducer((x) => x + 1, 0);
  return (
    <>
      <button onClick={() => forceUpdate()}>눌러 버튼</button>
      <Something a1="" a2="" />
    </>
  );
}
