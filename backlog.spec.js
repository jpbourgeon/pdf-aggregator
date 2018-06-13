describe('backlog', () => {
  describe('The app', () => {
    it('should have a detailed documentation', () => undefined);
    it('should be localized (i18n): ui and main process messages', () => undefined);
    it('should use template merging for the cover page instead of page generation', () => undefined);
  });

  describe('the code', () => {
    it('should have a refactor of filename deduplication', () => undefined);
    it('should have a fixed interruption message - currently shows message x3', () => undefined);
  });

  describe('the result pdf file', () => {
    it(`should use the templating mechanism for the coverpage 
      (don't merge the coverpage if it's in the path!)`, () => undefined);
    it('should not merge _blank files generated as template (fix)', () => undefined);
    it('should display better outline entries (allow the same name for multiple entries)', () => undefined);
  });
});
