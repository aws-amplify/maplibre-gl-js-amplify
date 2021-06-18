describe("Map Data from Amazon Location Services Renders", () => {
  it("Map matches image snapshot", () => {
    cy.visit("http://localhost:8080");
    cy.wait(6000); // wait for map data to load
    cy.get(`canvas`).toMatchImageSnapshot();
  });
});
