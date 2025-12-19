import React from "react";
import { useState } from "react";
import TopBar from "./TopBar/TopBar";
import Sidebar from "./Sidebar/Sidebar";
import SlidingPanel from "./SlidingPanel/SlidingPanel";
import EditorArea from "./EditorArea/EditorArea";
import styles from './EditorPage.module.css';


function EditorPage() {

    const [ activePanel, setActivePanel ] = useState(null)

    const handleSelectPanel = (panelId) => {
        setActivePanel((prevActivePanel) => (prevActivePanel === panelId ? null : panelId))
        console.log(panelId)
    }

    return (
    <>
      <div className={styles.editorRoot}>
        <TopBar
          title="This is your new blog post title"
          status="Draft"
        />

        {/* tu działają klasy, pokazują sie bordery */}
        <s-grid
          className={`${styles.mainContentGrid}`}
          gap="none"
          gridTemplateColumns="56px minmax(280px, 360px) minmax(0, 1fr)"
          alignItems="stretch"
          blockSize="100%"
        >
        {/* Sidebar */}
        {/* tu pokazuje się border ale nie rozciąga się na 100% wysokości, jest skurczony */}
        <div className={`${styles.sidebar} ${styles.desktopOnly}`}>
          <Sidebar
            activePanel={activePanel}
            onSelectPanel={handleSelectPanel}
          />
        </div>

        {/* Sliding panel */}
        {/* nie wyświetla się border, maksymalna wysokość zależna od Sidebar */}
        <s-box
          className={styles.slidingPanel}
          background="base"
          blockSize="100%"
          // border="small-100"
          // borderColor="strong"
        >
          <SlidingPanel activePanel={activePanel} />
        </s-box>

        {/* Editor area */}
        {/* nie wyświetla się border, maksymalna wysokość zależna od Sidebar */}
        <s-box
          className={`${styles.editorArea}`}
          background="base"
          blockSize="100%"
        >
          <EditorArea />
        </s-box>
        </s-grid>
  
        {/* Mobile: bottom bar */}
        {/* <MobileBottomBar
          className={styles.mobileOnly}
          activePanel={activePanel}
          onSelectPanel={handleSelectPanel}
        /> */}
      </div>
    </> 
    );
}

export default EditorPage;