import { useLoaderData, Link, Outlet, Form } from "react-router";
import { authenticate } from "../shopify.server";
import { connectToMongo } from "../db/mongo.server";
import { TestPost } from "../db/models/test-post";

export async function loader({request}) {

    const { admin } = await authenticate.admin(request);

    const shopResponse = await admin.graphql(`
    query shopInfo {
        shop {
          id
          url
          myshopifyDomain
        }
      }
    `);

    /*
      shop {
          domains {
            id
            host
            url
          }
        }
    */

    const { data: shopInfo } = await shopResponse.json();

    const shopId = shopInfo.shop.id
    const shopUrl = shopInfo.shop.url
    const shopifyDomain = shopInfo.shop.myshopifyDomain

    console.log("Shop ID: ", shopId)
    console.log("Shop url: ", shopUrl)
    console.log(" new Shopify Domain: ", shopifyDomain)

    const tasks = [
        {
            id: 1,
            task: "learn Remix"
        },
        {
            id: 2,
            task: "learn more Remix"
        },
        {
            id: 3,
            task: "learn Shipify app dev"
        }
    ]

    return { tasks }
}

export async function action({ request }) {
    const { admin } = await authenticate.admin(request);

    const shopResponse = await admin.graphql(`
    query shopInfo {
        shop {
          id
          url
          myshopifyDomain
        }
      }
    `);

    const { data: shopInfo } = await shopResponse.json();

    const formData = await request.formData();
    const intent = formData.get('intent');
    
    const shopId = shopInfo.shop.id

  console.log('🔵 Action: Starting with intent:', intent);
  
  // Get Shop GID
  
  console.log('🔵 Shop ID:', shopId);
  
  // Connect to MongoDB
  const connection = await connectToMongo();
  
  if (!connection) {
    return new Response(JSON.stringify({
        success: false,
        error: "MongoDB not connected"
      }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
  }
  
  console.log('✅ MongoDB connected');
  
  
  if (intent === 'create') {
    const title = formData.get('title');
    const content = formData.get('content');
    
    console.log('📝 Creating post:', { title, content });
    
    // Validate
    if (!title || !content) {
        return new Response(JSON.stringify({
            success: false,
            error: "Title and content are required"
          }), {
            status: 400,
            headers: { "Content-Type": "application/json" }
        });
    }
    
    try {
      // Create in MongoDB
      const post = await TestPost.create({
        shopId,
        title,
        content
      });
      
      console.log('✅ Post created:', post._id);
      
      return {
        success: true,
        post: {
          id: post._id.toString(),
          title: post.title,
          content: post.content,
          createdAt: post.createdAt
        }
      };
      
    } catch (error) {
      console.error('❌ Error creating post:', error);
      return new Response(JSON.stringify({
        success: false,
        error: error.message
      }), { status: 500 });
    }
  }
}

function TasksList() {

    const { tasks } = useLoaderData()

    return (
        <s-page title="List of tasks">
            <Form method="post">
                <input type="hidden" name="intent" value="create" />
                <s-text-field name="title" label="title" />
                <s-text-area
                    name="content"
                    label="Test content"
                    value="This is test content that should be saved in database"
                    rows={3}
                />
                <s-button type="submit" variant="primary">Dodaj</s-button>
            </Form>
            <s-unordered-list>
            { tasks.map(task => (
                <s-list-item key={task.id}><Link to={`/app/tasks/${task.id}`} > Task {task.id} </Link></s-list-item>
            ))}
            </s-unordered-list>
            <Outlet />
        </s-page>
    );
}

export default TasksList

/*
import { useLoaderData, Link, Outlet, Form, json } from "react-router";
import { authenticate } from "../shopify.server";
import { connectToMongo } from "../db/mongo.server";
import { TestPost } from "../db/models/test-post";

export async function loader({ request }) {
  const { admin } = await authenticate.admin(request);

  const shopResponse = await admin.graphql(`
    query shopInfo {
      shop {
        id
        url
        myshopifyDomain
      }
    }
  `);

  const { data } = await shopResponse.json();
  const shopInfo = data.shop;

  const shopId = shopInfo.id;
  const shopUrl = shopInfo.url;
  const shopifyDomain = shopInfo.myshopifyDomain;

  console.log("Shop ID: ", shopId);
  console.log("Shop url: ", shopUrl);
  console.log("Shopify Domain: ", shopifyDomain);

  // Tymczasowe dane na ekran
  const tasks = [
    { id: 1, task: "learn Remix" },
    { id: 2, task: "learn more Remix" },
    { id: 3, task: "learn Shopify app dev" }
  ];

  return json({ tasks });
}

export async function action({ request }) {
  const { admin } = await authenticate.admin(request);

  const shopResponse = await admin.graphql(`
    query shopInfo {
      shop {
        id
        url
        myshopifyDomain
      }
    }
  `);

  const { data } = await shopResponse.json();
  const shopInfo = data.shop;

  const formData = await request.formData();
  const intent = formData.get("intent");

  const shopId = shopInfo.id;

  console.log("🔵 Action: Starting with intent:", intent);
  console.log("🔵 Shop ID:", shopId);

  const connection = await connectToMongo();

  if (!connection) {
    return json(
      {
        success: false,
        error: "MongoDB not connected"
      },
      { status: 500 }
    );
  }

  console.log("✅ MongoDB connected");

  if (intent === "create") {
    const title = formData.get("title");
    const content = formData.get("content");

    console.log("📝 Creating post:", { title, content });

    if (!title || !content) {
      return json(
        {
          success: false,
          error: "Title and content are required"
        },
        { status: 400 }
      );
    }

    try {
      const post = await TestPost.create({
        shopId,
        title,
        content
      });

      console.log("✅ Post created:", post._id);

      return json({
        success: true,
        post: {
          id: post._id.toString(),
          title: post.title,
          content: post.content,
          createdAt: post.createdAt
        }
      });
    } catch (error) {
      console.error("❌ Error creating post:", error);
      return json(
        {
          success: false,
          error: error.message
        },
        { status: 500 }
      );
    }
  }

  // Jeżeli intent nie jest obsłużony:
  return json(
    {
      success: false,
      error: "Unknown intent"
    },
    { status: 400 }
  );
}

function TasksList() {
  const { tasks } = useLoaderData();

  return (
    <s-page title="List of tasks">
      <Form method="post">
        <input type="hidden" name="intent" value="create" />
        <s-text-field name="title" label="Title" />
        <s-text-area
          name="content"
          label="Test content"
          defaultValue="This is test content that should be saved in database"
          rows={3}
        />
        <s-button type="submit" variant="primary">
          Dodaj
        </s-button>
      </Form>
      <s-unordered-list>
        {tasks.map((task) => (
          <s-list-item key={task.id}>
            <Link to={`/app/tasks/${task.id}`}>Task {task.id}</Link>
          </s-list-item>
        ))}
      </s-unordered-list>
      <Outlet />
    </s-page>
  );
}

export default TasksList;

// ⛔ NIE importuj json w ogóle
// import { json } from "react-router";  // usuń
import { useLoaderData, Link, Outlet, Form } from "react-router";

import { authenticate } from "../shopify.server";
import { connectToMongo } from "../db/mongo.server";
import { TestPost } from "../db/models/test-post";

export async function loader({ request }) {
  const { admin } = await authenticate.admin(request);

  const shopResponse = await admin.graphql(`
    query shopInfo {
      shop {
        id
        url
        myshopifyDomain
      }
    }
  `);

  const { data } = await shopResponse.json();
  const shopInfo = data.shop;

  const shopId = shopInfo.id;
  const shopUrl = shopInfo.url;
  const shopifyDomain = shopInfo.myshopifyDomain;

  console.log("Shop ID: ", shopId);
  console.log("Shop url: ", shopUrl);
  console.log("Shopify Domain: ", shopifyDomain);

  const tasks = [
    { id: 1, task: "learn Remix" },
    { id: 2, task: "learn more Remix" },
    { id: 3, task: "learn Shopify app dev" }
  ];

  // 🔹 Zwykły obiekt – React Router sam go zserializuje
  return { tasks };
}

export async function action({ request }) {
  const { admin } = await authenticate.admin(request);

  const shopResponse = await admin.graphql(`
    query shopInfo {
      shop {
        id
        url
        myshopifyDomain
      }
    }
  `);

  const { data } = await shopResponse.json();
  const shopInfo = data.shop;

  const formData = await request.formData();
  const intent = formData.get("intent");

  const shopId = shopInfo.id;

  console.log("🔵 Action: Starting with intent:", intent);
  console.log("🔵 Shop ID:", shopId);

  const connection = await connectToMongo();
  if (!connection) {
    // Możesz po prostu zwrócić obiekt z info o błędzie.
    // (Status kodem nie sterujesz, ale do UI to często wystarcza.)
    return {
      success: false,
      error: "MongoDB not connected"
    };
  }

  console.log("✅ MongoDB connected");

  if (intent === "create") {
    const title = formData.get("title");
    const content = formData.get("content");

    console.log("📝 Creating post:", { title, content });

    if (!title || !content) {
      return {
        success: false,
        error: "Title and content are required"
      };
    }

    try {
      const post = await TestPost.create({
        shopId,
        title,
        content
      });

      console.log("✅ Post created:", post._id);

      return {
        success: true,
        post: {
          id: post._id.toString(),
          title: post.title,
          content: post.content,
          createdAt: post.createdAt
        }
      };
    } catch (error) {
      console.error("❌ Error creating post:", error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  return {
    success: false,
    error: "Unknown intent"
  };
}

function TasksList() {
  const { tasks } = useLoaderData();

  return (
    <s-page title="List of tasks">
      <Form method="post">
        <input type="hidden" name="intent" value="create" />
        <s-text-field name="title" label="Title" />
        <s-text-area
          name="content"
          label="Test content"
          defaultValue="This is test content that should be saved in database"
          rows={3}
        />
        <s-button type="submit" variant="primary">
          Dodaj
        </s-button>
      </Form>

      <s-unordered-list>
        {tasks.map((task) => (
          <s-list-item key={task.id}>
            <Link to={`/app/tasks/${task.id}`}>Task {task.id}</Link>
          </s-list-item>
        ))}
      </s-unordered-list>

      <Outlet />
    </s-page>
  );
}

export default TasksList;
*/