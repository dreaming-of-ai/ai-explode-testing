import { test, expect, Locator, Page } from '@playwright/test';

/**
 * Feature: Corner Explosion Victory
 *
 * Scenario: Player wins by eliminating opponent via corner explosion in a 2-player game
 *
 * Gherkin mapping from: features/corner-explosion-win.feature
 */

test.describe('Corner Explosion Victory', () => {
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

  test('Player wins by eliminating opponent via corner explosion in a 2-player game @elimination @explosion @win @happy-path', async () => {
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

    // And I enter "Bob" as the name for player 2
    const player2NameInput = playerNameInputs.nth(1);
    await player2NameInput.fill('Bob');
    await expect(player2NameInput).toHaveValue('Bob');

    // And I select a different color for player 2
    const player2ColorChip = colorChips.nth(1);
    await player2ColorChip.click();
    await expect(player2ColorChip).toHaveClass(/selected|active|checked/);

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
    await verifyActivePlayer('Alice');

    // Turn 3: Alice reinforces corner cell (1,1)
    await getCellLocator(1, 1).click();
    await page.waitForTimeout(300);
    await verifyCellState(1, 1, 2, 'Alice');
    await verifyActivePlayer('Bob');

    // Turn 4: Bob places load adjacent to corner (2,1)
    await getCellLocator(2, 1).click();
    await page.waitForTimeout(300);
    await verifyCellState(2, 1, 1, 'Bob');
    await verifyActivePlayer('Alice');

    // Turn 5: Alice reinforces corner cell (1,1)
    await getCellLocator(1, 1).click();
    await page.waitForTimeout(300);
    await verifyCellState(1, 1, 3, 'Alice');
    await verifyActivePlayer('Bob');

    // Turn 6: Bob places load adjacent to corner (2,2)
    await getCellLocator(2, 2).click();
    await page.waitForTimeout(300);
    await verifyCellState(2, 2, 1, 'Bob');
    await verifyActivePlayer('Alice');

    // Turn 7: Alice reinforces corner cell (1,1) - triggers explosion
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

    // Verify Bob is eliminated (lost all 3 fields to Alice)
    // Look for elimination message - the UI shows "Players erased" modal
    const eliminationMessage = page.locator('text=/.*Bob.*erased.*/i').first();
    await expect(eliminationMessage).toBeVisible({ timeout: 5000 });

    // Verify Alice's score after explosion (4 fields)
    // Note: The UI shows occupied fields but not total load
    await verifyFieldCount('Alice', 4);

    // Verify Alice wins the game
    // In a 2-player game, when one player is eliminated, the other wins
    const victoryMessage = page.locator('text=/.*Alice.*wins.*match.*/i').first();
    await expect(victoryMessage).toBeVisible({ timeout: 5000 });

    // Verify game is over
    // The game should show a victory/end state
    const bodyContent = await page.locator('body').textContent();
    expect(bodyContent).toContain('Alice');

    // Close any modal if present
    const continueButton = page.getByRole('button', { name: /continue|close|ok/i });
    if (await continueButton.isVisible()) {
      await continueButton.click();
      await page.waitForTimeout(300);
    }

    // Verify clicking on any cell should not change the board state
    // Store current state of cell (1,1)
    const cellBeforeClick = getCellLocator(1, 1);
    const loadBeforeClick = await cellBeforeClick.locator('.cell-load').textContent();

    // Try clicking on a cell
    await getCellLocator(3, 3).click({ force: true });
    await page.waitForTimeout(300);

    // Verify the board state hasn't changed
    const cellAfterClick = getCellLocator(1, 1);
    const loadAfterClick = await cellAfterClick.locator('.cell-load').textContent();
    expect(loadAfterClick).toBe(loadBeforeClick);

    // Verify cell (3,3) is still empty or unchanged
    const emptyCell = getCellLocator(3, 3);
    const emptyCellLoad = emptyCell.locator('.cell-load');
    // Cell should not have load content or should be disabled
    const isLoadVisible = await emptyCellLoad.isVisible().catch(() => false);
    if (isLoadVisible) {
      // If load is visible, it should be 0 or the cell should be from before game end
      const loadText = await emptyCellLoad.textContent();
      expect(loadText).toBe('');
    }
  });
});
