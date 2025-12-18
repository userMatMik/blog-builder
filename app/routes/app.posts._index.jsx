import { useLoaderData, Link } from "react-router";
import { authenticate } from "../shopify.server";
import { formatTimeAgo } from "../utility/utility"

export async function loader({request}) {
    const { admin } = await authenticate.admin(request);

    const blogsResponse = await admin.graphql(`
    query BlogList {
        blogs(first: 10) {
          nodes {
            id
            title
            handle
          }
        }
      }
    `);
  
  // Parse response
  const { data: blogsData } = await blogsResponse.json();

  console.log(blogsData)
  console.log(blogsData.blogs.nodes)

  const blogs = blogsData.blogs.nodes;

  if (blogs.length === 0) {
    return {
      error: "No blogs found. Please create a blog first."
    }
  }

  // const articlesResponse = await admin.graphql(`
  // query GetFirstTenArticles {
  //   blog(id: "${blogs[0].id}") {
  //     id
  //     title
  //     articles(first: 10) {
  //       nodes {
  //         id
  //         title
  //         author {
  //           name
  //         }
  //         publishedAt
  //         handle
  //       }
  //     }
  //   }
  // }
  // `);

  const articlesResponse = await admin.graphql(`
    query GetFirstTenArticles($blogId: ID!) {
      blog(id: $blogId) {
        id
        title
        articles(first: 10) {
          nodes {
            id
            title
            author { name }
            publishedAt
            isPublished
            updatedAt
            createdAt
            handle
            image {
              url
              altText
              width
              height
            }
          }
        }
      }
    }
  `, {
    variables: {
      blogId: blogs[0].id
    }
  });

  const { data: articlesData } = await articlesResponse.json();

  const articles = articlesData.blog.articles.nodes

  
  return { blogs, articles, currentBlog: blogs[0].id  };
}

function AllPosts() {

  const { blogs, articles, currentBlog } = useLoaderData();

  console.log(articles)

  return (
    <>
      <s-page>
        <s-stack
            slot="breadcrumb-actions"
            direction="inline"
            gap="small-200"
            alignItems="center"
          >
          <s-link href="/app" accessibilityLabel="Go to app home">
            <s-icon type="home" size="small"></s-icon>
          </s-link>
          <s-text color="subdued">Blog posts</s-text>
        </s-stack>
        <s-app-window id="post-editor" src="/app/posts/new"></s-app-window>  
        <s-button
            slot="secondary-actions"
            variant="primary"
            command="--show"
            commandFor="post-editor"    
        >
            Create post
        </s-button>
      </s-page>
      
      <s-section padding="none">
        

        <s-table>
          <s-grid
            slot="filters"
            gap="small-200"
            gridTemplateColumns="1fr auto"
          >
            <s-text-field
              label="Search articles"
              labelAccessibilityVisibility="exclusive"
              icon="search"
              placeholder="Searching for articles"
            />
            <s-button
              icon="sort"
              variant="secondary"
              accessibilityLabel="Sort"
              interestFor="sort-tooltip"
              commandFor="sort-actions"
            />
            <s-tooltip id="sort-tooltip">
              <s-text>Sort</s-text>
            </s-tooltip>
            <s-popover id="sort-actions">
              {/* ... Twój kod sortowania ... */}
            </s-popover>
          </s-grid>

          <s-table-header-row>
            <s-table-header listSlot="primary">Title</s-table-header>
            <s-table-header>Author</s-table-header>
            <s-table-header>Status</s-table-header>
            <s-table-header>Last update</s-table-header>
            <s-table-header listSlot="secondary">Action</s-table-header>
          </s-table-header-row>

          <s-table-body>
            {articles.map((article) => (
              <s-table-row>
                <s-table-cell>
                  <s-stack direction="inline" gap="small" alignItems="center">
                    <s-clickable
                      href=""
                      accessibilityLabel="Article thumbnail"
                      border="base"
                      borderRadius="base"
                      overflow="hidden"
                      inlineSize="40px"
                      blockSize="40px"
                    >
                      <s-image
                        objectFit="cover"
                        src={article?.image?.url} //trzeba obsłużyć też bez obrazka i poazać jakiś placeholder
                      />
                    </s-clickable>
                    <s-link href="">{article.title}</s-link>
                  </s-stack>
                </s-table-cell>
                <s-table-cell>
                  {article.author.name}
                </s-table-cell>
                <s-table-cell>
                  {article.isPublished ?
                    <s-badge color="base" tone="success">
                      Active
                    </s-badge> :
                    <s-badge color="base" tone="neutral">
                      Draft
                    </s-badge>
                  }
                </s-table-cell>
                <s-table-cell>
                  { formatTimeAgo(article.updatedAt)}
                </s-table-cell>
                <s-table-cell>
                  <s-button
                    icon="menu-horizontal"
                    commandFor="article-menu"
                    onClick={(event) => {
                      console.log('Event details:', event.type);
                      console.log('Target:', event.currentTarget);
                      console.log('Aricle title:', article.title)
                    }}
                  >
      
                  </s-button>
                  <s-menu id="article-menu" accessibilityLabel="Product actions">
                    <s-button icon="edit" onClick={(event) => console.log('Target:', event.currentTarget)}>Edit</s-button>
                    <s-button icon="duplicate">Duplicate</s-button>
                    <s-button icon="delete" tone="critical">Delete article</s-button>
                  </s-menu>
                </s-table-cell>
              </s-table-row>
            ))}
          </s-table-body>
        </s-table>
      </s-section>
    </>
  );
}

export default AllPosts;