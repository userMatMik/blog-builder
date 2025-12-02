export default function GeneralSettings() {
    
    return(
        <s-section>
      <s-text variant="headingMd" as="h2">
        General Settings
      </s-text>
      
      <s-box paddingBlockStart="400">
        <s-paragraph>
          This is the default view when you visit /app/settings
        </s-paragraph>
        
        <s-text as="p">
          Configure your general application settings here.
        </s-text>
      </s-box>
      
      {/* Example settings */}
      <s-box paddingBlockStart="600">
        <s-text variant="headingSm" as="h3">
          App Name
        </s-text>
        <input 
          type="text" 
          defaultValue="Blog Builder" 
          style={{ padding: '8px', marginTop: '8px', width: '300px' }}
        />
      </s-box>
      
      <s-box paddingBlockStart="400">
        <s-button variant="primary">
          Save Changes
        </s-button>
      </s-box>
    </s-section>
    )
}