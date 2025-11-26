/* global cy, Cypress */
afterEach(function () {
  try {
    const testName =
      this.currentTest && this.currentTest.title ? this.currentTest.title.replace(/[\\/:*?"<>|]/g, " - ") : "test";
    const spec = Cypress && Cypress.spec && Cypress.spec.name ? Cypress.spec.name.replace(/\.[^.]+$/, "") : "spec";
    const ts = new Date().toISOString().replace(/[.:]/g, "-");
    const name = `${spec} -- ${testName} -- ${ts}`;
    cy.screenshot(name, { capture: "fullPage" });
  } catch (err) {
    console.error("screenshot failed", err);
  }
});
