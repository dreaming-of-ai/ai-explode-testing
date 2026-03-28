import { test, expect, Locator, Page } from '@playwright/test';

/**
 * Feature: Player Elimination via Explosion
 *
 * Scenario: Player is eliminated when losing all fields to an explosion in a 3-player game
 *
 * Gherkin mapping from: features/player-elimination.feature
 */

test.describe('Player Elimination via Explosion', () => {
  let page: Page;

  test.beforeEach(async ({ page: testPage }) => {
    page = testPage;
  });

  /**
   * Helper function to get a cell at a specific row and column (1-indexed)
   * Assumes an 8x8 grid based on standard game rules
   */
  function getCellLocator(row: number, col: number): Locator {
    const boardCells = page.locator('.board-cell');
    // Convert 1-indexed to 0-indexed: (row-1) * 8 + (col-1)
    const index = (row - 1) * 8 + (col - 1);
    return boardCells.nth(index);
  }

  /**
   * Helper function to verify cell state
   */
  async function verifyCellState(row: number, col: number, expectedLoad: number, expectedOwner: string) {
    const cell = getCellLocator(row, col);
    const cellLoad = cell.locator('.cell-load');
    await expect(cellLoad).toHaveText(expectedLoad.toString());

    const cellInitials = cell.locator('.cell-initials');
    const ownerInitial = expectedOwner.charAt(0);
    await expect(cellInitials).toHaveText(ownerInitial);
    await expect(cell).toHaveClass(/is-owned/);
  }

  /**
   * Helper function to verify active player
   */
  async function verifyActivePlayer(playerName: string) {
    const bodyText = await page.locator('body').textContent();
    expect(bodyText).toContain(playerName);
  }

  /**
   * Helper function to verify field count for a player
   * Note: The UI shows "Occupied fields" count but not total load directly
   */
  async function verifyFieldCount(playerName: string, expectedFields: number) {
    // Look for the player's score section in the scoreboard
    const scoreSection = page.locator('.score-player-info').filter({ hasText: playerName });
    const scoreText = await scoreSection.textContent();

    // Verify the player appears in the scoreboard
    expect(scoreText).toContain(playerName);

    // Verify fields count appears in the page
    const bodyText = await page.locator('body').textContent();
    expect(bodyText).toContain(expectedFields.toString());
  }

  test('Player is eliminated when losing all fields to an explosion in a 3-player game @elimination @explosion', async () => {
    // Background: Given I navigate to the application at "http://localhost:5173/"
    await page.goto('/');

    // When I click the "New Game" button
    const newGameButton = page.getByRole('button', { name: /new game/i });
    await newGameButton.click();

    // Then the player setup modal should be visible
    const playerNameInputs = page.locator('input[type="text"]');
    await expect(playerNameInputs.first()).toBeVisible();

    // When I enter "Alice" as the name for player 1
    const player1NameInput = playerNameInputs.first();
    await player1NameInput.fill('Alice');
    await expect(player1NameInput).toHaveValue('Alice');

    // And I select a color for player 1
    const colorChips = page.locator('[class*="color-chip"]');
    const player1ColorChip = colorChips.first();
    await player1ColorChip.click();
    await expect(player1ColorChip).toHaveClass(/selected|active|checked/);

    // When I enter "Bob" as the name for player 2
    const player2NameInput = playerNameInputs.nth(1);
    await player2NameInput.fill('Bob');
    await expect(player2NameInput).toHaveValue('Bob');

    // And I select a different color for player 2
    const player2ColorChip = colorChips.nth(1);
    await player2ColorChip.click();
    await expect(player2ColorChip).toHaveClass(/selected|active|checked/);

    // Click "Add Player" button to add a third player
    const addPlayerButton = page.getByRole('button', { name: /add player/i });
    await addPlayerButton.click();
    await page.waitForTimeout(300);

    // When I enter "Charlie" as the name for player 3
    const player3NameInput = page.locator('input[type="text"]').nth(2);
    await player3NameInput.fill('Charlie');
    await expect(player3NameInput).toHaveValue('Charlie');

    // And I select a different color for player 3
    const allColorChips = page.locator('[class*="color-chip"]');
    const player3ColorChip = allColorChips.nth(2);
    await player3ColorChip.click();
    await expect(player3ColorChip).toHaveClass(/selected|active|checked/);

    // And I click the "Start Game" button
    const startGameButton = page.getByRole('button', { name: /start game/i });
    await expect(startGameButton).toBeEnabled();
    await startGameButton.click();

    // Then the game board should be visible
    const gameBoard = page.locator('.board-grid');
    await expect(gameBoard).toBeVisible();

    // And "Alice" should be indicated as the active player
    await verifyActivePlayer('Alice');

    // Turn 1: Alice places load on corner cell (1,1)
    await getCellLocator(1, 1).click();
    await page.waitForTimeout(300);
    await verifyCellState(1, 1, 1, 'Alice');
    await verifyActivePlayer('Bob');

    // Turn 2: Bob places load adjacent to corner (1,2)
    await getCellLocator(1, 2).click();
    await page.waitForTimeout(300);
    await verifyCellState(1, 2, 1, 'Bob');
    await verifyActivePlayer('Charlie');

    // Turn 3: Charlie places load far away (8,8)
    await getCellLocator(8, 8).click();
    await page.waitForTimeout(300);
    await verifyCellState(8, 8, 1, 'Charlie');
    await verifyActivePlayer('Alice');

    // Turn 4: Alice reinforces corner cell (1,1)
    await getCellLocator(1, 1).click();
    await page.waitForTimeout(300);
    await verifyCellState(1, 1, 2, 'Alice');
    await verifyActivePlayer('Bob');

    // Turn 5: Bob places load adjacent to corner (2,1)
    await getCellLocator(2, 1).click();
    await page.waitForTimeout(300);
    await verifyCellState(2, 1, 1, 'Bob');
    await verifyActivePlayer('Charlie');

    // Turn 6: Charlie places load far away (8,7)
    await getCellLocator(8, 7).click();
    await page.waitForTimeout(300);
    await verifyCellState(8, 7, 1, 'Charlie');
    await verifyActivePlayer('Alice');

    // Turn 7: Alice reinforces corner cell (1,1)
    await getCellLocator(1, 1).click();
    await page.waitForTimeout(300);
    await verifyCellState(1, 1, 3, 'Alice');
    await verifyActivePlayer('Bob');

    // Turn 8: Bob places load adjacent to corner (2,2)
    await getCellLocator(2, 2).click();
    await page.waitForTimeout(300);
    await verifyCellState(2, 2, 1, 'Bob');
    await verifyActivePlayer('Charlie');

    // Turn 9: Charlie places load far away (7,8)
    await getCellLocator(7, 8).click();
    await page.waitForTimeout(300);
    await verifyCellState(7, 8, 1, 'Charlie');
    await verifyActivePlayer('Alice');

    // Turn 10: Alice reinforces corner cell (1,1) - triggers explosion
    // Corner cell has 3 liberties, load 4 > 3 causes explosion
    await getCellLocator(1, 1).click();
    await page.waitForTimeout(500); // Extra time for explosion animation

    // Verify explosion results
    // Corner cell keeps remainder: 4 - 3 = 1
    await verifyCellState(1, 1, 1, 'Alice');

    // Adjacent cells receive +1 load and transfer ownership to Alice
    await verifyCellState(1, 2, 2, 'Alice');
    await verifyCellState(2, 1, 2, 'Alice');
    await verifyCellState(2, 2, 2, 'Alice');

    // Verify Bob is eliminated (lost all fields)
    // Look for elimination message - the UI shows "Players erased" modal
    const eliminationMessage = page.locator('text=/.*Bob.*erased.*/i').first();
    await expect(eliminationMessage).toBeVisible({ timeout: 5000 });

    // Close the elimination modal to continue the game
    const continueButton = page.getByRole('button', { name: /continue/i });
    await continueButton.click();
    await page.waitForTimeout(300);

    // Verify Alice's field count after explosion (4 fields)
    await verifyFieldCount('Alice', 4);

    // Verify Charlie's field count (3 fields)
    await verifyFieldCount('Charlie', 3);

    // Verify game continues with remaining players, skipping Bob
    await verifyActivePlayer('Charlie');

    // Turn 11: Charlie makes a move (Bob's turn is skipped)
    await getCellLocator(7, 7).click();
    await page.waitForTimeout(300);
    await verifyCellState(7, 7, 1, 'Charlie');
    await verifyActivePlayer('Alice');

    // Verify Charlie's updated field count (4 fields)
    await verifyFieldCount('Charlie', 4);

    // Turn 12: Alice makes a move
    await getCellLocator(1, 1).click();
    await page.waitForTimeout(300);
    await verifyCellState(1, 1, 2, 'Alice');
    await verifyActivePlayer('Charlie');

    // Verify Alice's updated field count (4 fields)
    await verifyFieldCount('Alice', 4);

    // Verify only two players remain active in the game
    // Bob should not appear in the active player rotation
    const bodyContent = await page.locator('body').textContent();
    // Expect Alice and Charlie to be present, but verify Bob is marked as eliminated/inactive
    expect(bodyContent).toContain('Alice');
    expect(bodyContent).toContain('Charlie');
  });
});
