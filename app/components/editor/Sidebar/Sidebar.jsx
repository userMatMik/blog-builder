import styles from './Sidebar.module.css';

export function Sidebar({activePanel, onSelectPanel}) {

  const handleClick = (panelId) => {
    onSelectPanel(panelId);
  };

  const isActive = (panelId) => activePanel === panelId;

  return (
    <>
      {/* <div>Sidebar</div> */}
      <div class={styles.sidebarMain}>
      <s-box
      background="subdued"
      paddingBlock="base"
      paddingInline="none"
      blockSize="100%"
      
      >
        <s-stack
          direction="block"
          alignItems="center"
          gap="small"
        >
          <s-button
            variant="tertiary"
            tone="auto"
            onClick={() => handleClick("content")}
          >
            C
          </s-button>
          <s-button
            variant="tertiary"
            tone={isActive("settings") ? "auto" : "neutral"}
            onClick={() => handleClick("settings")}
          >
            S
          </s-button>
          <s-button
            variant="tertiary"
            tone="auto"
            onClick={() => handleClick("automation")}
          >
            A
          </s-button>
        </s-stack>
      </s-box>
      </div>  
    </>
  )
}

export default Sidebar;