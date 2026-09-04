import { describe, expect, it } from 'vitest';

// Trivial smoke test proving Vitest is wired up in this workspace.
// Ticket 02 adds the real `filterListings` test suite.
describe('vitest setup', () => {
  it('runs a basic assertion', () => {
    expect(1 + 1).toBe(2);
  });
});
