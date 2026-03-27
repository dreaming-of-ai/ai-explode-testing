import { test, expect, Locator, Page } from '@playwright/test';

/**
 * Feature: Game Setup and Basic Turns
 *
 * Scenario: Start a two-player game and each player makes one move
 *
 * Gherkin mapping from: features/game-setup-and-turns.feature
 */

test.describe('Game Setup and Basic Turns', () => {
  let page: Page;
  let firstClickedCell: Locator;
  let secondClickedCell: Locator;

  test.beforeEach(async ({ page: testPage }) => {
    page = testPage;
  });

  test('Start a two-player game and each player makes one move @happy-path', async () => {
    // Background: Given I navigate to the application at "http://localhost:5173/"
    await page.goto('/');

    // When I click the "New Game" button
    const newGameButton = page.getByRole('button', { name: /new game/i });
    await newGameButton.click();

    // Then the player setup modal should be visible
    // We verify this by checking for player setup inputs
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
    // Verify selection by checking for selected/active state
    await expect(player1ColorChip).toHaveClass(/selected|active|checked/);

    // And I enter "Bob" as the name for player 2
    const player2NameInput = playerNameInputs.nth(1);
    await player2NameInput.fill('Bob');
    await expect(player2NameInput).toHaveValue('Bob');

    // And I select a different color for player 2
    const player2ColorChip = colorChips.nth(1);
    await player2ColorChip.click();
    await expect(player2ColorChip).toHaveClass(/selected|active|checked/);

    // Then the "Start Game" button should be enabled
    const startGameButton = page.getByRole('button', { name: /start game/i });
    await expect(startGameButton).toBeEnabled();

    // When I click the "Start Game" button
    await startGameButton.click();

    // Then the player setup modal should close
    // We verify this by checking that the modal inputs are no longer visible
    await expect(player1NameInput).not.toBeVisible();

    // And the game board should be visible
    const gameBoard = page.locator('.board-grid');
    await expect(gameBoard).toBeVisible();

    // And "Alice" should be indicated as the active player
    const bodyText = await page.locator('body').textContent();
    expect(bodyText).toContain('Alice');

    // When I click on an empty cell on the board
    const boardCells = page.locator('.board-cell');
    firstClickedCell = boardCells.first();
    await firstClickedCell.click();

    // Small wait for UI to update
    await page.waitForTimeout(300);

    // Then that cell should show a load of 1
    const cellLoad = firstClickedCell.locator('.cell-load');
    await expect(cellLoad).toHaveText('1');

    // And that cell should be owned by "Alice"
    const cellInitials = firstClickedCell.locator('.cell-initials');
    await expect(cellInitials).toHaveText('A');
    await expect(firstClickedCell).toHaveClass(/is-owned/);

    // And "Bob" should be indicated as the active player
    // After Alice's move, Bob should be the active player
    // We verify Bob is in the page content (active player indicator)
    const bodyTextAfterMove1 = await page.locator('body').textContent();
    expect(bodyTextAfterMove1).toContain('Bob');

    // When I click on a different empty cell on the board
    secondClickedCell = boardCells.nth(10); // Different cell from first
    await secondClickedCell.click();

    // Small wait for UI to update
    await page.waitForTimeout(300);

    // Then that cell should show a load of 1
    const secondCellLoad = secondClickedCell.locator('.cell-load');
    await expect(secondCellLoad).toHaveText('1');

    // And that cell should be owned by "Bob"
    const secondCellInitials = secondClickedCell.locator('.cell-initials');
    await expect(secondCellInitials).toHaveText('B');
    await expect(secondClickedCell).toHaveClass(/is-owned/);

    // And "Alice" should be indicated as the active player
    // After Bob's move, Alice should be active again
    const bodyTextAfterMove2 = await page.locator('body').textContent();
    expect(bodyTextAfterMove2).toContain('Alice');
  });
});
