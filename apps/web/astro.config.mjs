// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [tailwindcss()]
  },

  integrations: [react()],

  image: {
    // images.unsplash.com: hardcoded marketing photography (hero, About,
    // CtaBand) — unrelated to Listing data, stays regardless of data source.
    // res.cloudinary.com: Listing Gallery / Agent photos, now served from
    // Strapi's Cloudinary upload provider (ADR 0004) instead of the deleted
    // Content Collection's picsum.photos placeholders.
    domains: ['images.unsplash.com', 'res.cloudinary.com']
  }
});