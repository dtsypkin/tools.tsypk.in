## Specification: tools.tsypk.in (Micro-Tools Platform)  
  
## 1. Executive Summary & Vision  
`tools.tsypk.in` is a lightweight, mobile-first web application designed to host a growing collection of standalone micro-tools. The platform is optimized for speed, full offline capability (PWA), and effortless one-handed mobile operation.  
  
## 2. Tech Stack & Architecture  
  
### Stack Definition  
* **Build Tool & Framework:** Vite + React (TypeScript)  
* **Styling:** Tailwind CSS  
* **Icons:** Lucide React (`lucide-react`)  
* **PWA Integration:** `vite-plugin-pwa` (Workbox service worker)  
* **Deployment & Hosting:** Cloudflare Workers Static Assets (Free Tier)  
* **State Management:** React local state + `localStorage` for temporary persistence.  

### Cloudflare Workers Compatibility
For Cloudflare's Workers build/runtime configuration, keep the `compatibility_date` in
`wrangler.jsonc` set to the current date when the configuration is created or intentionally
updated. For example, on 2026-10-02 the setting is:

```jsonc
"compatibility_date": "2026-10-02",
```

This makes the project use the Workers runtime behavior current at that date. Update the date
deliberately and test the build before deploying, rather than allowing an old compatibility date
to remain unnoticed.

This is a client-rendered Vite application. Its Workers configuration must use
`assets.directory: "./dist"` and `assets.not_found_handling: "single-page-application"`.
Do not configure a `main` entry point or create `src/index.ts`: static assets require no Worker
script, and the SPA fallback serves `index.html` for direct visits to tool routes.
  
### Key Directory Structure  
```text  
/  
├── public/                 # Static assets, favicon, web manifest icons  
├── src/  
│   ├── components/         # Shared UI components (Layout, Header, CurrencyPicker)  
│   ├── config/             # Tools registry (tools.config.ts)  
│   ├── pages/              # Page routes (Home catalog, Tool views)  
│   ├── tools/              # Isolated micro-tool logic & UI modules  
│   │   └── price-comparator/  
│   ├── styles/             # Global CSS / Tailwind directives  
│   └── utils/              # Calculation helpers & formatting utilities  
├── PROJECT_SPEC.md         # Repository specification document  
├── vite.config.ts          # Vite & PWA setup  
└── package.json  
```

## 3. Site-Wide Core Requirements  
### 3.1 Routing & Navigation  
* / — **Main Catalog Page**: Displays a searchable, categorized grid/list of all available tools.  
* /tools/[tool-id] — **Individual Tool Pages**: Dedicated routes for each micro-tool.  
* **Persistent Navigation:** Every tool page MUST feature a prominent "← Back to Tools" button in the top navigation area.  
### 3.2 Mobile-First UX & Ergonomics  
* **Viewport Target:** Primary layout optimized for mobile screens (375px–430px width) while expanding cleanly on desktop (max-w-4xl).  
* **Touch Targets:** Interactive elements must have minimum dimensions of **48x48px** with clear tap spacing to prevent misclicks.  
* **Numeric Keypads:** All numeric inputs must trigger native phone number keypads (inputmode="decimal"or type="number" with step="any").  
### 3.3 Progressive Web App (PWA) & Offline Capabilities  
* **Installation:** Includes web application manifest enabling "Add to Home Screen" on iOS and Android.  
* **Offline Caching:** Cache-first Service Worker strategy generated via vite-plugin-pwa. All scripts, styles, and core tools must function seamlessly without an internet connection (e.g., in store basements or offline environments).  
### 3.4 Currency Management  
* **Default Currency:** ₴ (Ukrainian Hryvnia).  
* **Currency Selection:** Global/Tool-level toggle allowing switching between ₴, $, €, £, or symbol-free mode.  
* **Persistence:** User currency choice saves to localStorage.  
## 4. Tool Registry System (tools.config.ts)  
Each tool must be declared in a centralized metadata registry:  
  
TypeScript  
  
export interface ToolMetadata {  
  id: string;            // URL slug (e.g., "unit-price-comparator")  
  title: string;         // Display name  
  description: string;   // Brief tool summary  
  icon: string;          // Lucide icon identifier  
  tags: string[];        // Category keywords (e.g., ["Shopping", "Utility"])  
  featured: boolean;     // Priority display on homepage  
}  
## 5. Detailed Feature Spec: Tool #1 — Unit Price Comparator  
### 5.1 Overview & Persona  
* **Slug:** /tools/unit-price-comparator  
* **User Context:** A shopper standing in an aisle, holding a grocery basket in one hand, holding a phone in the other.  
* **Primary Objective:** Quickly determine the cheapest product option when comparing varying package weights, volumes, or item counts.  
### 5.2 Ergonomic Requirements  
* **Bottom Action Bar:** Fixed or thumb-friendly positioning for primary actions ("+ Add Item", "↺ Clear All") at the bottom of the screen.  
* **Minimal Typing:** Custom product names are optional; items automatically label as "Item 1", "Item 2" if left blank.  
### 5.3 Functional Requirements  
**A. Input Parameters per Item Card**  
1. **Label / Name** *(Optional, string)*: Defaults to "Item A", "Item B", etc.  
2. **Price** *(Required, positive float)*: Item total cost.  
3. **Quantity / Weight / Volume** *(Required, positive float)*: Size value.  
4. **Unit Selector** *(Required)*:  
    * **Weight:** g, kg  
    * **Volume:** ml, L  
    * **Count:** pcs, pack  
**B. Calculation & Normalization**  
* **Automatic Conversion:**  
    * Mixed g / kg convert automatically to **per 1 kg** (or **per 100g** based on toggle setting).  
    * Mixed ml / L convert automatically to **per 1 L** (or **per 100ml**).  
    * pcs / pack convert to **per 1 unit**.  
* **Formula:**$$\text{Unit Price} = \frac{\text{Total Price}}{\text{Normalized Quantity}}$$  
* **Visual Identifiers:**  
    * **Cheapest Item:** High-visibility green badge ("Best Value") and green highlight border.  
    * **Cost Delta:** Displays percentage difference relative to the cheapest item (e.g., "+18% more expensive").  
**C. Controls & Actions**  
* **Add Item:** Adds a new comparison card (Default: 2 items, Max: 10).  
* **Remove Item:** One-tap delete button on each item card.  
* **Reset / Clear All:** Instantly clears inputs and restores state to 2 empty cards.  
* **Baseline Normalization Toggle:** Switches calculations between per 1 kg ↔ per 100g and per 1 L ↔ per 100ml.  
* **Currency Switcher:** Allows swapping between ₴, $, €, £, or plain numbers.  
**D. Local State Persistence**  
* Active form state persists to sessionStorage or localStorage to prevent data loss when switching apps or locking the device screen.  
## 6. Wireframe Layout (Price Comparator)  
Plaintext  
  
+---------------------------------------------------+  
| [← Back]          Unit Price Comparator   [ ₴ v ] |  
+---------------------------------------------------+  
| Normalization Baseline: [ Per 1 kg / 100g ]       |  
+---------------------------------------------------+  
| ITEM 1 [Best Value]                        [ ✕ ]  |  
| Price (₴):    [ 120.00 ]                          |  
| Quantity:     [ 800    ] Unit: [ g  v ]           |  
| Normalized:   150.00 ₴ / kg                       |  
+---------------------------------------------------+  
| ITEM 2 (+16% More)                         [ ✕ ]  |  
| Price (₴):    [ 175.00 ]                          |  
| Quantity:     [ 1.0    ] Unit: [ kg v ]           |  
| Normalized:   175.00 ₴ / kg                       |  
+---------------------------------------------------+  
|                                                   |  
|  [ + Add Item ]              [ ↺ Clear All ]      |  
|  (Sticky bottom thumb-friendly action bar)        |  
+---------------------------------------------------+  
## 7. Acceptance Criteria  
1. **Build & PWA Validation:** npm run build succeeds cleanly without TypeScript errors. Generated output passes PWA validation with service worker registration and offline availability.  
2. **Routing:** / catalog routes to /tools/unit-price-comparator, which includes a functional "← Back to Tools" link.  
3. **Calculation Precision:**  
    * 400g for ₴80 (₴200/kg) vs 1kg for ₴190 (₴190/kg) flags the 1kg option as "Best Value" and calculates the 400g option as "+5.3% more expensive".  
	**4	Ergonomic Verification:** Input controls trigger numeric-only keypads on mobile browsers without screen layout shifting.  

<ElicitationsGroup message="Next steps to start building:">  
  <Elicitation label="Generate complete repository starter code (Vite + React + Tailwind + PWA)" query="Generate the initial repository file structure and complete source code files (vite.config.ts, tailwind.config.js, App.tsx, tools.config.ts, and Unit Price Comparator component) based on PROJECT_SPEC.md."/>  
  <Elicitation label="Create GitHub Actions workflow for Cloudflare Pages deployment" query="Provide a GitHub Actions CI/CD workflow YAML file to automatically deploy this site to Cloudflare Pages on push to main."/>  
</ElicitationsGroup>  
