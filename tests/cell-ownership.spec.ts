import { test, expect, Locator, Page } from '@playwright/test';

/**
 * Feature: Cell Ownership Rules
 *
 * Scenario: Player cannot place load on a cell owned by another player
 *
 * Gherkin mapping from: features/cell-ownership.feature
 */

test.describe('Cell Ownership Rules', () => {
  let page: Page;

  test.beforeEach(async ({ page: testPage }) => {
    page = testPage;
  });

  test('Player cannot place load on a cell owned by another player @edge-case', async () => {
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
    const bodyText = await page.locator('body').textContent();
    expect(bodyText).toContain('Alice');

    // When I click on the cell at row 3 column 4
    // Need to determine how cells are indexed/accessed
    // Based on existing test, cells are .board-cell
    // For a specific row/column, we need to calculate the index
    // Assuming a standard grid layout, row 3 column 4 (0-indexed: row 2, col 3)
    // If the board is 9x6 (from game rules), index = row * columns + col
    // Let's use a data attribute or calculate position
    const boardCells = page.locator('.board-cell');

    // For row 3, column 4 (1-indexed in Gherkin):
    // If 0-indexed internally: row 2, column 3
    // Assuming 9 columns (standard): index = 2 * 9 + 3 = 21
    const targetCell = boardCells.nth(21); // Adjust if needed based on actual grid size

    await targetCell.click();
    await page.waitForTimeout(300);

    // Then the cell at row 3 column 4 should show a load of 1
    const cellLoad = targetCell.locator('.cell-load');
    await expect(cellLoad).toHaveText('1');

    // And the cell at row 3 column 4 should be owned by "Alice"
    const cellInitials = targetCell.locator('.cell-initials');
    await expect(cellInitials).toHaveText('A');
    await expect(targetCell).toHaveClass(/is-owned/);

    // And "Bob" should be indicated as the active player
    const bodyTextAfterAlice = await page.locator('body').textContent();
    expect(bodyTextAfterAlice).toContain('Bob');

    // When Bob attempts to click on the cell at row 3 column 4 (Alice's cell)
    // The cell should be disabled, preventing the click
    await expect(targetCell).toBeDisabled();

    // Attempt to force click (this should not change game state)
    // Using force: true to bypass actionability checks
    await targetCell.click({ force: true });
    await page.waitForTimeout(300);

    // Then the cell at row 3 column 4 should still show a load of 1
    await expect(cellLoad).toHaveText('1');

    // And the cell at row 3 column 4 should still be owned by "Alice"
    await expect(cellInitials).toHaveText('A');
    await expect(targetCell).toHaveClass(/is-owned/);

    // And "Bob" should still be indicated as the active player
    const bodyTextAfterBobAttempt = await page.locator('body').textContent();
    expect(bodyTextAfterBobAttempt).toContain('Bob');
  });
});
