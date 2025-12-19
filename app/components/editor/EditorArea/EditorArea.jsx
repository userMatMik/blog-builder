function EditorArea() {
    return (
      <s-box background="base" padding="base">
        <s-section heading="Treść wpisu">
          {/* tu docelowo: tytuł, treść, bloki itp. */}
          <s-text color="subdued">
            Tutaj będziesz budować główny edytor treści (blokowo, rich text, itd.)
          </s-text>
        </s-section>
      </s-box>
    );
  }
  
  export default EditorArea;