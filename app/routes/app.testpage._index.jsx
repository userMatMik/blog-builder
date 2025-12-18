// app.posts._index.jsx

import { useLoaderData } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";

import { authenticate } from "../shopify.server";
// import { getPosts } from "../models/Post.server"; // TODO: Twoja implementacja

// Loader: pobiera listę postów z backendu
export async function loader({ request }) {
  const { admin, session } = await authenticate.admin(request);

  // TODO: Zaimplementuj pobieranie artykułów (np. z Admin API Article + własny storage/metafieldy)
  // const posts = await getPosts(session.shop, admin.graphql);
  const posts = [
    {
      id: "gid://shopify/Article/1",
      title: "How to style your living room",
      authorName: "John Doe",
      isPublished: true,
      updatedAt: new Date().toISOString(),
      imageUrl: "https://via.placeholder.com/80x80",
    },
    {
      id: "gid://shopify/Article/2",
      title: "Winter collection drop",
      authorName: "Jane Smith",
      isPublished: false,
      updatedAt: new Date().toISOString(),
      imageUrl: null,
    },
  ];

  return { posts };
}

// Prosty helper do skracania tekstu
function truncate(str, { length = 40 } = {}) {
  if (!str) return "";
  if (str.length <= length) return str;
  return str.slice(0, length) + "…";
}

const PostsTable = ({ posts }) => (
  <s-section padding="none" accessibilityLabel="Posts table">
    <s-table>
      <s-table-header-row>
        <s-table-header listSlot="primary">Title</s-table-header>
        <s-table-header>Author</s-table-header>
        <s-table-header>Status</s-table-header>
        <s-table-header>Last update</s-table-header>
        <s-table-header listSlot="secondary">Actions</s-table-header>
      </s-table-header-row>

      <s-table-body>
        {posts.map((post) => (
          <PostRow key={post.id} post={post} />
        ))}
      </s-table-body>
    </s-table>
  </s-section>
);

const PostRow = ({ post }) => (
  <s-table-row id={post.id} position={post.id}>
    {/* Title + thumbnail */}
    <s-table-cell>
      <s-stack direction="inline" gap="small" alignItems="center">
        <s-clickable
          href={`/app/posts/${encodeURIComponent(post.id)}`}
          accessibilityLabel={`Go to the article page for ${post.title}`}
          border="base"
          borderRadius="base"
          overflow="hidden"
          inlineSize="40px"
          blockSize="40px"
        >
          {post.imageUrl ? (
            <s-image
              objectFit="cover"
              src={post.imageUrl}
              alt={post.title}
            />
          ) : (
            <s-icon size="large" type="image" />
          )}
        </s-clickable>

        <s-link href={`/app/posts/${encodeURIComponent(post.id)}`}>
          {truncate(post.title)}
        </s-link>
      </s-stack>
    </s-table-cell>

    {/* Author */}
    <s-table-cell>{post.authorName}</s-table-cell>

    {/* Status */}
    <s-table-cell>
      {post.isPublished ? (
        <s-badge color="base" tone="success">
          Active
        </s-badge>
      ) : (
        <s-badge color="base" tone="neutral">
          Draft
        </s-badge>
      )}
    </s-table-cell>

    {/* Last update */}
    <s-table-cell>
      {new Date(post.updatedAt).toLocaleString()}
    </s-table-cell>

    {/* Actions */}
    <s-table-cell>
      <s-button
        icon="edit"
        href={`/app/posts/${encodeURIComponent(post.id)}/edit`}
        variant="secondary"
        accessibilityLabel={`Edit ${post.title}`}
      >
        Edit
      </s-button>
    </s-table-cell>
  </s-table-row>
);

const EmptyPostsState = () => (
  <s-section accessibilityLabel="Empty state section">
    <s-grid gap="base" justifyItems="center" paddingBlock="large-400">
      <s-box maxInlineSize="200px" maxBlockSize="200px">
        <s-image
          aspectRatio="1/0.5"
          src="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
          alt="A stylized graphic of a document"
        />
      </s-box>
      <s-grid justifyItems="center" maxBlockSize="450px" maxInlineSize="450px">
        <s-heading>Create blog posts with rich content</s-heading>
        <s-paragraph>
          Build articles with product sliders, FAQs, table of contents, and more.
        </s-paragraph>
        <s-stack
          gap="small-200"
          justifyContent="center"
          padding="base"
          paddingBlockEnd="none"
          direction="inline"
        >
          <s-button
            variant="primary"
            command="--show"
            commandFor="post-editor"
          >
            Create first article
          </s-button>
        </s-stack>
      </s-grid>
    </s-grid>
  </s-section>
);

export default function PostsIndex() {
  const { posts } = useLoaderData();

  return (
    <s-page heading="Blog posts">
      {/* App window dla pełnoekranowego edytora */}
      <s-app-window id="post-editor" src="/app/testpage/new"></s-app-window>

      {/* Secondary action w headerze: New article */}
      <s-button
        slot="secondary-actions"
        variant="primary"
        command="--show"
        commandFor="post-editor"
      >
        New article
      </s-button>

      {posts.length === 0 ? (
        <EmptyPostsState />
      ) : (
        <PostsTable posts={posts} />
      )}
    </s-page>
  );
}

// Headers z boundary – jak w QR tutorialu
export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};