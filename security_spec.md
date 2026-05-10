# Traveloop Security Specification

## Data Invariants
1. A Trip MUST belong to a valid authenticated user.
2. A Stop MUST belong to a valid Trip ID.
3. An Activity MUST belong to a valid Stop ID and Trip ID.
4. Notes and Checklist items MUST belong to a valid Trip ID.
5. Access to sub-resources (Stops, Activities, Notes, Checklist) is derived from the Trip's ownership or public status.
6. Share IDs must be unique (enforced at write time).

## The "Dirty Dozen" Payloads (Expected to be DENIED)
1. Creating a trip with someone else's `userId`.
2. Updating a trip's `userId` after creation.
3. Reading a private trip as another user.
4. Adding a stop to a trip you don't own.
5. Injected a 1MB string into a `city` name.
6. Setting `isPublic` to true on a trip you don't own.
7. Deleting a note for a trip you don't own.
8. Reading a public trip's sensitive sub-collections (notes/checklist) if they aren't marked as public (for now, notes/checklist are private).
9. Modifying `createdAt` during an update.
10. Creating a trip with a document ID that is 2KB long.
11. Updating an activity cost to -500.
12. Listing all trips without being authenticated.
