describe("Auth - logout", () => {
  it("logs in then logs out", () => {
    cy.visit("/");
    cy.get("#username").clear().type("alice");
    cy.get("#password").clear().type("password");
    cy.get("#login-form").submit();
    cy.get("#whoami", { timeout: 5000 }).should("contain", "Hi alice");
    cy.get("#logout").click();
    cy.get("#auth").should("be.visible");
  });
});
