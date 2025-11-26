function today() {
  return new Date().toISOString().slice(0, 10);
}

describe("Wizard flow", () => {
  it("searches a city and shows forecast", () => {
    // stub external API responses using fixtures so the test is deterministic
    cy.fixture("geocode.json").then((g) => {
      cy.intercept("GET", "/api/geocode*", g).as("geocode");
    });

    cy.fixture("weather.json").then((w) => {
      cy.intercept("GET", "/api/weather*", w).as("weather");
    });

    cy.visit("/");
    cy.get("#guest").click();
    cy.get("#city").type("London");
    cy.get("#search-city").click();
    cy.wait("@geocode");
    cy.get("#results li", { timeout: 10000 }).first().click();
    cy.get("#date").clear().type(today());
    cy.get("#get-weather").click();
    cy.wait("@weather");
    cy.get("#forecast", { timeout: 10000 }).should("contain.text", "°");
  });
});
