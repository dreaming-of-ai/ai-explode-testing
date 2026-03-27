Feature: Cell Ownership Rules
  As a player
  I want the game to enforce cell ownership rules
  So that players can only interact with empty cells or their own cells

  Background:
    Given I navigate to the application at "http://localhost:5173/"

  @edge-case
  Scenario: Player cannot place load on a cell owned by another player
    # Open the New Game modal and start a two-player game
    When I click the "New Game" button
    Then the player setup modal should be visible

    When I enter "Alice" as the name for player 1
    And I select a color for player 1
    And I enter "Bob" as the name for player 2
    And I select a different color for player 2
    And I click the "Start Game" button
    Then the game board should be visible
    And "Alice" should be indicated as the active player

    # Player 1 (Alice) claims a specific cell
    When I click on the cell at row 3 column 4
    Then the cell at row 3 column 4 should show a load of 1
    And the cell at row 3 column 4 should be owned by "Alice"
    And "Bob" should be indicated as the active player

    # Player 2 (Bob) attempts to click the same cell owned by Alice
    When I click on the cell at row 3 column 4
    Then the cell at row 3 column 4 should still show a load of 1
    And the cell at row 3 column 4 should still be owned by "Alice"
    And "Bob" should still be indicated as the active player
