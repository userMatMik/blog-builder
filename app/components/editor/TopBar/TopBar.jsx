function TopBar({ title, status }) {
  const handlePublish = () => {
    shopify.toast.show('Publishing');
  };

  const handlePreview = () => {
    shopify.toast.show('Display preview in new tab');
  };
  return (
    <>
      <div>
        <s-box
          background="base"
          paddingInline="base"
          paddingBlock="small"
          borderBottom="small-100"
          borderColor="subdued"
          // border="base"
        >
          <s-stack
            direction="inline"
            alignItems="center"
            justifyContent="space-between"
          >
            {/* Lewa strona: tytuł + badge */}
            <s-stack direction="inline" gap="small" alignItems="center">
              <s-text type="strong">{title}</s-text>
              {status && <s-badge tone="info">{status}</s-badge>}
            </s-stack>

            {/* Prawa strona: akcje */}
            <s-stack direction="inline" gap="small" alignItems="center">
              <s-button variant="secondary" onClick={handlePreview}>
                Preview
              </s-button>
              <s-button variant="primary" onClick={handlePublish}>
                Publish
              </s-button>
            </s-stack>
          </s-stack>
        </s-box>
        <s-divider color="base" />

        {/* <s-box background="base" padding="base">
          <s-text type="strong">Panel z podstawowym tłem</s-text>
        </s-box>

        <s-box background="subdued" padding="base" borderRadius="base">
          <s-text color="subdued">Ustawienia zaawansowane</s-text>
        </s-box>

        <s-box background="strong" padding="base">
          <s-text tone="info">Important info</s-text>
        </s-box> */}

      </div>
    </>
  );
}

export default TopBar;