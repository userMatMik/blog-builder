function SlidingPanel({ activePanel }) {
    if (!activePanel) {
      return (
        <s-box background="base" padding="base">
            <s-text color="subdued">
              Wybierz sekcję z sidebara, aby wyświetlić opcje.
            </s-text>
        </s-box>
      )
    }
    
    return (
        <s-box background="base" padding="base">
          {activePanel === "content" && (
            <s-section heading="Opcje treści">
              {/* ustawienia dla contentu */}
            </s-section>
          )}
          {activePanel === "settings" && (
            <s-section heading="Ustawienia szablonu">
              {/* ustawienia dla settings */}
            </s-section>
          )}
          {activePanel === "automation" && (
            <s-section heading="Automatyzacja">
              {/* ustawienia automatyzacji */}
            </s-section>
          )}
        </s-box>
    );
}

export default SlidingPanel;