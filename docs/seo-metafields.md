# Do Sprawdzenia - SEO Metafields dla Articles

## ODKRYCIE: Jak Tapia ustawia różne tytuły (H1 vs SEO Title)

### Problem
W panelu Shopify Admin dla artykułu:
- **Tytuł wpisu** (główny H1) - to co widzisz w edytorze
- **"Listing w wyszukiwarce"** - SEO title/description (może być INNY niż tytuł wpisu)

Tapia to wykorzystuje - pozwala mieć:
- H1: "10 sposobów na SEO w Shopify"  
- SEO Title: "Jak poprawić SEO bloga w Shopify – poradnik dla sklepów"

### Rozwiązanie: Global Metafields

Shopify używa specjalnych metafields dla SEO (starszy mechanizm, działa przed `seo` field w GraphQL):
```
namespace: "global"
key: "title_tag"        → SEO Title (to co w <title>)
key: "description_tag"  → Meta Description
```

**Dla Articles nie ma jeszcze `seo` field w GraphQL** (jest dla Product/Collection), więc trzeba użyć tych metafields.

---

## Implementacja

### 1. Ustawienie SEO Title + Description przez GraphQL
```graphql
mutation ArticleSeoMetafieldsSet(
  $ownerId: ID!
  $seoTitle: String!
  $seoDescription: String!
) {
  metafieldsSet(
    metafields: [
      {
        ownerId: $ownerId
        namespace: "global"
        key: "title_tag"
        type: "single_line_text_field"
        value: $seoTitle
      }
      {
        ownerId: $ownerId
        namespace: "global"
        key: "description_tag"
        type: "single_line_text_field"
        value: $seoDescription
      }
    ]
  ) {
    metafields {
      id
      namespace
      key
      value
    }
    userErrors {
      field
      message
    }
  }
}
```

**Parametry:**
- `ownerId`: `"gid://shopify/Article/1234567890"`
- `seoTitle`: "Twój SEO title"
- `seoDescription`: "Twój meta description"

**Efekt:**
- Panel Shopify w "Listing w wyszukiwarce" pokaże te wartości
- Motywy używają tych metafields do renderowania `<title>` i `<meta name="description">`

### 2. Odczyt SEO metafields
```graphql
query ArticleWithSeo($id: ID!) {
  article(id: $id) {
    id
    title
    handle
    metafields(first: 10, namespace: "global") {
      edges {
        node {
          key
          value
        }
      }
    }
  }
}
```

Szukamy w odpowiedzi:
- `key: "title_tag"` → SEO Title
- `key: "description_tag"` → Meta Description

---

## Flow w Blog Builder

### Dane do zapisania przy publikacji wpisu:

1. **Article.title** (H1 / tytuł wpisu)
   - Przez `articleUpdate` mutation
   - To co merchant widzi jako główny tytuł

2. **global.title_tag** (SEO Title)
   - Przez `metafieldsSet`
   - Może być inny niż Article.title
   - To co idzie do `<title>` na storefront

3. **global.description_tag** (Meta Description)
   - Przez `metafieldsSet`
   - Opis dla SEO

4. **Article.summary** (Excerpt)
   - Opcjonalnie przez `articleUpdate`
   - Zajawka wpisu

### UI w edytorze:
```
┌─────────────────────────────────────┐
│ Tytuł wpisu (H1)                    │
│ [_______________________________]   │
│                                     │
│ SEO Settings (expandable)           │
│ ├─ SEO Title                        │
│ │  [_______________________________]│
│ │  (jeśli puste → użyj Article.title)
│ │                                   │
│ ├─ Meta Description                 │
│ │  [_______________________________]│
│ │  [_______________________________]│
│ │                                   │
│ └─ Excerpt/Summary                  │
│    [_______________________________]│
└─────────────────────────────────────┘
```

---

## Do Przetestowania

### [ ] Test 1: Podstawowe ustawienie SEO
1. Utwórz artykuł przez API
2. Ustaw `global.title_tag` i `global.description_tag`
3. Sprawdź w panelu Shopify → "Listing w wyszukiwarce"
4. Zweryfikuj czy wartości się zgadzają

### [ ] Test 2: Różne tytuły
1. `Article.title` = "Test wpisu"
2. `global.title_tag` = "SEO: Test wpisu - Blog Builder"
3. Sprawdź panel - czy pokazuje oba?
4. Sprawdź na storefront - który title jest w `<title>`?

### [ ] Test 3: Puste SEO fields
1. Nie ustawiaj `global.title_tag`
2. Sprawdź co Shopify używa domyślnie (prawdopodobnie Article.title)

### [ ] Test 4: Update istniejącego artykułu
1. Artykuł ma już title
2. Dodaj tylko SEO metafields
3. Czy panel nadal pokazuje oba poprawnie?

### [ ] Test 5: Motywy (Dawn/Refresh)
1. Sprawdź jak Dawn renderuje `<title>` artykułu
2. Czy używa `global.title_tag` jeśli istnieje?
3. Czy ma fallback na `Article.title`?

---

## Pytania do wyjaśnienia

1. **Czy wszystkie motywy wspierają `global.title_tag`?**
   - Dawn/Refresh na pewno (standard Shopify)
   - Custom themes? (trzeba sprawdzić najpopularniejsze)

2. **Co gdy `global.title_tag` jest pusty?**
   - Czy Shopify automatycznie używa `Article.title`?
   - Czy trzeba to obsłużyć po naszej stronie?

3. **Limity znaków:**
   - SEO Title: ile znaków max? (Google: ~60 chars)
   - Meta Description: ile? (Google: ~160 chars)
   - Czy Shopify waliduje długość?

4. **Gdzie przechowywać SEO settings w naszej architekturze?**
   - W Article metafield `content_data`? (razem z Tiptap JSON)
   - Osobno w `global.title_tag/description_tag`? ✅ (to!)
   - Draft: gdzie trzymać SEO before publish?

---

## Architektura - propozycja

### Draft (Shop metafield)
```javascript
{
  namespace: "custom.app--blog-builder--drafts",
  key: "draft_xxx",
  value: {
    title: "Tytuł wpisu",
    seo: {
      title: "SEO Title (optional)",
      description: "Meta description (optional)"
    },
    content: { /* Tiptap */ }
  }
}
```

### Published (Article + metafields)
```javascript
// Article
{
  title: "Tytuł wpisu",  // H1
  summary: "Excerpt...",
  // ...
}

// Metafield: global.title_tag
{
  namespace: "global",
  key: "title_tag",
  value: "SEO Title"
}

// Metafield: global.description_tag  
{
  namespace: "global",
  key: "description_tag",
  value: "Meta description"
}

// Metafield: content_data (nasz)
{
  namespace: "custom.app--blog-builder",
  key: "content_data",
  value: { /* Tiptap JSON + components */ }
}
```

---

## Konkurencja - jak to robią

### Tapia
- ✅ Używa `global.title_tag/description_tag`
- Pozwala na różne H1 vs SEO Title
- W panelu pokazuje oba fieldy osobno

### Do sprawdzenia w innych appkach:
- [ ] Bloggle
- [ ] Blog Studio
- [ ] Shogun

---

## Notatki

- `global.title_tag/description_tag` to **oficjalny** mechanizm Shopify (starszy)
- Panel Admin używa tego sam ("Listing w wyszukiwarce")
- Nie trzeba nic hakować - to standard
- Dla Product/Collection jest nowsze `seo` field, dla Article jeszcze nie

**Data odkrycia:** 2024-01-XX  
**Źródło:** Analiza Tapia + Shopify Metafield REST API docs

---

## Next Steps

1. [ ] Przygotować helper functions w `services/metafield.server.ts`:
```typescript
   setSeoMetafields(articleId, { title, description })
   getSeoMetafields(articleId)
```

2. [ ] Dodać do Article publish flow

3. [ ] UI w edytorze (expandable "SEO Settings")

4. [ ] Testy E2E z prawdziwym sklepem

---

## Źródło - Oryginalna wiadomość

To, co opisujesz („w adminie we wpisie mam tytuł wpisu, a w edycji Listing w wyszukiwarce tytuł ma inną treść") jest bardzo ważnym szczegółem – i tłumaczy, jak Tapia to robi.

Mechanizm jest starszy niż pola seo w GraphQL i opiera się na specjalnych metafieldach SEO:

global.title_tag – SEO title
global.description_tag – meta description
To jest dokładnie to, co widać w REST API przy SEO dla kolekcji / stron, np. w przykładzie: Metafield – REST Admin (global.title_tag):
```json
"namespace": "global",
"key": "title_tag",
"value": "seo title",
"type": "single_line_text_field"
```

Dla produktów, kolekcji itd. Shopify zbudowało wygodne pole seo w GraphQL Admin (Product.seo, CollectionInput.seo, itd.), ale dla Article jeszcze tego nie ma. Natomiast panel admina nadal używa global.title_tag / global.description_tag jako „Listing w wyszukiwarce".

Tapia najprawdopodobniej robi więc tak:

H1 / tytuł wpisu w adminie → to jest Article.title.
Tytuł w sekcji „Listing w wyszukiwarce" → Metafield namespace: "global", key: "title_tag" na Article.
Meta description → global.description_tag lub summary (excerpt), tak jak pisałeś.
Ty możesz zrobić dokładnie to samo przez GraphQL Admin API, używając mutacji metafieldsSet.

### 1. Jak ustawić SEO title / meta description artykułu przez GraphQL (tak jak w „Listing w wyszukiwarce")
Użyj mutacji metafieldsSet i ustaw na artykule:

SEO title → namespace: "global", key: "title_tag"
SEO description → namespace: "global", key: "description_tag"

Mutacja GraphQL (Admin API) – ustawienie SEO title & description dla artykułu:
```graphql
mutation ArticleSeoMetafieldsSet(
  $ownerId: ID!
  $seoTitle: String!
  $seoDescription: String!
) {
  metafieldsSet(
    metafields: [
      {
        ownerId: $ownerId
        namespace: "global"
        key: "title_tag"
        type: "single_line_text_field"
        value: $seoTitle
      }
      {
        ownerId: $ownerId
        namespace: "global"
        key: "description_tag"
        type: "single_line_text_field"
        value: $seoDescription
      }
    ]
  ) {
    metafields {
      id
      namespace
      key
      value
    }
    userErrors {
      field
      message
    }
  }
}
```

Ta mutacja została zweryfikowana przeciwko schematowi Admin API (przeszła walidację).

Parametry:

- ownerId – GID artykułu, np. "gid://shopify/Article/1234567890"
- seoTitle – tekst, który ma się pojawić w „Listing w wyszukiwarce" jako tytuł.
- seoDescription – tekst meta description.

Po jej wykonaniu:

- w panelu w sekcji „Listing w wyszukiwarce" zobaczysz ustawiony:
  - tytuł = seoTitle,
  - opis = seoDescription,
- ten tytuł/description będą używane przez motyw jako SEO title / meta description (motywy od lat bazują na tych metafieldach global.title_tag / global.description_tag).

### 2. Jak uzyskać efekt: „Tytuł wpisu (H1) inny niż meta title"
Teraz kluczowe: jak mieć różne wartości:

- Tytuł wpisu (nagłówek widoczny w edycji – Article.title),
- Tytuł w wyszukiwarce (SEO Title w „Listing w wyszukiwarce").

Mechanizm jest dokładnie taki:

**H1 / tytuł wpisu w Adminie:**
to pole title artykułu, ustawiane np. przez:
```graphql
mutation UpdateArticleTitle($id: ID!, $title: String!) {
  articleUpdate(id: $id, article: { title: $title }) {
    article {
      id
      title
    }
    userErrors {
      field
      message
    }
  }
}
```

**SEO title:**
Zamiast nadpisywać Article.title, ustawiasz osobny tytuł w global.title_tag:
```graphql
mutation ArticleSeoMetafieldsSet(
  $ownerId: ID!
  $seoTitle: String!
  $seoDescription: String!
) {
  metafieldsSet(
    metafields: [
      {
        ownerId: $ownerId
        namespace: "global"
        key: "title_tag"
        type: "single_line_text_field"
        value: $seoTitle
      }
      {
        ownerId: $ownerId
        namespace: "global"
        key: "description_tag"
        type: "single_line_text_field"
        value: $seoDescription
      }
    ]
  ) {
    metafields {
      id
      namespace
      key
      value
    }
    userErrors {
      field
      message
    }
  }
}
```

W efekcie:

- Article.title (to, co widzisz jako główny tytuł wpisu) może pozostać np. „10 sposobów na SEO w Shopify".
- global.title_tag (SEO title) może być np. „Jak poprawić SEO bloga w Shopify – poradnik dla sklepów".
- Panel Shopify w sekcji „Listing w wyszukiwarce" pokazuje już to, co jest w global.title_tag / global.description_tag, więc zobaczysz różnicę:
  - Tytuł wpisu = Article.title,
  - Tytuł SEO = Metafield global.title_tag.

To idealnie pasuje do tego, co widzisz w Tapia: inny tytuł wpisu vs inny tytuł SEO w sekcji Listing.

### 3. Jak to osadzić w Twojej aplikacji (UX)
Dla jednego artykułu możesz w UI mieć:

- „Tytuł wpisu (H1 / główny tytuł)"
  → zapis do Article.title przez articleUpdate.

- „SEO Title (Listing w wyszukiwarce)"
  → zapis do global.title_tag przez metafieldsSet.

- „SEO Description (Listing w wyszukiwarce)"
  → zapis do global.description_tag przez metafieldsSet.

- „Excerpt / zajawka"
  → opcjonalnie do Article.summary (wiele motywów korzysta z tego przy budowie snippetu).

Przykładowy flow (w jednej akcji):
- Wywołujesz articleUpdate, żeby ustawić H1 / slug itd.
- Następnie metafieldsSet, żeby ustawić SEO title / description.
- Możesz to też połączyć logicznie w kodzie: w jednym „zapisz" w Twoim UI → aplikacja robi 2 requesty GraphQL pod spodem.

### 4. Jak sprawdzić aktualne SEO title/description artykułu
Możesz je odczytać przez Admin GraphQL jako metafieldy:
```graphql
query ArticleWithSeo($id: ID!) {
  article(id: $id) {
    id
    title
    handle
    metafields(first: 10, namespace: "global") {
      edges {
        node {
          key
          value
        }
      }
    }
  }
}
```

W odpowiedzi szukasz:

- key: "title_tag" – SEO title,
- key: "description_tag" – SEO meta description.

To jest dokładnie to, czym operuje panel w „Listing w wyszukiwarce".

### 5. Podsumowanie
- Tak, da się mieć inny tytuł wpisu (Article.title) i inny meta title (Listing w wyszukiwarce) – i Tapia prawdopodobnie robi to dokładnie przez global.title_tag / global.description_tag.
- Dla artykułów bloga Shopify nie wystawia seo w ArticleUpdateInput, ale:
  - „Listing w wyszukiwarce" to wrapper na metafieldy:
    - namespace: "global", key: "title_tag" – SEO Title,
    - namespace: "global", key: "description_tag" – Meta description.
- Twoja appka może:
  - edytować Article.title i Article.summary dla treści,
  - edytować global.title_tag / global.description_tag przez metafieldsSet dla SEO, tak jak w panelu.

Jeśli chcesz, mogę w kolejnym kroku:

rozpisać gotowy przykład w Node/React Router (z Twoim authenticate.admin), który:
- pobiera artykuł z jego SEO metafieldami,
- renderuje formularz (tytuł, SEO title, SEO description),
- zapisuje zmiany przez articleUpdate + metafieldsSet.