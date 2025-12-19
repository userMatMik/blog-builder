// app.posts.new.jsx

import { useLoaderData, useNavigation, Form, redirect } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";

import { authenticate } from "../shopify.server";

// import { createPost } from "../models/Post.server"; // TODO

// Loader: np. typy bloków, domyślne wartości itd.
export async function loader({ request }) {
  const { admin, session } = await authenticate.admin(request);

  // TODO: możesz np. pobrać listę produktów, ustawienia domyślne, itd.
  const availableBlocks = ["product_slider", "shop_the_look", "toc", "faq"];

  return { availableBlocks };
}

// Action: zapisuje nowy artykuł
export async function action({ request }) {
  const { admin, session } = await authenticate.admin(request);
  const formData = await request.formData();

  const title = formData.get("title");
  const body = formData.get("body");
  const blocksJson = formData.get("blocks") ?? "[]";

  // TODO: createPost powinien:
  // - utworzyć Article w Shopify (Admin API),
  // - zapisać blocksJson w metafieldzie albo w Twojej bazie
  // await createPost({ shop: session.shop, admin, title, body, blocksJson });

  // Po sukcesie redirect z powrotem do listy
  return redirect("/app/posts");
}

export default function NewPostPage() {
  const { availableBlocks } = useLoaderData();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";


  console.log("Dostępne Bloki: ", availableBlocks )

  return (
    <>
      <s-page heading="New article">
        {/* Opcjonalny secondary action: Cancel */}
        <s-button
            slot="secondary-actions"
            variant="secondary"
            type="button"
            onClick={() => history.back()}
        >
            Cancel
        </s-button>
      </s-page>
      <div>
        Test content
      </div>
    </>
    
    

    // <s-page heading="New article">
    //   {/* Opcjonalny secondary action: Cancel */}
    //   <s-button
    //     slot="secondary-actions"
    //     variant="secondary"
    //     type="button"
    //     onClick={() => history.back()}
    //   >
    //     Cancel
    //   </s-button>
    //   <Postbuilder />

    //   {/* Główna treść edytora */}
    //   <s-section padding="base" heading="Basic information">
    //     <s-stack direction="block" gap="small">
    //       <s-text-field
    //         id="article-title"
    //         name="title"
    //         label="Title"
    //         placeholder="Enter article title"
    //         required
    //       ></s-text-field>

    //       <s-text-area
    //         id="article-excerpt"
    //         name="excerpt"
    //         label="Excerpt (optional)"
    //         placeholder="Short summary shown on listings"
    //         rows="3"
    //       ></s-text-area>
    //     </s-stack>
    //   </s-section>

    //   <s-section padding="base" heading="Content">
    //     <s-text-area
    //       id="article-body"
    //       name="body"
    //       label="Body"
    //       placeholder="Write your article content..."
    //       rows="18"
    //       required
    //     ></s-text-area>
    //   </s-section>

    //   <s-section padding="base" heading="Advanced blocks">
    //     <s-stack direction="block" gap="base">
    //       <s-paragraph color="subdued">
    //         Configure advanced content blocks such as product sliders, shop the
    //         look, table of contents, and FAQs. For now we just store selected
    //         block types as JSON.
    //       </s-paragraph>

    //       {/* TODO: tutaj docelowo wstawisz swoje własne web componenty
    //           (<my-product-slider-editor>, <my-faq-editor>, itd.) i będziesz
    //           generował bardziej złożony JSON do pola `blocks`. */}
    //       <input
    //         type="hidden"
    //         name="blocks"
    //         value={JSON.stringify(
    //           availableBlocks.map((type) => ({
    //             type,
    //             config: {},
    //           }))
    //         )}
    //       />

    //       <s-stack direction="inline" gap="base">
    //         {availableBlocks.map((block) => (
    //           <s-box
    //             key={block}
    //             padding="base"
    //             border="small-100"
    //             borderRadius="base"
    //             borderColor="subdued"
    //           >
    //             <s-text type="strong">{block}</s-text>
    //             <s-paragraph color="subdued">
    //               Configure this block in your custom editor components.
    //             </s-paragraph>
    //           </s-box>
    //         ))}
    //       </s-stack>
    //     </s-stack>
    //   </s-section>

    //   {/* Action buttons na dole strony */}
    //   <s-section padding="base">
    //     <Form method="post">
    //       <s-stack direction="inline" gap="small">
    //         <s-button
    //           type="submit"
    //           variant="primary"
    //           loading={isSubmitting}
    //         >
    //           {isSubmitting ? "Saving…" : "Save article"}
    //         </s-button>

    //         <s-button
    //           type="button"
    //           variant="secondary"
    //           onClick={() => history.back()}
    //         >
    //           Cancel
    //         </s-button>
    //       </s-stack>
    //     </Form>
    //   </s-section>
    // </s-page>
  );
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};