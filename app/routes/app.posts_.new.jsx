export default function PostEditor() {
  return (
    <s-page heading="New Post">
      {/* Primary action w top bar */}
      <s-button 
        slot="primary-action" 
        onclick="shopify.toast.show('Saved!')"
      >
        Save draft
      </s-button>
      
      {/* Secondary actions */}
      <s-button 
        slot="secondary-actions"
        onclick="document.querySelector('s-app-window').hide()"
      >
        Close
      </s-button>
      
      {/* Content tutaj - zajmuje full width! */}
      <s-box padding="400">
        <p>Editor będzie tutaj</p>
      </s-box>
    </s-page>
  );
}