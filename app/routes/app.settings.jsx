import { Outlet, Link, useLocation, useLoaderData } from "react-router";
import { authenticate } from "../shopify.server";

export async function loader({request}) {
  const { admin, shop, session } = await authenticate.admin(request);

  const shopResponse = await admin.graphql(`
      query {
        shop {
          id
          name
          myshopifyDomain
        }
      }
    `);

  const {data: shopData} = await shopResponse.json();


  return { admin, shop, session, shopData }
}

export default function SettingsLayout() {

  const { admin, shop, session, shopData } = useLoaderData()

  console.log("admin: ", admin)
  console.log("shop: ", shop)
  console.log("session: ", session)
  console.log("shopData: ", shopData)

    const location = useLocation();
    
    const isActive = (path) => {
        return location.pathname === path;
    };

    return (
        <s-page title="Settings">
            <s-button slot="primary-action" onclick="shopify.toast.show('Save')">Save</s-button>
            <s-button slot="secondary-actions" commandfor="more-actions-id">More actions</s-button>
            <s-menu id="more-actions-id">
                <s-button onclick="shopify.toast.show('Action 1')">Action 1</s-button>
                <s-button onclick="shopify.toast.show('Action 2')">Action 2</s-button>
                <s-button onclick="shopify.toast.show('Action 3')">Action 3</s-button>
            </s-menu>
      {/* Horizontal submenu */}
      <s-box padding="400" borderBlockEndWidth="025">
        <s-inline-stack gap="400">
          <Link 
            to="/app/settings" 
            style={{ 
              textDecoration: 'none',
              fontWeight: isActive('/app/settings') ? 'bold' : 'normal'
            }}
          >
            General
          </Link>
          
          <Link 
            to="/app/settings/user"
            style={{ 
              textDecoration: 'none',
              fontWeight: isActive('/app/settings/user') ? 'bold' : 'normal'
            }}
          >
            User Settings
          </Link>
          
          <Link 
            to="/app/settings/additional"
            style={{ 
              textDecoration: 'none',
              fontWeight: isActive('/app/settings/additional') ? 'bold' : 'normal'
            }}
          >
            Additional
          </Link>
        </s-inline-stack>
      </s-box>
      
      {/* Child routes render HERE */}
      <s-box padding="400">
        <Outlet />
      </s-box>
    </s-page>
    )
}