scripts/
├─ generate-collections.mjs # Generates TS collection definitions from CMS config
├─ generate-content-api.mjs # Generates typed content API helpers
└─ process-images.mjs # Builds responsive image variants

src/
└─ lib/
   ├─ images/
   │ ├─ config.json # Image sizes, formats, variants
   │ └─ image-helpers.ts # Shared image helper functions
   │
   ├─ search/
   │ └─ podcastsSearchConfig.ts # Fuse.js / search configuration
   │
   ├─ generated/
   │ └─ collections.ts # Auto-generated collection definitions
   │
   └─ server/
      ├─ content/
      │ ├─ api.generated.ts # Auto-generated content API (server-only)
      │ ├─ helpers.ts # Joining, mapping, and utility helpers
      │ └─ read.ts # Low-level content read helpers
      │
      └─ theme/
         ├─ defaultScheme.ts # Default colour scheme tokens
         └─ defaultTypography.ts # Default typography tokens

