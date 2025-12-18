To, co podejrzewasz, jest bardzo sensowne – Flow prawdopodobnie robi dokładnie taki manewr:

używa <s-page> tylko jako „nagłówka” (tytuł + przyciski w app‑barze),
a właściwy edytor renderuje jako osobny fragment / rodzeństwo s-page, dzięki czemu nie podlega temu samemu max-width.
Czyli strukturalnie coś bardzo bliskiego temu, co napisałeś:

jsx
export default function NewPostPage() {
  const { availableBlocks } = useLoaderData();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

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

      <PostBuilder />
    </>
  );
}
To jest dokładnie ten pattern, który pozwala:

zachować integrację z app‑headerem (tytuł „New article” + „Cancel” w prawym górnym rogu),
nie ograniczać PostBuilder do kolumny s-page:
max-width: 950px dotyczy samego <s-page> i jego wnętrza,
ale PostBuilder jest rodzeństwem, więc host może traktować go inaczej.
W devtools możesz zobaczyć coś w stylu:

html

<div class="app-root">
  <s-page ...>...</s-page>      <!-- ma max-width -->
  <div class="post-builder-root">...</div>  <!-- może być full-bleed -->
</div>
Jeśli host styluje wyłącznie s-page (i np. jego wrapper), to PostBuilder rzeczywiście może zajmować więcej niż te 950px – to jest najbliższy pattern do tego, co widzisz w Flow.

1. Jak to poprawnie ugryźć u Ciebie
Możesz spokojnie zaadaptować ten wzór.

1.1. Route app.testpage.new.jsx
jsx

// app.testpage.new.jsx
import {
  useLoaderData,
  useNavigation,
  Form,
  redirect,
} from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import { PostBuilder } from "../components/PostBuilder";

export async function loader({ request }) {
  const { admin, session } = await authenticate.admin(request);
  const availableBlocks = ["product_slider", "shop_the_look", "toc", "faq"];
  return { availableBlocks };
}

export async function action({ request }) {
  const { admin, session } = await authenticate.admin(request);
  const formData = await request.formData();

  const title = formData.get("title");
  const bodyJson = formData.get("body");
  const blocksJson = formData.get("blocks") ?? "[]";

  // TODO: zapis do Admin API (Article + metafield)
  // await createPost({ shop: session.shop, admin, title, bodyJson, blocksJson });

  return redirect("/app/testpage");
}

export default function NewPostPage() {
  const { availableBlocks } = useLoaderData();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <>
      {/* Nagłówek w app-barze */}
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

      {/* Główny edytor poza <s-page> */}
      <PostBuilder
        availableBlocks={availableBlocks}
        isSubmitting={isSubmitting}
      />
    </>
  );
}

export const headers = (headersArgs) => boundary.headers(headersArgs);
1.2. PostBuilder jako pełny layout
tsx

// components/PostBuilder.tsx
import { Form } from "react-router";
import { useEffect, useRef, useState } from "react";

type PostBuilderProps = {
  availableBlocks: string[];
  isSubmitting: boolean;
};

export function PostBuilder({ availableBlocks, isSubmitting }: PostBuilderProps) {
  const editorContainerRef = useRef<HTMLDivElement | null>(null);
  const [bodyJson, setBodyJson] = useState("{}");

  useEffect(() => {
    if (!editorContainerRef.current) return;

    // TODO: inicjalizacja TipTap
    // const editor = createTipTapEditor({
    //   element: editorContainerRef.current,
    //   onUpdate: (json) => setBodyJson(JSON.stringify(json)),
    // });
    // return () => editor.destroy();
  }, []);

  return (
    <div className="post-editor-root">
      {/* Własny „toolbar” jak w Flow */}
      <header className="post-editor-header">
        <div className="post-editor-header__title">New article</div>
        <div className="post-editor-header__actions">
          <button type="button" onClick={() => history.back()}>
            Cancel
          </button>
          <button type="submit" form="new-post-form" disabled={isSubmitting}>
            {isSubmitting ? "Saving…" : "Save"}
          </button>
        </div>
      </header>

      {/* Główna część – edytor + sidebar */}
      <Form method="post" id="new-post-form" className="post-editor-main">
        {/* Hidden field z JSON TipTap */}
        <input type="hidden" name="body" value={bodyJson} />
        {/* Hidden field z blokami – na start wszystkie dostępne, później dynamicznie */}
        <input
          type="hidden"
          name="blocks"
          value={JSON.stringify(
            availableBlocks.map((type) => ({ type, config: {} }))
          )}
        />

        <div className="post-editor-main__body">
          <div className="post-editor-main__editor" ref={editorContainerRef} />
          <aside className="post-editor-main__sidebar">
            <s-stack direction="block" gap="small">
              <s-heading accessibilityRole="heading">
                Block settings
              </s-heading>
              <s-paragraph color="subdued">
                Configure the selected block (product slider, shop the look,
I CSS (styl uproszczony):

css

.post-editor-root {
  display: flex;
  flex-direction: column;
  height: 100vh;  /* w obrębie s-app-window okna */
  width: 100%;    /* pełna szerokość dostępnego kontenera */
}

.post-editor-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid #e1e3e5;
  background: #ffffff;
}

.post-editor-header__title {
  font-weight: 600;
  font-size: 14px;
}

.post-editor-header__actions {
  display: flex;
  gap: 8px;
}

.post-editor-main {
  flex: 1 1 auto;
  min-height: 0;
  overflow: hidden; /* wewnątrz body robimy scroll */
}

.post-editor-main__body {
  display: flex;
  height: 100%;
  min-height: 0;
}

/* Editor area */
.post-editor-main__editor {
  flex: 1 1 auto;
  min-height: 0;
  padding: 16px;
  overflow: auto;
  border-right: 1px solid #e1e3e5;
}

/* Sidebar */
.post-editor-main__sidebar {
  flex: 0 0 320px;
  max-width: 100%;
  padding: 16px;
  overflow-y: auto;
  background: #fafbfc;
}

/* Mobile: editor nad panelem */
@media (max-width: 768px) {
  .post-editor-main__body {
    flex-direction: column;
  }

  .post-editor-main__editor {
    border-right: none;
    border-bottom: 1px solid #e1e3e5;
  }
W ten sposób:

s-page służy tylko do nagłówka w app‑barze,
PostBuilder jest rodzeństwem s-page i ma własny layout, zbliżony do Flow:
top bar edytora,
pełny „canvas” z edytorem i sidebarami,
responsywny układ.
2. Dlaczego to działa podobnie jak w Flow
Twoje spostrzeżenie:

jak patrze na strukturę w dev tools to wygląda to podobnie

dokładnie na to wskazuje:

Flow ma:
s-page dla nagłówka (widoczny w app‑headerze),
osobny root edytora (często <flow-editor-root> lub coś podobnego),
szerokość edytora jest kontrolowana przez ich własny CSS i ich surface.
Ty teraz robisz to samo:

s-page → tytuł + Cancel w app‑headerze,
<PostBuilder /> → osobny layout, który możesz rozciągnąć w obrębie okna.
To jest obecnie najbliższy publiczny pattern do tego, co robi Flow – i bardzo dobrze, że go wychwyciłeś.

3. Co dalej?
Masz teraz sensowną bazę, żeby:

krok po kroku wprowadzić TipTap w PostBuilder,
rozbudować panel boczny (np. lista bloków, inspector właściwości),
zrobić przyjazny layout desktop + mobile bez walki z s-page.
Jeśli chcesz, w kolejnym kroku mogę:

rozpisać szkic konfiguracji TipTap (extensions, onUpdate → setBodyJson),
albo pomóc zaprojektować strukturę JSON, którą będziesz trzymał w metafieldzie artykułu (blocks, body, itd.).



Routing dla app-window

1. Jak Shopify mapuje pliki na ścieżki (React Router + @shopify/shopify-app-react-router)
Bazując na tutorialu QR‑kodów (ten, który wkleiłeś):

app._index.jsx → /app
app.qrcodes._index.jsx → /app/qrcodes
app.qrcodes.new.jsx → /app/qrcodes/new
app.qrcodes.$id.jsx → /app/qrcodes/:id
Wzór:

app.<segment>._index.jsx → /app/<segment>
app.<segment>.new.jsx → /app/<segment>/new
app.<segment>.$id.jsx → /app/<segment>/:id
U Ciebie:

routy to app.testpage.jsx oraz app.testpage.new.jsx

Czyli:

główna lista jest w app.testpage.jsx (bez _index),
edytor w app.testpage.new.jsx.
W tym układzie runtime może traktować:

app.testpage.jsx jako „layout route /app/testpage”,
a app.testpage.new.jsx jako child route /app/testpage/new, ale z tym samym lub współdzielonym layoutem – w zależności od generowania routera.
Efekt, który widzisz:

kiedy ładujesz /app/testpage/new w <s-app-window>,
router odpala ten sam root/parent component, co dla /app/testpage,
więc widzisz content z app.testpage.jsx.
2. Jak to naprawić: użyj ._index dla listy
Żeby zachować spójność z QR‑tutorialem i mieć pewność, który plik odpowiada za który URL, zrób tak:

Lista (index):

zmień nazwę pliku z app.testpage.jsx na:
text
Copy
1
     app.testpage._index.jsx
to będzie /app/testpage.
Nowy artykuł (edytor):

zostaw app.testpage.new.jsx – to jest /app/testpage/new.
Po zmianie:

/app/testpage → renderuje app.testpage._index.jsx (Twoja lista + <s-app-window>),
/app/testpage/new → renderuje app.testpage.new.jsx (edytor).
Upewnij się też, że:

w <s-app-window> masz dokładnie:
html
Copy
1
  <s-app-window id="post-editor" src="/app/testpage/new"></s-app-window>
i w s-button:
html

  <s-button
    variant="primary"
    command="--show"
    commandFor="post-editor"
  >
    New article
  </s-button>
zrestartuj dev‑serwer po zmianie nazw plików (czasem nie łapie nowych routów „na gorąco”).
3. Minimalny przykład na Twoich nazwach
3.1. app.testpage._index.jsx – lista + app window
jsx

// app.testpage._index.jsx
import { useLoaderData } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";

export async function loader({ request }) {
  const { admin, session } = await authenticate.admin(request);

  // TODO: Pobierz artykuły z Admin API / własnego storu
  const posts = [];
  return { posts };
}

export default function TestPageIndex() {
  const { posts } = useLoaderData();

  return (
    <s-page heading="Blog posts (testpage)">
      {/* App window do pełnoekranowego edytora */}
      <s-app-window
        id="post-editor"
        src="/app/testpage/new"
      ></s-app-window>

      <s-button
        slot="secondary-actions"
        variant="primary"
        command="--show"
        commandFor="post-editor"
      >
        New article
      </s-button>

      {/* tu Twoja tabela / Empty state */}
      {posts.length === 0 ? (
        <s-section>
          <s-heading>No posts yet</s-heading>
          <s-paragraph color="subdued">
            Click “New article” to create your first post.
          </s-paragraph>
        </s-section>
      ) : (
        /* Twoje <s-table> */
        <s-section padding="none">
          <s-table>…</s-table>
        </s-section>
      )}
    </s-page>
  );
}

export const headers = (headersArgs) => boundary.headers(headersArgs);
3.2. app.testpage.new.jsx – edytor
jsx

// app.testpage.new.jsx
import {
  useLoaderData,
  useNavigation,
  Form,
  redirect,
} from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";

export async function loader({ request }) {
  const { admin, session } = await authenticate.admin(request);
  const availableBlocks = ["product_slider", "shop_the_look", "toc", "faq"];
  return { availableBlocks };
}

export async function action({ request }) {
  const { admin, session } = await authenticate.admin(request);
  const formData = await request.formData();

  const title = formData.get("title");
  const body = formData.get("body");
  const blocksJson = formData.get("blocks") ?? "[]";

  // TODO: zapisz artykuł (Admin API + Twoje dane)
  // await createPost({ shop: session.shop, admin, title, body, blocksJson });

  return redirect("/app/testpage");
}

export default function NewPostPage() {
  const { availableBlocks } = useLoaderData();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <s-page heading="New article">
      <s-button
        slot="secondary-actions"
        variant="secondary"
        type="button"
Po tej zmianie:

/app/testpage pokazuje listę,
/app/testpage/new ładuje się do <s-app-window> po kliknięciu „New article”.