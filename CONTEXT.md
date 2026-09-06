# Property Rents

A rental listings site for a single property agency. Visitors browse and search available rentals and reach out about ones they're interested in; the agency publishes and maintains the listings.

## Language

### Core

**Listing**:
A single rental unit published on the site, with a Rent, Property Type, City/Area, bedroom count, a Gallery, an Availability, and an Agent.
_Avoid_: Property, Unit

**Agency**:
The single business that owns and publishes all Listings on the site. Not a modeled entity — there is exactly one, so nothing references it by ID.
_Avoid_: Company, Owner

**Agent**:
The individual staff member named as the contact on a Listing (name, phone, email, photo). Distinct from the Agency itself — a Listing has one Agent, but the site is not a marketplace of independent agents each managing their own inventory.
_Avoid_: Broker, Owner, Landlord

**Property Type**:
The category of a Listing: apartment, house, or room. A closed set — adding a new type is a deliberate scope change, not user input.
_Avoid_: Category, Kind

**Rent**:
The recurring monthly amount, in USD, a tenant would pay for a Listing. This site only ever lists rentals, so "Rent" and "Price" are the same number — "Rent" is used to keep the door closed on ever adding for-sale listings without renaming everything.
_Avoid_: Price, Cost

**Availability**:
Whether a Listing is `available` or `rented`. A rented Listing stays published (badged, not deleted) rather than disappearing from the site.
_Avoid_: Status (too generic on its own — always say Availability when this is what's meant)

**Gallery**:
The ordered set of photos attached to a Listing.

**Draft** / **Published**:
A Listing's visibility state in Phase 2 (Strapi's built-in Draft & Publish), independent of Availability. A `Published` Listing appears on the site, subject to its Availability; a `Draft` Listing is still being prepared by the Agency and does not appear at all, regardless of Availability. This is what lets the Agency stage a new Listing before it goes live. Availability only has meaning for a `Published` Listing.
_Avoid_: confusing with Availability — Draft/Published is "is this on the site at all," Availability is "available vs rented" among Listings that are.

**City** / **Area**:
Location fields on a Listing. City is the city/town; Area is the neighborhood or district within it. Both are free-text attributes on the Listing, not a separate lookup/taxonomy entity.

### Visitor interaction

**Visitor**:
An anonymous person browsing or searching Listings. Visitors have no account and no persisted identity on the site.
_Avoid_: User, Customer

**Inquiry**:
A Visitor's expression of interest in a specific Listing, directed at that Listing's Agent. In Phase 1 this is a `mailto:` link with no record kept on the site; Phase 2 may persist Inquiries once a backend exists.
_Avoid_: Lead, Contact request
