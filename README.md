# AI-Explode Testing

## How to start the Playwright tests 
 
### Headless
                                                                                                                                                                                           
 `npm run test`                                                                                                                                                                                                       
 
### With visible browser
 
 `npm run test:headed` or `npm run test:slow`          

### Running a specific feature only

`npm run test:slow -- tests/cell-ownership.spec.ts`
 
### View HTML report 
 
 `npm run report`

## Test Creation

*Claude Opus 4.6* is generating the following test scenario using the `gherkin-writer` agent from an input as simple as:

---

Use the `gherkin-writer` agent to write a test, that opens the "New Game" popup and start a game with two players. Let each player make one move on the board.

---


```gherkin
Feature: Game Setup and Basic Turns
As a player
I want to start a new game and take turns placing loads
So that I can play AI Explode with another player

Background:
Given I navigate to the application at "http://localhost:5173/"

@happy-path
Scenario: Start a two-player game and each player makes one move
# Open the New Game modal
When I click the "New Game" button
Then the player setup modal should be visible

# Configure two players
When I enter "Alice" as the name for player 1
And I select a color for player 1
And I enter "Bob" as the name for player 2
And I select a different color for player 2
Then the "Start Game" button should be enabled

# Start the game
When I click the "Start Game" button
Then the player setup modal should close
And the game board should be visible
And "Alice" should be indicated as the active player

# Player 1 makes a move
When I click on an empty cell on the board
Then that cell should show a load of 1
And that cell should be owned by "Alice"
And "Bob" should be indicated as the active player

# Player 2 makes a move
When I click on a different empty cell on the board
Then that cell should show a load of 1
And that cell should be owned by "Bob"
And "Alice" should be indicated as the active player
```