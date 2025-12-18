# Editor Interface - UX/UI Specification

**Version:** 1.0  
**Last Updated:** 2024-12-17  
**Status:** Design Complete - Ready for Implementation

---

## 🎯 OVERVIEW

Blog Builder editor to full-screen WYSIWYG interface dla tworzenia rich blog posts. Składa się z:
- **Fixed Sidebar** (56px) - główna nawigacja
- **Sliding Panel** (300-350px) - kontekstowe opcje
- **Editor Area** (flex) - Tiptap WYSIWYG editor
- **Top Bar** - akcje globalne (Preview, Publish)
- **Mobile** - Bottom bar + full-screen overlays

---

## 🏗️ LAYOUT STRUCTURE

### Desktop (>1200px)
```
┌────────────────────────────────────────────────────────────────┐
│ [🏠 Blog Builder]    [💾 Saved 2m ago]    [👁️ Preview] [🚀 Publish] │ ← TOP BAR
├────────┬──────────────────────┬──────────────────────────────────┤
│        │                      │                                  │
│  56px  │      300-350px       │         Remaining Space          │
│ SIDEBAR│    SLIDING PANEL     │         TIPTAP EDITOR            │
│        │   (contextual)       │                                  │
│        │                      │  # Post Title (H1)               │
│   ⚙️   │  [Settings Form]     │                                  │
│   📝   │                      │  Content starts here...          │
│   🖼️   │                      │                                  │
│   🎨   │                      │  [Product Card Component]        │
│   ✨   │                      │                                  │
│        │                      │  More content...                 │
│        │                      │                                  │
└────────┴──────────────────────┴──────────────────────────────────┘
```

### Mobile (<768px)
```
┌────────────────────────────────────────────────────────────────┐
│ [🏠 Blog Builder]              [👁️ Preview] [🚀 Publish]        │ ← TOP BAR
├────────────────────────────────────────────────────────────────┤
│                                                                │
│                    TIPTAP EDITOR                               │
│                    (Full Width)                                │
│                                                                │
│   # Post Title                                                 │
│                                                                │
│   Content here...                                              │
│                                                                │
├────────────────────────────────────────────────────────────────┤
│  [⚙️] [📝] [🖼️] [🎨] [✨]                                     │ ← BOTTOM BAR
└────────────────────────────────────────────────────────────────┘

Tap icon → Full screen overlay with options
```

---

## 🎨 SIDEBAR SECTIONS (5 Icons)

### 1. ⚙️ POST SETTINGS
**Icon:** `SettingsIcon` (Polaris)  
**Purpose:** Post metadata and configuration

**Content:**
- Featured Image (upload + preview with alt text)
- Author (select dropdown with "Use default" checkbox)
- URL Slug (auto-generated from title, editable)
- Blog (select, only if merchant has >1 blog)
- Tags (add/remove with chips)
- SEO Settings (collapsible section):
  - Meta Title (60 char limit with counter)
  - Meta Description (160 char limit with counter)
  - Default: **Expanded for new posts**
- Status (Draft/Published - only editable after first publish)

**Behavior:**
- Default: Collapsed on page load
- Toggle: Click icon to open/close
- Auto-save: All changes saved automatically (2s debounce)

---

### 2. 📝 TEXT
**Icon:** `TextIcon` or `TypeIcon` (Polaris)  
**Purpose:** Insert basic text formatting elements

**Content Groups:**

**Text Formatting:**
- Heading 1 (H1) - only for title, one per post
- Heading 2 (H2)
- Heading 3 (H3)
- Paragraph
- Blockquote

**Lists:**
- Bullet List
- Numbered List
- Checklist (optional - Phase 2)

**Other:**
- Horizontal Divider (---)
- Code Block
- Table (basic 2x2, expandable)

**Behavior:**
- Click element → Inserts at cursor position (if focused) or end of post
- Keyboard shortcuts shown in tooltips (hover over element)
- Alternative: Slash commands (e.g., `/h2`, `/quote`)

---

### 3. 🖼️ MEDIA
**Icon:** `ImageIcon` (Polaris)  
**Purpose:** Insert images and video embeds

**Content:**

**Images:**
- Single Image Upload
  - Shopify Media Library integration
  - Direct file upload (drag & drop support)
  - Alt text field (required for SEO)
  - Caption (optional)
  - Alignment options (left, center, right)

**Image Gallery** (Phase 1)
- Multiple image upload
- Grid layout options (2-col, 3-col, 4-col)
- Lightbox enable/disable
- Captions per image

**Video:**
- YouTube Embed (URL paste)
- Vimeo Embed (URL paste)
- Lazy loading (default on)

**Behavior:**
- Click → Insert at cursor or end
- Images stored in Shopify Media Library
- Preview shown immediately after upload

---

### 4. 🎨 COMPONENTS
**Icon:** `AppsIcon` or `LayoutBlockIcon` (Polaris)  
**Purpose:** Insert custom interactive components

**Content - Phase 1:**

1. **🎴 Product Card**
   - Description: "Showcase single product with image, price, and CTA"
   
2. **🖼️ Image Gallery**
   - Description: "Grid of images with lightbox"
   
3. **🎠 Product Carousel**
   - Description: "Scrollable product showcase"
   
4. **📢 CTA Box**
   - Description: "Call-to-action section with button"

**Content - Phase 2:**

5. **🔗 Custom Link Preview**
   - Description: "Hoverable product preview on links"
   
6. **❓ FAQ Accordion**
   - Description: "Collapsible Q&A with schema.org markup"
   
7. **📊 Comparison Table**
   - Description: "Side-by-side product comparison"

8. **🔒 More components (PRO)**
   - Tier-gated components (upgrade prompt)

**Behavior:**
- Click component → Inserts at cursor or end of post
- Automatically opens **Component Config Panel** (same sliding panel space)
- Config panel shows:
  - Back button (return to component list)
  - Component-specific settings
  - Live preview (if applicable)
  - "Remove Component" button

**Component Configuration Example (Product Card):**
```
┌─ < BACK ─────────────────────────┐
│                                  │
│ 🎴 PRODUCT CARD CONFIG           │
│                                  │
│ Select Product:                  │
│ [Search products... 🔍]          │
│                                  │
│ ✓ Rolex Submariner               │
│   $8,950                         │
│   [Thumbnail preview]            │
│                                  │
│ Layout Style:                    │
│ ○ Hover Overlay                  │
│ ○ Side by Side                   │
│ ○ Minimal                        │
│                                  │
│ Display Options:                 │
│ ☑ Show Title                     │
│ ☑ Show Price                     │
│ ☑ Show Image                     │
│ ☑ Show Button                    │
│ ☐ Show Vendor                    │
│ ☐ Show Description               │
│                                  │
│ Button Text:                     │
│ [Shop Now ▼]                     │
│ ☐ Open in new tab                │
│                                  │
│ [Remove Component]               │
│                                  │
└──────────────────────────────────┘
```

**Editor Preview:**
- Components render as React Node Views in Tiptap
- Show approximate preview (not 100% accurate to Liquid output)
- Hover → Show edit/delete buttons
- Click → Open config panel again

---

### 5. ✨ AI SUMMARY
**Icon:** `MagicIcon` (Polaris)  
**Purpose:** AI-powered content analysis and SEO suggestions

⚠️ **Status:** Phase 2 - Design in Progress, Not Priority for MVP

**Planned Functionality:**

**Analysis Trigger:**
- Manual only (user clicks "Analyze" button)
- No auto-analysis to control API costs

**Analysis Output:**
- SEO Score (X/10)
- Reading Time (calculated)
- Word Count
- Content Quality Checklist:
  - ✅ Has meta description
  - ⚠️ Missing alt text on images
  - ✅ Good heading structure
  - ⚠️ No internal links
  - etc.

**Suggestions (Checklist Format):**
- ⚠️ Add FAQ section for rich snippets potential
- ⚠️ Include comparison table for featured products
- ℹ️ Title could be more engaging
- ⚠️ Add more images (minimum 3 recommended)

**Actions:**
- [Apply suggestion] - Auto-fix if possible
- [Dismiss] - Hide suggestion
- [Re-analyze] - Run analysis again

**Future Enhancements:**
- Keyword research
- Competitor analysis
- Auto-generate meta descriptions
- Content readability score (Flesch-Kincaid)
- LLM optimization tips

**Prompt Engineering:**
- System prompts to be designed
- Response format: Structured JSON
- Focus: SEO + LLM visibility (Google AI Overviews, ChatGPT, etc.)

---

## 🔝 TOP BAR ACTIONS

### Left Side:
- **🏠 Blog Builder Logo** - Click to return to dashboard
  - On unsaved changes → Show confirmation modal

### Center:
- **💾 Auto-save Status**
  - "Saved 2 minutes ago" (updates live)
  - "Saving..." (during save operation)
  - "Failed to save" (red, with retry button)

### Right Side:
- **👁️ Preview Button** (Polaris Button, secondary)
  - Opens preview modal/new tab
  - Shows post rendered in merchant's theme
  - Live refresh every 5s if editing
  
- **🚀 Publish Button** (Polaris Button, primary)
  - Opens publish modal with checklist
  - Validation before publish
  - Shows SEO score and warnings

---

## 📱 MOBILE BEHAVIOR

### Bottom Bar (Fixed)
5 icons in horizontal row:
```
[⚙️] [📝] [🖼️] [🎨] [✨]
```

**Behavior:**
- Tap icon → Full-screen overlay with section content
- Native iOS/Android bottom sheet style
- Swipe down to dismiss
- Editor remains visible behind (dimmed)

### Component Configuration on Mobile:
- **Bottom Sheet** (not full screen)
- Slides up from bottom (native feel)
- Can scroll within sheet if content is long
- Actions at bottom: [Cancel] [Save]

### Keyboard Considerations:
- Editor auto-scrolls to keep cursor visible
- Bottom bar hides when keyboard is open
- Floating save button appears (top right) when keyboard active

---

## 🎯 POST TITLE HANDLING

**Decision:** Title is H1 element in Tiptap editor (not separate field)

**Why:**
- Natural writing flow - see title while writing
- WYSIWYG principle
- No context switch needed

**Implementation:**
- First H1 in editor content auto-syncs to `post.title` field
- Placeholder: "Untitled Post" (if empty)
- In Post Settings panel: Show readonly preview with link "Click to edit in content"
- Only ONE H1 allowed per post (enforced by Tiptap)

**Validation:**
- Title required for publish
- If empty on publish attempt → Show modal with error

---

## 🎨 DESIGN SYSTEM

### Framework:
**Shopify Polaris** (Web Components - `<s-*>` tags)

**Why:**
- Built for Shopify ecosystem
- Accessible out of the box
- Professional appearance
- "Built for Shopify" compliance
- No custom CSS needed (MVP)

### Icons:
**Shopify Polaris Icons** (imported as needed)

**Confirmed Choices:**
- `SettingsIcon` - Post Settings
- `TextIcon` or `TypeIcon` - Text
- `ImageIcon` - Media
- `AppsIcon` or `LayoutBlockIcon` - Components
- `MagicIcon` - AI Summary

### Colors:
- Use Polaris tokens (no custom colors in MVP)
- Primary: Shopify brand color (emerald green)
- Consistent with admin theme

### Typography:
- Polaris default font stack
- Merchant's theme fonts NOT applied in admin (only storefront)

### Spacing:
- Sidebar: 56px fixed width
- Panel: 300-350px (responsive based on screen)
- Editor padding: 24px (comfortable reading width)

---

## ⚡ PERFORMANCE CONSIDERATIONS

### Editor Load Time:
- Tiptap initializes on page load
- Extensions loaded lazily (only what's needed)
- Component previews rendered on-demand

### Auto-save:
- Debounced 2 seconds after last change
- Optimistic UI updates (instant feedback)
- Silent failures logged (toast only on critical errors)

### Image Handling:
- Upload to Shopify Media Library (CDN)
- Thumbnails generated automatically
- Lazy loading for gallery components

---

## 🔔 NOTIFICATIONS & FEEDBACK

### Toast Notifications (Shopify Polaris Toast)

**When to Show:**

✅ **Always Show:**
- Manual save success
- Publish success
- Publish failure (with error details)
- Auto-save failure (with retry option)

❌ **Never Show:**
- Auto-save success (silent, just update status text)

ℹ️ **Optionally Show (User Preference):**
- SEO tips (e.g., "Add alt text for better SEO")
- Component usage hints (first time only)

**Toast Types:**
- Success (green)
- Error (red)
- Warning (yellow)
- Info (blue)

**Duration:**
- Success: 3 seconds (auto-dismiss)
- Error: 5 seconds + manual dismiss
- Info: 4 seconds + manual dismiss

---

## ⌨️ KEYBOARD SHORTCUTS

### MVP (Phase 1):
- `Cmd/Ctrl + S` - Manual save
- `Cmd/Ctrl + Shift + P` - Open Preview
- `Cmd/Ctrl + Shift + Enter` - Open Publish modal
- Tiptap defaults:
  - `Cmd/Ctrl + B` - Bold
  - `Cmd/Ctrl + I` - Italic
  - `Cmd/Ctrl + K` - Add link
  - `Cmd/Ctrl + Z` - Undo
  - `Cmd/Ctrl + Shift + Z` - Redo

### Phase 2:
- `Cmd/Ctrl + /` - Toggle sidebar panel
- `Cmd/Ctrl + E` - Focus editor
- Shortcut cheatsheet modal (`?` key)

---

## 🚨 ERROR HANDLING & VALIDATION

### Validation Strategy:
**Two-Level Approach:**

1. **Inline Validation** (Immediate)
   - Red border on required fields (if empty)
   - Helper text below field (e.g., "Title is required")
   - Shown on blur (when user leaves field)

2. **Summary Modal** (On Publish)
   - Shows ALL validation errors at once
   - Checklist format:
```
     ⚠️ Cannot Publish
     
     Please fix these issues:
     • Title is required
     • Featured image missing
     • No meta description
     
     [Fix Issues] [Save as Draft]
```

### Error Boundaries:
- Shopify App Bridge ErrorBoundary wraps editor
- Catches React errors gracefully
- Shows friendly error message + retry option
- Logs to Sentry (for debugging)

### API Failures:
- Auto-save failure → Toast + retry button
- Publish failure → Modal with error details
- Product fetch failure → Show placeholder in component config

---

## 🎭 EMPTY STATES

### New Post (First Load):

**Editor Placeholder:**
```
# Start writing or press / for commands

💡 Tip: Use the sidebar to insert images and custom components
```

**Behavior:**
- Placeholder disappears on first character typed
- Gentle, non-intrusive
- No modal/overlay (trust user intelligence)

### No Components Yet:
```
🎨 No components added yet

Try adding a Product Card or Image Gallery to make your post more engaging!

[Browse Components →]
```

---

## 🛡️ UNSAVED CHANGES PROTECTION

### When to Show Warning:

User tries to leave page (navigate away or close tab) AND:
- Last successful save > 5 seconds ago
- OR auto-save is currently failing

**Modal Content:**
```
⚠️ Unsaved Changes

You have unsaved changes that will be lost.

[Cancel] [Leave Without Saving]
```

**Implementation:**
- `beforeunload` event listener
- React Router navigation guard
- Check save status before allowing navigation

---

## 📊 ANALYTICS EVENTS (PostHog)

Track these user interactions:

### Editor Usage:
- `editor_opened` - User entered editor
- `editor_component_inserted` - Component added (which type)
- `editor_text_element_inserted` - Text element added (which type)
- `editor_image_uploaded` - Image uploaded
- `editor_auto_saved` - Auto-save successful
- `editor_manual_saved` - Manual save triggered

### Publish Flow:
- `post_preview_opened` - Preview clicked
- `post_publish_attempted` - Publish clicked
- `post_published_success` - Post published
- `post_publish_failed` - Publish failed (with error reason)

### AI Summary (Phase 2):
- `ai_summary_triggered` - Analysis started
- `ai_summary_completed` - Analysis finished
- `ai_suggestion_applied` - User applied suggestion
- `ai_suggestion_dismissed` - User dismissed suggestion

---

## ✅ IMPLEMENTATION CHECKLIST

### Phase 1 (MVP):
- [ ] Basic layout structure (sidebar + panel + editor)
- [ ] Tiptap integration with extensions
- [ ] Post Settings panel (all fields)
- [ ] Text elements panel (headings, lists, etc.)
- [ ] Media panel (single image + basic gallery)
- [ ] Components panel (Product Card + Gallery + Carousel + CTA)
- [ ] Component config panels (for each component)
- [ ] Top bar actions (Preview + Publish)
- [ ] Mobile responsive layout (bottom bar)
- [ ] Auto-save functionality (2s debounce)
- [ ] Toast notifications
- [ ] Validation (inline + summary)
- [ ] Error boundaries
- [ ] Unsaved changes protection
- [ ] Empty states
- [ ] Keyboard shortcuts (basic)

### Phase 2 (Post-MVP):
- [ ] AI Summary panel (full functionality)
- [ ] Additional components (FAQ, Comparison Table, Link Preview)
- [ ] Advanced keyboard shortcuts + cheatsheet
- [ ] SEO tips/hints toasts
- [ ] Reading time + word count in bottom bar (if needed)
- [ ] Component usage analytics
- [ ] A/B test different layouts

---

## 🔗 RELATED DOCUMENTATION

- [Editor Architecture](./editor-architecture.md) - Component structure & state management
- [Tiptap Extensions](./tiptap-extensions.md) - Custom node definitions
- [Component Specs](./component-specs.md) - Each component's behavior & config
- [API Endpoints](./api-endpoints.md) - Backend routes for editor
- [Theme Extension](./theme-extension.md) - Storefront rendering

---

## 📝 OPEN QUESTIONS / FUTURE DECISIONS

1. **AI Summary Prompts** - System prompts need design (Phase 2)
2. **Component Preview Accuracy** - How close React preview matches Liquid output?
3. **Undo/Redo Limits** - How many steps to keep in history?
4. **Draft Auto-cleanup** - How long to keep unsaved drafts? (30 days?)
5. **Mobile Keyboard Handling** - iOS vs Android differences?
6. **RTL Support** - Do we need right-to-left language support? (Future)

---

**Document End**