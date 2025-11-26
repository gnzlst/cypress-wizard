describe("Auth", () => {
  it("logs in with seeded user", () => {
    cy.visit("/");
    cy.get("#username").clear().type("alice");
    cy.get("#password").clear().type("password");
    cy.get("#login-form").submit();
    cy.get("#whoami", { timeout: 5000 }).should("contain", "Hi alice");
  });
});
