import type { AppContext } from "@netless/window-manager";

import React, { useEffect, useRef, useState } from "react";
import { maxBpm, minBpm } from "./Constants";

export interface AppProps {
  context: AppContext;
}

/**
 * This is a basic counter example of using netless app storage api in React.
 *
 * To make use of the sync storage, we have to adjust a normal react state's
 * `setState` api to apply changes to the storage. See the `setCount` implementation.
 *
 * The storage will tell us when the state is changed, then we can update the local state
 * in the `addStateChangedListener` callback.
 */
export function App({ context }: AppProps) {
  const [storage] = useState(() => context.createStorage("metronome", { 
    bpm: 100  }));
  const [bpm, realSetBpm] = useState(() => storage.state.bpm);
  const [bpmValid, realSetBpmValid] = useState(true);
  const [isPlaying, realSetIsPlaying] = useState(false);
  const [timer, realSetTimer] = useState(0);
  const [tempoDuration, realSetTempoDuration] = useState(0);

  const bpmRef = useRef<HTMLInputElement | null>(null);

  const click1 = new Audio("//daveceddia.com/freebies/react-metronome/click1.wav");

  useEffect(
    () => 
      storage.addStateChangedListener(() => {
        realSetBpm(storage.state.bpm);
      }),
    [storage]
  );

  const setBpmManual = () => {
    const bpmNew = Number(bpmRef.current?.value);
    if (bpmNew < minBpm || bpmNew > maxBpm) {
      realSetBpmValid(false);
    } else {
      storage.setState({ bpm: bpmNew});
      if (isPlaying && bpmNew != 0) {
        clearInterval(timer);
        realSetTimer(setInterval(() => click1.play(), (60 / bpmNew) * 1000));
        realSetTempoDuration(120 / bpmNew);
      }
    }
  }

  const clickPlay = (isPlaying: boolean) => {
    if (!isPlaying && bpm != 0) {
      realSetTimer(setInterval(() => click1.play(), (60 / bpm) * 1000));
      realSetTempoDuration(120 / bpm);
    } else {
      clearInterval(timer);
      realSetTempoDuration(0);
    }
    realSetIsPlaying(!isPlaying);
  }

  // 窗口关闭组件不销毁。。

  console.log("<App /> storage.state =", storage.state, isPlaying);
  return <>
    <div className="bpm-label">{bpmValid ? bpm : ""}</div>
    <div className="bpm-setting">
      <input type="number" min={minBpm} max={maxBpm} ref={bpmRef} placeholder={String(bpm)} />
      {!bpmValid ? `bpm请限制在 ${minBpm}-${maxBpm} 内` : ""}
      <button onClick={() => setBpmManual()}>set</button>
      <button onClick={() => clickPlay(isPlaying)}>{isPlaying ? "stop" : "start"}</button>
    </div>
    <div className="tempo-wrapper" style={{
      animationDuration: `${tempoDuration}s`,
      WebkitAnimationDuration: `${tempoDuration}s`
      }}><div className="tempo-hand"></div></div>
  </>;
}
