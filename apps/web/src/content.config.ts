// Astro 5+ content collections config: lives at `src/content.config.ts`
// (not `src/content/config.ts`, which was the Astro 2-4 convention).
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Schema mirrors CONTEXT.md's Listing vocabulary exactly (see
// docs/adr/0002-phase1-content-collections-mirror-strapi.md — this shape is
// meant to carry forward into the Phase 2 Strapi content-type unchanged).
//
// Field naming: CONTEXT.md's Listing fields -> camelCase equivalents used
// here:
//   Rent           -> rent            (number, USD, whole dollars)
//   Property Type  -> propertyType    (enum: 'apartment' | 'house' | 'room')
//   City           -> city            (string)
//   Area           -> area            (string)
//   bedroom count  -> bedrooms        (number, integer >= 0)
//   Gallery        -> gallery         (ordered array of image URLs, >= 1)
//   Availability   -> availability    (enum: 'available' | 'rented')
//   Agent          -> agent           (inline object, not a reference)
//     Agent.name   -> agent.name      (string)
//     Agent.phone  -> agent.phone     (string)
//     Agent.email  -> agent.email     (string, email — added to support the
//                                      ticket 06 mailto: Inquiry)
//     Agent.photo  -> agent.photo     (string, image URL)
//
// Every later ticket (02, 03, 05) must use these exact field names.
const agentSchema = z.object({
  name: z.string().min(1),
  phone: z.string().min(1),
  email: z.string().email(),
  photo: z.string().url(),
});

const listings = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/listings' }),
  schema: z.object({
    rent: z.number().positive(),
    propertyType: z.enum(['apartment', 'house', 'room']),
    city: z.string().min(1),
    area: z.string().min(1),
    bedrooms: z.number().int().nonnegative(),
    gallery: z.array(z.string().url()).min(1),
    availability: z.enum(['available', 'rented']),
    agent: agentSchema,
  }),
});

export const collections = { listings };
