
// import { LoaderFunctionArgs, ActionFunctionArgs } from 'react-router';
import { useLoaderData, useNavigation, Form, redirect } from 'react-router';
import EditorPage from "../components/editor/EditorPage"



export async function loader() {
  // Możesz np. pobrać listę dostępnych „block types” z backendu
  const availableBlocks = ['product_slider', 'shop_the_look', 'toc', 'faq'];

  return { availableBlocks };
}

function NewPostPage() {

  const { availableBlocks } = useLoaderData();
  // const navigation = useNavigation();
  // const isSubmitting = navigation.state === 'submitting';

  console.log(availableBlocks)

  return (
    <>
      <s-page heading="New article">
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
        <EditorPage />
      </div>
    </>
  );
}

export default NewPostPage;