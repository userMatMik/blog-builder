import {useLoaderData, useNavigation} from "react-router";
import Postbuilder from "./components/Postbuilder";

// Loader – przykład
export async function loader() {
  const availableBlocks = ['block1', 'block2'];
  return { availableBlocks };
}

export default function AppFullScreenPostEditor() {
  const { availableBlocks } = useLoaderData();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <>
      {/* 1. Minimalny s-page tylko do nagłówka App Window */}
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

      {/* 2. Edytor poza s-page, może być full-width */}
      <div className="app-fullscreen-root">
        <header className="app-fullscreen-header">
          {/* opcjonalnie możesz tu powtórzyć tytuł, breadcrumbs itd. */}
        </header>

        <main className="app-fullscreen-main">
          <Postbuilder
            availableBlocks={availableBlocks}
            isSubmitting={isSubmitting}
          />
        </main>
      </div>
    </>
  );
}