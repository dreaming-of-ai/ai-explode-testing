Feature: Player Elimination via Explosion
  As a player
  I want eliminated players to be removed from the game
  So that the game continues correctly with remaining players

  Background:
    Given I navigate to the application at "http://localhost:5173/"

  @elimination @explosion
  Scenario: Player is eliminated when losing all fields to an explosion in a 3-player game
    # Open the New Game modal and configure three players
    When I click the "New Game" button
    Then the player setup modal should be visible

    When I enter "Alice" as the name for player 1
    And I select a color for player 1
    And I enter "Bob" as the name for player 2
    And I select a different color for player 2
    And I enter "Charlie" as the name for player 3
    And I select a different color for player 3
    And I click the "Start Game" button
    Then the game board should be visible
    And "Alice" should be indicated as the active player

    # Turn 1: Alice places load on corner cell (1,1)
    When I click on the cell at row 1 column 1
    Then the cell at row 1 column 1 should show a load of 1
    And the cell at row 1 column 1 should be owned by "Alice"
    And "Bob" should be indicated as the active player

    # Turn 2: Bob places load adjacent to corner (1,2)
    When I click on the cell at row 1 column 2
    Then the cell at row 1 column 2 should show a load of 1
    And the cell at row 1 column 2 should be owned by "Bob"
    And "Charlie" should be indicated as the active player

    # Turn 3: Charlie places load far away (8,8)
    When I click on the cell at row 8 column 8
    Then the cell at row 8 column 8 should show a load of 1
    And the cell at row 8 column 8 should be owned by "Charlie"
    And "Alice" should be indicated as the active player

    # Turn 4: Alice reinforces corner cell (1,1)
    When I click on the cell at row 1 column 1
    Then the cell at row 1 column 1 should show a load of 2
    And the cell at row 1 column 1 should be owned by "Alice"
    And "Bob" should be indicated as the active player

    # Turn 5: Bob places load adjacent to corner (2,1)
    When I click on the cell at row 2 column 1
    Then the cell at row 2 column 1 should show a load of 1
    And the cell at row 2 column 1 should be owned by "Bob"
    And "Charlie" should be indicated as the active player

    # Turn 6: Charlie places load far away (8,7)
    When I click on the cell at row 8 column 7
    Then the cell at row 8 column 7 should show a load of 1
    And the cell at row 8 column 7 should be owned by "Charlie"
    And "Alice" should be indicated as the active player

    # Turn 7: Alice reinforces corner cell (1,1)
    When I click on the cell at row 1 column 1
    Then the cell at row 1 column 1 should show a load of 3
    And the cell at row 1 column 1 should be owned by "Alice"
    And "Bob" should be indicated as the active player

    # Turn 8: Bob places load adjacent to corner (2,2)
    When I click on the cell at row 2 column 2
    Then the cell at row 2 column 2 should show a load of 1
    And the cell at row 2 column 2 should be owned by "Bob"
    And "Charlie" should be indicated as the active player

    # Turn 9: Charlie places load far away (7,8)
    When I click on the cell at row 7 column 8
    Then the cell at row 7 column 8 should show a load of 1
    And the cell at row 7 column 8 should be owned by "Charlie"
    And "Alice" should be indicated as the active player

    # Turn 10: Alice reinforces corner cell (1,1) - triggers explosion
    # Corner cell has 3 liberties, load 4 > 3 causes explosion
    When I click on the cell at row 1 column 1
    Then an explosion should occur

    # Verify explosion results
    # Corner cell keeps remainder: 4 - 3 = 1
    And the cell at row 1 column 1 should show a load of 1
    And the cell at row 1 column 1 should be owned by "Alice"

    # Adjacent cells receive +1 load and transfer ownership to Alice
    And the cell at row 1 column 2 should show a load of 2
    And the cell at row 1 column 2 should be owned by "Alice"
    And the cell at row 2 column 1 should show a load of 2
    And the cell at row 2 column 1 should be owned by "Alice"
    And the cell at row 2 column 2 should show a load of 2
    And the cell at row 2 column 2 should be owned by "Alice"

    # Verify Bob is eliminated (lost all fields)
    Then an elimination message should indicate that "Bob" has been eliminated

    # Verify Alice's score after explosion (4 fields, total load 7)
    And the score for "Alice" should show 4 fields
    And the score for "Alice" should show 7 total load

    # Verify Charlie's score (3 fields, total load 3)
    And the score for "Charlie" should show 3 fields
    And the score for "Charlie" should show 3 total load

    # Verify game continues with remaining players, skipping Bob
    And "Charlie" should be indicated as the active player

    # Turn 11: Charlie makes a move (Bob's turn is skipped)
    When I click on the cell at row 7 column 7
    Then the cell at row 7 column 7 should show a load of 1
    And the cell at row 7 column 7 should be owned by "Charlie"
    And "Alice" should be indicated as the active player

    # Verify Charlie's updated score (4 fields, total load 4)
    And the score for "Charlie" should show 4 fields
    And the score for "Charlie" should show 4 total load

    # Turn 12: Alice makes a move
    When I click on the cell at row 1 column 1
    Then the cell at row 1 column 1 should show a load of 2
    And the cell at row 1 column 1 should be owned by "Alice"
    And "Charlie" should be indicated as the active player

    # Verify Alice's updated score (4 fields, total load 8)
    And the score for "Alice" should show 4 fields
    And the score for "Alice" should show 8 total load

    # Verify only two players remain active in the game
    And only "Alice" and "Charlie" should be active players
