Feature: Application Health
  As a tester
  I want to verify the application is running
  So that I can proceed with functional tests

  @smoke
  Scenario: Application is accessible
    Given I navigate to the application
    Then the page should load successfully
