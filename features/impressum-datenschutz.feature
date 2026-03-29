Feature: Impressum and Datenschutz Page Navigation
  As a player
  I want to access Impressum and Datenschutz pages during gameplay
  So that I can view legal information without losing my game progress

  Background:
    Given I navigate to the application at "http://localhost:5173/"

  @happy-path
  Scenario: Navigate to Impressum and Datenschutz pages during an active game without losing progress
    # Start a two-player game
    When I click the "New Game" button
    Then the player setup modal should be visible

    When I enter "Alice" as the name for player 1
    And I select a color for player 1
    And I enter "Bob" as the name for player 2
    And I select a different color for player 2
    And I click the "Start Game" button
    Then the game board should be visible
    And "Alice" should be indicated as the active player

    # Turn 1: Alice places load on cell (3,3)
    When I click on the cell at row 3 column 3
    Then the cell at row 3 column 3 should show a load of 1
    And the cell at row 3 column 3 should be owned by "Alice"
    And "Bob" should be indicated as the active player

    # Turn 2: Bob places load on cell (5,5)
    When I click on the cell at row 5 column 5
    Then the cell at row 5 column 5 should show a load of 1
    And the cell at row 5 column 5 should be owned by "Bob"
    And "Alice" should be indicated as the active player

    # Turn 3: Alice reinforces cell (3,3)
    When I click on the cell at row 3 column 3
    Then the cell at row 3 column 3 should show a load of 2
    And the cell at row 3 column 3 should be owned by "Alice"
    And "Bob" should be indicated as the active player

    # Navigate to Impressum page
    When I click on the "Impressum" link
    Then the Impressum page should be displayed

    # Return to the game
    When I click on the back link or navigate back to the game
    Then the game board should be visible

    # Verify game state is preserved after returning from Impressum
    And the cell at row 3 column 3 should show a load of 2
    And the cell at row 3 column 3 should be owned by "Alice"
    And the cell at row 5 column 5 should show a load of 1
    And the cell at row 5 column 5 should be owned by "Bob"
    And "Bob" should be indicated as the active player

    # Turn 4: Bob reinforces cell (5,5)
    When I click on the cell at row 5 column 5
    Then the cell at row 5 column 5 should show a load of 2
    And the cell at row 5 column 5 should be owned by "Bob"
    And "Alice" should be indicated as the active player

    # Turn 5: Alice places load on cell (4,4)
    When I click on the cell at row 4 column 4
    Then the cell at row 4 column 4 should show a load of 1
    And the cell at row 4 column 4 should be owned by "Alice"
    And "Bob" should be indicated as the active player

    # Navigate to Datenschutz page
    When I click on the "Datenschutz" link
    Then the Datenschutz page should be displayed

    # Return to the game
    When I click on the back link or navigate back to the game
    Then the game board should be visible

    # Verify game state is preserved after returning from Datenschutz
    And the cell at row 3 column 3 should show a load of 2
    And the cell at row 3 column 3 should be owned by "Alice"
    And the cell at row 4 column 4 should show a load of 1
    And the cell at row 4 column 4 should be owned by "Alice"
    And the cell at row 5 column 5 should show a load of 2
    And the cell at row 5 column 5 should be owned by "Bob"
    And "Bob" should be indicated as the active player

    # Turn 6: Bob places load on cell (6,6)
    When I click on the cell at row 6 column 6
    Then the cell at row 6 column 6 should show a load of 1
    And the cell at row 6 column 6 should be owned by "Bob"
    And "Alice" should be indicated as the active player

    # Turn 7: Alice reinforces cell (4,4)
    When I click on the cell at row 4 column 4
    Then the cell at row 4 column 4 should show a load of 2
    And the cell at row 4 column 4 should be owned by "Alice"
    And "Bob" should be indicated as the active player

    # Verify final game state
    And the score for "Alice" should show 2 fields
    And the score for "Alice" should show 4 total load
    And the score for "Bob" should show 2 fields
    And the score for "Bob" should show 3 total load
