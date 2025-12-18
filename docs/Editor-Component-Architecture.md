# Editor Component Architecture

**Version:** 1.0  
**Last Updated:** 2024-12-17  
**Status:** Design Complete - Ready for Implementation

---

## 📋 TABLE OF CONTENTS

1. [Overview](#overview)
2. [State Management Strategy](#state-management-strategy)
3. [Component Hierarchy](#component-hierarchy)
4. [Data Flow](#data-flow)
5. [Component Preview Philosophy](#component-preview-philosophy)
6. [Tiptap Integration](#tiptap-integration)
7. [Component Examples](#component-examples)
8. [Technical Implementation](#technical-implementation)
9. [Mobile Considerations](#mobile-considerations)
10. [Performance Optimizations](#performance-optimizations)
11. [Next Steps](#next-steps)

---

## 🎯 OVERVIEW

Blog Builder editor wykorzystuje **separation of concerns** między trzema systemami:

1. **Tiptap** - Owns post content (JSON document)
2. **Reducer** - Owns metadata + UI state
3. **React Router 7** - Handles data fetching + form submissions

**Key Principle:** Nie duplikujemy stanu. Każdy system ma swoją odpowiedzialność.

---

## 🧠 STATE MANAGEMENT STRATEGY

### Single Source of Truth - Co Gdzie Żyje
```javascript
// ========================================
// TIPTAP (Editor Instance)
// ========================================
// Owns:
{
  type: "doc",
  content: [
    { type: "heading", level: 1, text: "Post Title" },
    { type: "paragraph", text: "Content..." },
    { type: "productCard", attrs: {
        productId: "123",
        layout: "hover-overlay",
        showPrice: true
      }
    },
    { type: "productCarousel", attrs: {
        products: [
          { id: "1", title: "Rolex 1", price: "$8,950" },
          { id: "2", title: "Rolex 2", price: "$9,200" },
          // ... 5 more
        ],
        slidesPerView: { desktop: 3, tablet: 2, mobile: 1 },
        autoplay: true,
        loop: true
      }
    }
  ]
}

// ========================================
// REDUCER (App State)
// ========================================
const initialState = {
  // Metadata (NOT in Tiptap)
  metadata: {
    featuredImage: null,        // { url, alt }
    author: 'default',
    slug: '',                    // auto-generated from title
    blog: 'news',
    tags: [],
    metaTitle: '',
    metaDescription: '',
    status: 'draft'
  },

  // UI state
  ui: {
    panelOpen: null,             // 'settings' | 'text' | 'media' | 'components' | 'ai-summary'
    selectedComponent: null,     // { type, id, position } when component clicked
    isSidebarCollapsed: false,
    mobileBottomSheetOpen: null
  },

  // Save state
  save: {
    status: 'idle',              // 'idle' | 'saving' | 'saved' | 'error'
    lastSaved: null,
    hasUnsavedChanges: false,
    error: null
  },

  // Editor reference (pointer only!)
  editor: null,                  // Tiptap instance (set on mount)
  
  // Fetched data (from loaders/fetchers)
  data: {
    blogs: [],                   // from loader
    authors: [],                 // from loader
    products: null,              // lazy loaded
    images: null                 // lazy loaded
  }
};
```

---

## 🏗️ COMPONENT HIERARCHY
```
<EditorRoute>                              // React Router 7 route
│
├─ loader()                                // Fetch initial data (blogs, authors, draft)
├─ action()                                // Handle publish
│
└─ <EditorPage>                            // Main orchestrator
    │
    ├─ useReducer(editorReducer)           // State management
    ├─ useFetcher() × N                    // Lazy data loading
    ├─ useEditor()                         // Tiptap instance
    ├─ Auto-save effect                    // Debounced 10s
    │
    ├─ <TopBar>                            // Fixed top
    │   ├─ <Logo />                        // Click → Dashboard
    │   ├─ <SaveStatus />                  // "Saved 2m ago"
    │   ├─ <PreviewButton />               // Opens preview modal
    │   └─ <PublishButton />               // Opens publish modal
    │
    ├─ <MainContent>                       // Flex container
    │   │
    │   ├─ <Sidebar>                       // 56px fixed width
    │   │   ├─ <SidebarButton icon={SettingsIcon} />
    │   │   ├─ <SidebarButton icon={TextIcon} />
    │   │   ├─ <SidebarButton icon={ImageIcon} />
    │   │   ├─ <SidebarButton icon={AppsIcon} />
    │   │   └─ <SidebarButton icon={MagicIcon} />
    │   │
    │   ├─ <SlidingPanel open={state.ui.panelOpen}>
    │   │   │
    │   │   ├─ {panelOpen === 'settings' && <PostSettingsPanel />}
    │   │   ├─ {panelOpen === 'text' && <TextElementsPanel />}
    │   │   ├─ {panelOpen === 'media' && <MediaPanel />}
    │   │   ├─ {panelOpen === 'components' && (
    │   │   │   selectedComponent 
    │   │   │     ? <ComponentConfigPanel />  // Edit mode
    │   │   │     : <ComponentsListPanel />   // List mode
    │   │   │ )}
    │   │   └─ {panelOpen === 'ai-summary' && <AISummaryPanel />}
    │   │
    │   └─ <EditorArea>                    // Flex: 1
    │       │
    │       ├─ <EditorContent editor={editor}>
    │       │   │
    │       │   ├─ Tiptap renders nodes:
    │       │   │   ├─ Heading nodes
    │       │   │   ├─ Paragraph nodes
    │       │   │   ├─ Image nodes
    │       │   │   └─ Custom Component nodes (React NodeViews):
    │       │   │       ├─ <ProductCardNodeView />
    │       │   │       ├─ <GalleryNodeView />
    │       │   │       ├─ <CarouselNodeView />
    │       │   │       ├─ <CTABoxNodeView />
    │       │   │       └─ <ShopTheLookNodeView />
    │       │   │
    │       │   └─ Tiptap UI Extensions:
    │       │       ├─ <DragHandleMenu />      // ⠿ + [+] on hover
    │       │       ├─ <BubbleMenu />          // Component actions
    │       │       └─ <FloatingMenu />        // Quick insert [+]
    │       │
    │       └─ <EditorPlaceholder>         // "Start writing..."
    │
    ├─ <MobileBottomBar>                   // Mobile only (<768px)
    │   └─ [Icon buttons × 5]
    │
    ├─ <PublishModal open={showPublishModal} />
    ├─ <PreviewModal open={showPreviewModal} />
    └─ <UnsavedChangesModal open={hasUnsavedChanges} />
```

---

## 🔄 DATA FLOW

### 1. Initial Load (Server → Client)
```
Browser → /posts/new
  ↓
React Router loader() executes server-side
  ↓
Fetches from Shopify:
  • Blogs list
  • Authors list
  • App settings
  • Draft content (if editing)
  ↓
Returns JSON
  ↓
<EditorPage> receives via useLoaderData()
  ↓
Initializes reducer:
  • state.metadata (from draft or defaults)
  • state.data.blogs, state.data.authors
  ↓
Initializes Tiptap:
  • editor.commands.setContent(draftContent)
  ↓
Renders UI
```

---

### 2. User Edits Metadata (Reducer State)
```
User uploads featured image in <PostSettingsPanel>
  ↓
dispatch({ type: 'SET_FEATURED_IMAGE', image })
  ↓
Reducer updates state.metadata.featuredImage
  ↓
React re-renders <PostSettingsPanel>
  ↓
Shows new image preview
  ↓
state.save.hasUnsavedChanges = true
  ↓
After 10 seconds → Auto-save effect triggers
  ↓
autoSaveFetcher.submit({
  content: editor.getJSON(),      // from Tiptap
  metadata: state.metadata        // from reducer
})
  ↓
Server saves to Shop metafield (draft)
  ↓
Returns success
  ↓
dispatch({ type: 'SAVE_SUCCESS' })
  ↓
<TopBar> shows: "Saved just now"
```

---

### 3. User Inserts Component (Tiptap State)
```
User clicks "Product Carousel" in <ComponentsListPanel>
  ↓
editor.commands.insertContent({
  type: 'productCarousel',
  attrs: {
    id: generateUniqueId(),
    products: [],
    slidesPerView: { desktop: 3, tablet: 2, mobile: 1 },
    autoplay: false,
    loop: false
  }
})
  ↓
Tiptap adds node to document
  ↓
Tiptap calls <CarouselNodeView> to render
  ↓
Shows empty carousel with placeholder:
  "Click Edit to add products"
  ↓
Tiptap fires onUpdate event
  ↓
Editor effect detects change:
  dispatch({ type: 'CONTENT_CHANGED' })
  ↓
Auto-save timer resets (10 seconds countdown starts)
  ↓
dispatch({ 
  type: 'SELECT_COMPONENT',
  componentId: newNode.attrs.id 
})
  ↓
<SlidingPanel> switches to <ComponentConfigPanel>
```

---

### 4. User Configures Component (Tiptap + UI State)
```
User clicks carousel in editor
  ↓
Tiptap onSelectionUpdate fires
  ↓
const { node } = editor.state.selection;
if (node.type.name === 'productCarousel') {
  dispatch({ 
    type: 'SELECT_COMPONENT',
    componentType: 'productCarousel',
    componentId: node.attrs.id,
    position: from
  });
}
  ↓
Reducer updates:
  • state.ui.selectedComponent = { type, id, position }
  • state.ui.panelOpen = 'component-config'
  ↓
<SlidingPanel> renders <ComponentConfigPanel>
  ↓
Panel shows current carousel settings (from node.attrs)
  ↓
User selects 7 products via search modal
  ↓
<ComponentConfigPanel> calls (debounced 300ms):
  editor.commands.updateAttributes('productCarousel', {
    products: selectedProducts
  })
  ↓
Tiptap updates node attrs
  ↓
<CarouselNodeView> re-renders with new products
  ↓
Shows first 3 products + "4 more" indicator
  ↓
After 10 seconds → Auto-save (includes new attrs)
```

---

### 5. Lazy Loading Heavy Data (Fetchers)
```
User opens <ComponentConfigPanel> for Product Carousel
  ↓
Panel checks: state.data.products
  ↓
if (!state.data.products) {
  productsFetcher.load('/api/products');
}
  ↓
Shows skeleton loader in product selector
  ↓
Server fetches via Shopify Products API
  ↓
Returns { products: [...] }
  ↓
productsFetcher.data updates
  ↓
dispatch({ type: 'SET_PRODUCTS', products })
  ↓
Reducer: state.data.products = products
  ↓
<ComponentConfigPanel> re-renders
  ↓
Product selector now searchable with real data
```

---

### 6. Publish Flow (Form Submission)
```
User clicks [🚀 Publish] in <TopBar>
  ↓
<PublishModal> opens
  ↓
Validates:
  • Title: extractTitle(editor.getJSON())
  • Featured image: state.metadata.featuredImage
  • Content not empty: !editor.isEmpty
  • Meta description: warning if empty
  ↓
Shows checklist:
  ✅ Title set
  ✅ Featured image added
  ✅ Content not empty (1,247 words)
  ⚠️  No meta description (recommended)
  ⚠️  No tags added
  
  SEO Score: 7/10
  ↓
User clicks "Publish Now"
  ↓
<PublishModal> prepares payload:
{
  title: extractTitle(editor.getJSON()),
  content: editor.getJSON(),           // Full Tiptap JSON
  metadata: state.metadata,
  blog: state.metadata.blog
}
  ↓
Submits via <Form> to action()
  ↓
Server action():
  1. Validates (Zod schemas)
  2. Checks tier limits (MongoDB)
  3. Creates Shopify Article
  4. Saves content to Article metafield:
     namespace: custom.app--blog-builder
     key: content_data
  5. Generates fallback HTML for body_html
  6. Deletes draft metafield (cleanup)
  7. Updates MongoDB (postsCount++)
  ↓
Returns redirect(/posts)
  ↓
Shows success toast
  ↓
User sees post in posts list
```

---

## 🎨 COMPONENT PREVIEW PHILOSOPHY

### Strategy: **Representation Preview + Explicit Preview Mode**

#### In Editor (Tiptap NodeView):
**Simplified preview showing structure:**
- ✅ Layout and structure
- ✅ Key data (titles, prices, thumbnails)
- ✅ Desktop layout only (even on mobile editor)
- ✅ Static (no interactions)
- ⚠️ Simplified styling (basic CSS, not full theme)
- ⚠️ No interactive elements (carousel doesn't scroll, lightbox doesn't open)

#### In Preview Mode (Top Bar button):
**Exact render as storefront:**
- ✅ Full Liquid render in merchant's theme
- ✅ All products/images loaded
- ✅ Responsive toggle (desktop/tablet/mobile)
- ✅ Interactive (carousel scrolls, lightbox works, hover effects)
- ✅ Theme styles applied

---

### Component Preview Examples

#### 1. Product Carousel (7 products, show 3 desktop)

**Editor Preview:**
```
┌──────────────────────────────────────────────────────┐
│  🎠 PRODUCT CAROUSEL (7 products)                   │
│                                                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐          │
│  │ Rolex 1  │  │ Rolex 2  │  │ Rolex 3  │  + 4 more│
│  │ $8,950   │  │ $9,200   │  │ $7,800   │          │
│  └──────────┘  └──────────┘  └──────────┘          │
│                                                      │
│  Desktop: Shows 3 slides | Mobile: 1 slide          │
└──────────────────────────────────────────────────────┘
```

**Why simplified:**
- Shows first 3 (desktop default)
- Indicator "+ 4 more" (user knows there are more)
- Static grid (no scroll - would be confusing)
- Hint about mobile behavior

**Preview Mode:**
- Full Swiper carousel (interactive)
- All 7 products scrollable
- Responsive toggle to see mobile (1 slide)

---

#### 2. Shop the Look (Image + Hotspots)

**Editor Preview:**
```
┌──────────────────────────────────────────────────────┐
│  🛍️ SHOP THE LOOK                                    │
│                                                      │
│  ┌─────────────────┐  ┌────────────────────┐        │
│  │                 │  │  📦 3 Products:    │        │
│  │   [Image with   │  │                    │        │
│  │    hotspots]    │  │  • Rolex Watch     │        │
│  │                 │  │    $8,950          │        │
│  │     •1          │  │                    │        │
│  │         •2      │  │  • Cotton Shirt    │        │
│  │       •3        │  │    $89             │        │
│  │                 │  │                    │        │
│  │                 │  │  • Linen Pants     │        │
│  │                 │  │    $120            │        │
│  └─────────────────┘  └────────────────────┘        │
│                                                      │
│  Side-by-side layout | Hotspots clickable in preview│
└──────────────────────────────────────────────────────┘
```

**Why simplified:**
- Shows dots (•1, •2, •3) on image
- Product list visible next to image
- No hover interactions (would be confusing in editor)
- Static layout

**Preview Mode:**
- Hover over dots → product card pops up
- Click dot → scrolls to product
- Add to Cart buttons work

---

#### 3. Image Gallery (6 images, 3-column)

**Editor Preview:**
```
┌──────────────────────────────────────────────┐
│  🖼️ IMAGE GALLERY (6 images)                │
│                                              │
│  ┌──────┐ ┌──────┐ ┌──────┐                │
│  │ Img1 │ │ Img2 │ │ Img3 │  Desktop: 3-col│
│  └──────┘ └──────┘ └──────┘                │
│  ┌──────┐ ┌──────┐ ┌──────┐                │
│  │ Img4 │ │ Img5 │ │ Img6 │                │
│  └──────┘ └──────┘ └──────┘                │
│                                              │
│  Lightbox: Enabled | Mobile: 2-col          │
└──────────────────────────────────────────────┘
```

**Why simplified:**
- Grid with thumbnails (faster load)
- Static (no lightbox click)
- Indicator that lightbox is enabled

**Preview Mode:**
- Click image → PhotoSwipe lightbox opens
- Swipe gestures, zoom, captions
- Mobile: 2-column grid

---

## 🎯 TIPTAP INTEGRATION

### Built-in UI Extensions We Use

#### 1. Drag Handle + Actions Menu (Official Tiptap Pattern)

**On Hover:**
```
┌─────────────────────────────────────┐
│ ⠿ [+]  # Heading 1                  │  ← Hover shows handles
│                                     │
│ ⠿ [+]  Paragraph content...         │
│                                     │
│ ⠿ [+]  [🎠 Product Carousel 1]      │  ← Can drag entire block
│                                     │
│ ⠿ [+]  More content...              │
│                                     │
│ ⠿ [+]  [🎠 Product Carousel 2]      │  ← Second carousel
│                                     │
└─────────────────────────────────────┘
```

**[⠿] = Drag Handle:**
- Hold to drag (reorder blocks)
- Works for ALL node types (headings, paragraphs, components)

**[+] = Add Button:**
- Click to insert new block below
- Quick insert menu appears

---

#### 2. Component Selection + Bubble Menu

**User clicks carousel:**
```
┌──────────────────────────────────────┐
│                                      │
│ ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓  │  ← Selected (outline)
│ ┃  [🎠 Product Carousel 2]       ┃  │
│ ┃  [Watch 1] [Watch 2] [Watch 3] ┃  │
│ ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛  │
│                                      │
│ ┌─────────────────────────────────┐ │
│ │ [⚙️ Edit] [🗑️ Delete] [⬆️] [⬇️] │ │  ← Bubble menu
│ └─────────────────────────────────┘ │
└──────────────────────────────────────┘
```

**Bubble Menu Actions:**
- **[⚙️ Edit]** → Opens config panel
- **[🗑️ Delete]** → Removes component
- **[⬆️] Move Up** → Reorders upward
- **[⬇️] Move Down** → Reorders downward

---

#### 3. Floating Menu (Quick Insert)

**Empty line:**
```
┌──────────────────────────────────┐
│ Some content...                  │
│                                  │
│ [+ Click to add]  ← Empty line   │
│                                  │
└──────────────────────────────────┘

Click [+] → Dropdown:
┌─────────────────┐
│ Text            │
│ ──────────────  │
│ 📝 Heading      │
│ 📄 Paragraph    │
│                 │
│ Media           │
│ ──────────────  │
│ 🖼️ Image        │
│ 🎬 Video        │
│                 │
│ Components      │
│ ──────────────  │
│ 🎴 Product Card │
│ 🎠 Carousel     │
│ 🖼️ Gallery      │
└─────────────────┘
```

---

### Tiptap Event Handlers
```javascript
const editor = useEditor({
  extensions: [
    // Core
    Document,
    Paragraph,
    Text,
    Heading,
    // ... more
    
    // Custom components
    ProductCard,
    ProductCarousel,
    Gallery,
    CTABox,
    ShopTheLook,
    
    // UI extensions
    DragHandle.configure({
      render: () => {
        const handle = document.createElement('div');
        handle.className = 'drag-handle';
        handle.innerHTML = '⠿';
        return handle;
      }
    }),
    
    BubbleMenu.configure({
      element: bubbleMenuElement,
      shouldShow: ({ editor, state }) => {
        const { node } = state.selection;
        return node && isCustomComponent(node.type.name);
      }
    }),
    
    FloatingMenu.configure({
      element: floatingMenuElement,
      shouldShow: ({ editor, state }) => {
        const { $anchor } = state.selection;
        return $anchor.parent.type.name === 'paragraph' && 
               $anchor.parent.content.size === 0;
      }
    })
  ],
  
  content: initialContent,
  
  // Event handlers - Tiptap → Reducer sync
  onUpdate: ({ editor }) => {
    dispatch({ type: 'CONTENT_CHANGED' });
  },
  
  onSelectionUpdate: ({ editor }) => {
    const { node, from } = editor.state.selection;
    
    if (node && isCustomComponent(node.type.name)) {
      dispatch({
        type: 'SELECT_COMPONENT',
        componentType: node.type.name,
        componentId: node.attrs.id,
        position: from
      });
    } else {
      dispatch({ type: 'DESELECT_COMPONENT' });
    }
  }
});
```

---

## 🔧 TECHNICAL IMPLEMENTATION

### 1. Reducer Actions
```javascript
function editorReducer(state, action) {
  switch (action.type) {
    
    // ========================================
    // METADATA
    // ========================================
    case 'UPDATE_METADATA':
      return {
        ...state,
        metadata: {
          ...state.metadata,
          [action.field]: action.value
        },
        save: { ...state.save, hasUnsavedChanges: true }
      };
    
    case 'SET_FEATURED_IMAGE':
      return {
        ...state,
        metadata: {
          ...state.metadata,
          featuredImage: action.image
        },
        save: { ...state.save, hasUnsavedChanges: true }
      };
    
    // ========================================
    // UI STATE
    // ========================================
    case 'OPEN_PANEL':
      return {
        ...state,
        ui: { ...state.ui, panelOpen: action.panel }
      };
    
    case 'CLOSE_PANEL':
      return {
        ...state,
        ui: { 
          ...state.ui, 
          panelOpen: null,
          selectedComponent: null 
        }
      };
    
    case 'SELECT_COMPONENT':
      return {
        ...state,
        ui: {
          ...state.ui,
          selectedComponent: {
            type: action.componentType,
            id: action.componentId,
            position: action.position
          },
          panelOpen: 'component-config'  // Auto-open
        }
      };
    
    case 'DESELECT_COMPONENT':
      return {
        ...state,
        ui: { 
          ...state.ui, 
          selectedComponent: null 
        }
      };
    
    // ========================================
    // SAVE STATE
    // ========================================
    case 'SAVE_STARTED':
      return {
        ...state,
        save: {
          ...state.save,
          status: 'saving',
          hasUnsavedChanges: false
        }
      };
    
    case 'SAVE_SUCCESS':
      return {
        ...state,
        save: {
          status: 'saved',
          lastSaved: action.timestamp,
          hasUnsavedChanges: false,
          error: null
        }
      };
    
    case 'SAVE_ERROR':
      return {
        ...state,
        save: {
          status: 'error',
          lastSaved: state.save.lastSaved,
          hasUnsavedChanges: true,
          error: action.error
        }
      };
    
    case 'CONTENT_CHANGED':
      return {
        ...state,
        save: { ...state.save, hasUnsavedChanges: true }
      };
    
    // ========================================
    // EDITOR REFERENCE
    // ========================================
    case 'SET_EDITOR':
      return {
        ...state,
        editor: action.editor
      };
    
    // ========================================
    // LAZY DATA
    // ========================================
    case 'SET_PRODUCTS':
      return {
        ...state,
        data: { ...state.data, products: action.products }
      };
    
    case 'SET_IMAGES':
      return {
        ...state,
        data: { ...state.data, images: action.images }
      };
    
    default:
      return state;
  }
}
```

---

### 2. Auto-save Implementation
```javascript
// In <EditorPage>
function EditorPage() {
  const [state, dispatch] = useReducer(editorReducer, initialState);
  const autoSaveFetcher = useFetcher();
  
  // Auto-save effect
  useEffect(() => {
    // Check if there are unsaved changes
    const hasChanges = 
      state.save.hasUnsavedChanges || 
      (state.editor && !state.editor.isEmpty);
    
    if (!hasChanges) return;
    
    // Debounce 10 seconds
    const timer = setTimeout(() => {
      const payload = {
        content: state.editor.getJSON(),    // From Tiptap
        metadata: state.metadata            // From reducer
      };
      
      autoSaveFetcher.submit(payload, {
        method: 'post',
        action: '/api/drafts/autosave',
        encType: 'application/json'
      });
      
      dispatch({ type: 'SAVE_STARTED' });
    }, 10000); // 10 seconds
    
    return () => clearTimeout(timer);
  }, [
    state.metadata,
    state.editor?.state.doc,        // Reactive Tiptap document
    state.save.hasUnsavedChanges
  ]);
  
  // Handle auto-save response
  useEffect(() => {
    if (autoSaveFetcher.state === 'idle' && autoSaveFetcher.data) {
      if (autoSaveFetcher.data.success) {
        dispatch({ 
          type: 'SAVE_SUCCESS', 
          timestamp: Date.now() 
        });
      } else {
        dispatch({ 
          type: 'SAVE_ERROR', 
          error: autoSaveFetcher.data.error 
        });
      }
    }
  }, [autoSaveFetcher.state, autoSaveFetcher.data]);
  
  // ... rest of component
}
```

---

### 3. Component NodeView Example
```javascript
// extensions/ProductCarousel/ProductCarouselNodeView.jsx
import { NodeViewWrapper } from '@tiptap/react';

export function ProductCarouselNodeView({ 
  node, 
  selected,
  updateAttributes,
  deleteNode 
}) {
  const { products, slidesPerView } = node.attrs;
  
  const visibleProducts = products.slice(0, slidesPerView.desktop);
  const hiddenCount = products.length - visibleProducts.desktop;
  
  return (
    <NodeViewWrapper 
      className={`product-carousel-preview ${selected ? 'selected' : ''}`}
    >
      <div className="component-header">
        <span className="icon">🎠</span>
        <span className="title">Product Carousel</span>
        <span className="count">({products.length} products)</span>
      </div>
      
      <div 
        className="carousel-grid" 
        style={{ 
          gridTemplateColumns: `repeat(${slidesPerView.desktop}, 1fr)` 
        }}
      >
        {visibleProducts.map(product => (
          <div key={product.id} className="product-card-mini">
            <img src={product.image} alt={product.title} />
            <h4>{product.title}</h4>
            <p>{product.price}</p>
          </div>
        ))}
      </div>
      
      {hiddenCount > 0 && (
        <div className="more-indicator">
          + {hiddenCount} more
        </div>
      )}
      
      <div className="settings-hint">
        Desktop: {slidesPerView.desktop} slides | 
        Mobile: {slidesPerView.mobile} slide
      </div>
    </NodeViewWrapper>
  );
}
```

---

### 4. Component Config Panel
```javascript
// panels/ComponentConfigPanel.jsx
function ComponentConfigPanel({ state, dispatch, editor }) {
  const { selectedComponent } = state.ui;
  
  if (!selectedComponent) {
    return <ComponentsListPanel editor={editor} />;
  }
  
  // Get the actual node from Tiptap
  const node = getNodeById(editor, selectedComponent.id);
  
  // Render specific config based on component type
  switch (selectedComponent.type) {
    case 'productCarousel':
      return <ProductCarouselConfig node={node} editor={editor} />;
    case 'productCard':
      return <ProductCardConfig node={node} editor={editor} />;
    case 'gallery':
      return <GalleryConfig node={node} editor={editor} />;
    // ... more
    default:
      return null;
  }
}

// Product Carousel Config
function ProductCarouselConfig({ node, editor }) {
  const [products, setProducts] = useState(node.attrs.products);
  const [settings, setSettings] = useState(node.attrs.slidesPerView);
  
  // Debounced update to Tiptap
  useEffect(() => {
    const timer = setTimeout(() => {
      editor.commands.updateAttributes('productCarousel', {
        products,
        slidesPerView: settings
      });
    }, 300);
    
    return () => clearTimeout(timer);
  }, [products, settings]);
  
  return (
    <div className="config-panel">
      <button 
        className="back-button"
        onClick={() => dispatch({ type: 'DESELECT_COMPONENT' })}
      >
        ← Back to Components
      </button>
      
      <h3>Product Carousel Config</h3>
      
      <ProductSelector
        selected={products}
        onChange={setProducts}
        max={20}
      />
      
      <div className="settings-section">
        <label>Desktop slides:</label>
        <Slider
          value={settings.desktop}
          onChange={(val) => setSettings({ ...settings, desktop: val })}
          min={1}
          max={6}
        />
        
        <label>Tablet slides:</label>
        <Slider
          value={settings.tablet}
          onChange={(val) => setSettings({ ...settings, tablet: val })}
          min={1}
          max={4}
        />
        
        <label>Mobile slides:</label>
        <Slider
          value={settings.mobile}
          onChange={(val) => setSettings({ ...settings, mobile: val })}
          min={1}
          max={2}
        />
      </div>
      
      <button 
        className="delete-button"
        onClick={() => {
          editor.commands.deleteNode('productCarousel');
          dispatch({ type: 'DESELECT_COMPONENT' });
        }}
      >
        🗑️ Remove Component
      </button>
    </div>
  );
}
```

---

## 📱 MOBILE CONSIDERATIONS

### Responsive Layout Strategy

**Desktop (>768px):**
```
[Sidebar 56px] [Panel 300px] [Editor flex]
```

**Mobile (<768px):**
```
[Editor fullwidth]
[Bottom Bar 60px]
  Tap icon → Full-screen overlay
```

### Mobile Implementation
```javascript
// In <EditorPage>
const isMobile = useMediaQuery('(max-width: 768px)');

return (
  <>
    {isMobile ? (
      <MobileLayout>
        <TopBar compact />
        <EditorArea fullwidth />
        <BottomBar>
          {[SettingsIcon, TextIcon, ImageIcon, AppsIcon, MagicIcon].map(Icon => (
            <IconButton 
              icon={Icon}
              onClick={() => openBottomSheet(iconName)}
            />
          ))}
        </BottomBar>
        
        {state.ui.mobileBottomSheetOpen && (
          <BottomSheet onClose={closeBottomSheet}>
            {renderPanelContent(state.ui.mobileBottomSheetOpen)}
          </BottomSheet>
        )}
      </MobileLayout>
    ) : (
      <DesktopLayout>
        <Sidebar />
        <SlidingPanel />
        <EditorArea />
      </DesktopLayout>
    )}
  </>
);
```

### Mobile Component Config

- **Bottom Sheet** (iOS/Android style)
- Slides up from bottom (not full screen)
- Swipe down to dismiss
- Can scroll within sheet if content is long

---

## ⚡ PERFORMANCE OPTIMIZATIONS

### 1. Debounced Updates
- **Config panel → Tiptap:** 300ms debounce
- **Auto-save:** 10 seconds debounce
- **Search inputs:** 500ms debounce

### 2. Lazy Loading
- Products: Fetch on first config panel open
- Images: Fetch on media panel open
- Heavy libraries: Code split (Swiper, PhotoSwipe)

### 3. Memoization
```javascript
// In NodeViews
const ProductCarouselNodeView = memo(({ node, ...props }) => {
  // Only re-render if node.attrs actually changed
  return <NodeViewWrapper>...</NodeViewWrapper>;
}, (prevProps, nextProps) => {
  return isEqual(prevProps.node.attrs, nextProps.node.attrs);
});
```

### 4. Virtual Scrolling
- Product selector: React Virtual if >100 products
- Image gallery config: Virtual grid if >50 images

### 5. Optimistic UI
- Save status updates instantly (before server confirms)
- Component preview updates instantly (before Tiptap sync)
- Rollback on error

---

## 🚀 NEXT STEPS

### Phase 1: Foundation (Week 1-2)
1. **Setup:**
   - Initialize React Router 7 project
   - Install Tiptap + extensions
   - Setup reducer structure
   - Configure Polaris Web Components

2. **Basic Layout:**
   - TopBar component
   - Sidebar component (5 icons)
   - SlidingPanel component (show/hide logic)
   - EditorArea container

3. **Tiptap Integration:**
   - Initialize editor with basic extensions
   - Heading, Paragraph, Text nodes
   - Placeholder ("Start writing...")
   - Basic styling

4. **State Management:**
   - Implement reducer with all actions
   - Wire up to components
   - Test state flow

---

### Phase 2: Metadata & Auto-save (Week 2-3)
1. **PostSettingsPanel:**
   - Featured image upload
   - Author select
   - Slug input (auto-generate)
   - Tags input
   - SEO section (collapsible)

2. **Auto-save:**
   - Implement 10s debounced save
   - Shop metafield storage (drafts)
   - Save status indicator
   - Error handling

3. **Loader/Action:**
   - Draft loading on page load
   - Publish action implementation

---

### Phase 3: Text & Media (Week 3-4)
1. **TextElementsPanel:**
   - Heading buttons (H1-H3)
   - List buttons
   - Other elements (divider, code, table)

2. **MediaPanel:**
   - Single image upload
   - Shopify Media Library integration
   - Basic image gallery

3. **Tiptap Extensions:**
   - Image node
   - Proper image upload handling

---

### Phase 4: First Component (Week 4-5)
1. **Product Card:**
   - Tiptap extension definition
   - NodeView component (preview)
   - Config panel
   - Product selector (with search)

2. **Tiptap UI:**
   - Drag handle extension
   - Bubble menu (edit/delete/move)
   - Floating menu (quick insert)

3. **Selection Logic:**
   - Click component → select
   - Show bubble menu
   - Open config panel

---

### Phase 5: More Components (Week 5-7)
1. **Product Carousel**
2. **Image Gallery**
3. **CTA Box**
4. **Shop the Look**

For each:
- Extension definition
- NodeView preview
- Config panel
- Testing

---

### Phase 6: Preview & Publish (Week 7-8)
1. **Preview Mode:**
   - Modal with iframe
   - Liquid render endpoint
   - Responsive toggle
   - Live refresh

2. **Publish Flow:**
   - Validation
   - Tier limit checks
   - Article creation
   - Metafield storage
   - Success/error handling

---

### Phase 7: Polish & Mobile (Week 8-10)
1. **Mobile Responsive:**
   - Bottom bar
   - Bottom sheet panels
   - Touch interactions

2. **Error Boundaries:**
   - Shopify ErrorBoundary
   - Graceful fallbacks

3. **Loading States:**
   - Skeletons
   - Spinners
   - Progress indicators

4. **Performance:**
   - Code splitting
   - Lazy loading
   - Virtual scrolling

---

### Phase 8: AI Summary (Week 10-12) - OPTIONAL
1. **AI Panel:**
   - Trigger analysis (manual)
   - Show checklist
   - Suggestions with actions

2. **LLM Integration:**
   - System prompts
   - Response parsing
   - Error handling

---

## 📚 RELATED DOCUMENTATION

- [Editor UI/UX Specification](./editor-ui-ux-spec.md) - Visual design & interactions
- [Storage Architecture](./storage-map.md) - Where data lives (Shopify vs MongoDB)
- [Metafield Reference](./metafield-reference.md) - Metafield structure
- [API Endpoints](./api-endpoints.md) - Backend routes
- [Component Specs](./component-specs/) - Individual component documentation

---

## ✅ KEY DECISIONS SUMMARY

1. **State:** Tiptap owns content, Reducer owns metadata + UI
2. **Preview:** Simplified in editor, exact in Preview Mode
3. **Editing:** Config panel only (not inline in editor)
4. **Selection:** Click component → bubble menu → config panel
5. **Tiptap UI:** Drag handle + bubble menu + floating menu (official patterns)
6. **Auto-save:** 10 seconds debounce, Shop metafields
7. **Data Loading:** Hybrid (critical in loader, heavy lazy)
8. **Mobile:** Bottom bar + bottom sheets
9. **Components:** Show desktop layout in editor, hint for mobile

---

**Document End**

Ready for implementation! 🚀