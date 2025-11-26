function today() {
  return new Date().toISOString().slice(0, 10);
}

describe("Wizard flow", () => {
  it("searches a city and shows forecast", () => {
    cy.visit("/");
    cy.get("#guest").click();
    cy.get("#city").type("London");
    cy.get("#search-city").click();
    cy.get("#results li", { timeout: 10000 }).first().click();
    cy.get("#date").clear().type(today());
    cy.get("#get-weather").click();
    cy.get("#forecast", { timeout: 10000 }).should("contain.text", "°");
  });
});
