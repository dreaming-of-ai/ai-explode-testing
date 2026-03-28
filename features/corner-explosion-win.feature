Feature: Corner Explosion Victory
  As a player
  I want to win the game by eliminating all opponents via a corner explosion
  So that I can achieve victory through strategic corner cell stacking

  Background:
    Given I navigate to the application at "http://localhost:5173/"

  @elimination @explosion @win @happy-path
  Scenario: Player wins by eliminating opponent via corner explosion in a 2-player game
    # Open the New Game modal and configure two players
    When I click the "New Game" button
    Then the player setup modal should be visible

    When I enter "Alice" as the name for player 1
    And I select a color for player 1
    And I enter "Bob" as the name for player 2
    And I select a different color for player 2
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
    And "Alice" should be indicated as the active player

    # Turn 3: Alice reinforces corner cell (1,1)
    When I click on the cell at row 1 column 1
    Then the cell at row 1 column 1 should show a load of 2
    And the cell at row 1 column 1 should be owned by "Alice"
    And "Bob" should be indicated as the active player

    # Turn 4: Bob places load adjacent to corner (2,1)
    When I click on the cell at row 2 column 1
    Then the cell at row 2 column 1 should show a load of 1
    And the cell at row 2 column 1 should be owned by "Bob"
    And "Alice" should be indicated as the active player

    # Turn 5: Alice reinforces corner cell (1,1)
    When I click on the cell at row 1 column 1
    Then the cell at row 1 column 1 should show a load of 3
    And the cell at row 1 column 1 should be owned by "Alice"
    And "Bob" should be indicated as the active player

    # Turn 6: Bob places load adjacent to corner (2,2)
    When I click on the cell at row 2 column 2
    Then the cell at row 2 column 2 should show a load of 1
    And the cell at row 2 column 2 should be owned by "Bob"
    And "Alice" should be indicated as the active player

    # Turn 7: Alice reinforces corner cell (1,1) - triggers explosion
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

    # Verify Bob is eliminated (lost all 3 fields to Alice)
    Then an elimination message should indicate that "Bob" has been eliminated

    # Verify Alice's score after explosion (4 fields, total load 7)
    And the score for "Alice" should show 4 fields
    And the score for "Alice" should show 7 total load

    # Verify Alice wins the game (all occupied fields belong to one player from round 2 onward)
    Then a victory message should indicate that "Alice" has won the game

    # Verify game is over - no more moves can be made
    And the game should be over
    And clicking on any cell should not change the board state
