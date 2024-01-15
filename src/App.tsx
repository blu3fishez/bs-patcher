// import { useEffect, useState } from "react";
import { patch } from "./patcher";
import styles from "./App.module.css";

function App() {
  return (
    <div className={styles.wrap}>
      <div className={styles.colorbox}></div>
      <div className={styles.title}>
        마인크래프트 보석 패치기
      </div>
      <div className={styles.btnWrap}>
        <button className={styles.btn} onClick={() => patch("1.20.4", "0.15.3")}>
          Install
        </button>
      </div>
      <div className={styles.verTitle}>
        버전 정보
      </div>
      <div className={styles.desc}>
        보석이가 올린쉐이더 팩과 모드를 한번에 설치 해줍니다.
      </div>
      <div className={styles.fabricVer}>
        fabric-loader 0.15.3
      </div>
      <div className={styles.mcVer}>
        minecraft 1.20.4
      </div>
      <div className={styles.help}>
        버그가 있다면 블피(blu3fishez) 에게 제보 바랍니다.
      </div>
    </div>
  );
}

export default App;
