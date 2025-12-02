// app/routes/app.settings.user.jsx
export default function UserSettings() {
  return (
    <s-page heading="User settings heading">
        <s-button slot="primary-action" onclick="shopify.toast.show('Save')">Save</s-button>
        <s-button slot="secondary-actions" commandfor="more-actions-id">More actions</s-button>
        <s-menu id="more-actions-id">
            <s-button onclick="shopify.toast.show('Action 1')">Action 1</s-button>
            <s-button onclick="shopify.toast.show('Action 2')">Action 2</s-button>
            <s-button onclick="shopify.toast.show('Action 3')">Action 3</s-button>
        </s-menu>
   
    <s-section>
      <s-text variant="headingMd" as="h2">
        User Settings 2
      </s-text>
      
      <s-box paddingBlockStart="400">
        <s-paragraph>
          Manage user preferences and profile information.
        </s-paragraph>
      </s-box>
      
      {/* Example user settings */}
      <s-box paddingBlockStart="600">
        <s-grid
            gridTemplateColumns="repeat(2, 1fr)"
            gap="small"
            justifyContent="center"
        >
            <s-grid-item gridColumn="span 2">
                <s-heading>
                    User information
                </s-heading>
            </s-grid-item>
            <s-grid-item gridColumn="span 1">
                <s-text-field 
                    label="Name" 
                    defaultValue="John"
                />
            </s-grid-item>
            <s-grid-item gridColumn="span 1">
                <s-text-field 
                    label="Surname" 
                    defaultValue="Doe"
                />
            </s-grid-item>
            <s-grid-item gridColumn="span 2">
                <s-text-field 
                    label="Email" 
                    defaultValue="john.doe@example.com"
                />
            </s-grid-item>
        </s-grid>
      </s-box>
      
      <s-box paddingBlockStart="400">
        <s-text variant="headingSm" as="h3">
          Email Notifications
        </s-text>
        <label style={{ display: 'block', marginTop: '8px' }}>
          <input type="checkbox" defaultChecked />
          {' '}Receive email updates
        </label>
      </s-box>
      
      <s-box paddingBlockStart="400">
        <s-button variant="primary">
          Save User Settings
        </s-button>
      </s-box>
    </s-section>
    </s-page>
  );
}