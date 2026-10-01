# Flavoland Store Finder

Production-oriented Next.js App Router store finder inspired by modern retail location-finder UX, with an original Flavoland brand identity.

## Stack
- Next.js 16.3.7 / App Router
- React 19.3
- TypeScript
- Tailwind CSS 4.3
- shadcn/ui component conventions with Radix primitives
- Lucide React
- React Leaflet + OpenStreetMap

## Run
```bash
npm install
npm run dev
```

## Build
```bash
npm run build
```

## Architecture
- `app/` routes and layouts
- `components/` reusable UI and feature components
- `components/ui/` shadcn-style primitives
- `lib/stores.ts` mock repository, ready to replace with an API/data layer
- `types/store.ts` domain model

Map provider can be swapped by replacing `components/store-map-leaflet.tsx` while preserving the `StoreMap` interface.
