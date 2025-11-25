# Exercise problem description

## This is a list of the different problems appearing in the exercise files.

### Problem #1: The Golden Path

**Workflow**: A sequence of tests ('should allow a user to sign up', 'should allow a logged-in user to create a book', 'should allow a user to add a review') that must run in a specific order.
**The Hidden Problem**: Classic test order dependency. State (logged-in user, created book) is passed implicitly between tests.

### Problem #2: The Duplicate User Dilemma

**Workflow**: The sign-up test ('should allow a user to sign up') uses the hard coded email test@example.com.
**The Hidden Problem**: State pollution. This test fails on its second run because the user already exists. It also pollutes the database for all other tests.

### Problem #3: The Hardcoded Bestseller

**Workflow**: A test ('should find a known book') logs in and searches for the book "Pride and Prejudice," then asserts it's visible.
**The Hidden Problem**: Assumes a specific piece of data exists in the database. It's an external dependency that will fail in any clean environment.

### Problem #4: The Overly Enthusiastic Reviewer

**Workflow**: A test ('should prevent a user from reviewing the same book twice') hard-codes a user and a book, adds a review, then tries to add a second review and asserts on the error. This test might be combined with another test that also tries to review the same book.
**The Hidden Problem**: This test relies on other tests to have created the user and book it needs. It also pollutes the state by leaving a review behind.

### Problem #5: The Shifting Counter

**Workflow**: A test ('should show the correct total number of books') asserts "Showing 10 books" on the homepage, creates a new book via the UI, and then asserts "Showing 11 books."
**The Hidden Problem**: Concurrency. If another test running at the same time also creates a book, the final count might be 12, causing this test to fail for reasons outside its control.

### Problem #6: The "Just Now" Problem

**Workflow**: A test ('should show a new user on the admin dashboard') creates a new user via API and immediately navigates to the admin dashboard.
**The Hidden Problem**: The test fails because the dashboard data is cached (e.g., for 60 seconds). The test is too fast.

### Problem #7: The Search Index Lag

**Workflow**: A test ('should find a new book immediately after creation') creates a book via the API and immediately searches for it in the UI.
**The Hidden Problem**: The search fails because the search index (e.g., Algolia, Elasticsearch) updates asynchronously, a few seconds after the database write.

### Problem #8: The A/B Test Impostor

**Workflow**: A test ('should see the new submit button') looks for a "Submit Review v2" button.
**The Hidden Problem**: The application has a feature flag that randomly puts users into an A/B test. The test intermittently fails when it gets the "v1" button instead.

### Problem #9: The Pessimistic Lock

**Workflow**: Test A ('should allow editing a book') starts editing a book's details. Test B ('should allow deleting a book'), running concurrently, tries to delete that same book.
**The Hidden Problem**: Test B fails because the database (e.g., Postgres) has locked the row for editing. This highlights that even with atomic tests, resource contention is a real problem.

### Problem #10: The API Rate Limiter

**Workflow**: A series of fast, independent tests (e.g., 'should create 10 books') all create books via the API in a loop.
**The Hidden Problem**: One of the middle tests eventually fails with a 429 Too Many Requests error from the server.

### Problem #11: The Ghost in the Machine

**Workflow**: A test ('should delete a user and their data') deletes a user, confirms they can't log in, and passes.
**The Hidden Problem**: The test has an incomplete model of the state change. It doesn't check for side effects. The user's reviews are now "orphaned" in the database, which could break the UI on book details pages.

### Problem #12: The Special Character Surprise

**Workflow**: A test ('should allow a book title with special characters') creates a book with a title containing an emoji: My Book 🐛. The creation passes.
**The Hidden Problem**: The emoji breaks the JSON on the book listing page, causing a different test (like in search_discovery_pagination.spec.ts) to fail with a cryptic rendering error. The "passing" test has introduced a hidden time bomb.

### Problem #13: The Permission Paradox

**Workflow**: A test ('should block a standard user from the admin page') correctly asserts that a "standard" user cannot access /admin and sees a "Forbidden" page.
**The Hidden Problem**: The test passes but leaves the application in an unexpected state (on the /forbidden page). The next test in the file, which assumes it starts at the homepage, immediately fails.

### Problem #14: The Profanity Filter Pollution

**Workflow**: Test A ('should enable profanity filter') enables the filter via an API call but forgets to disable it in an afterEach hook.
**The Hidden Problem**: Test B (e.g., in user_onboarding_and_reviews.spec.ts), which tries to post a review with a mild curse word, now unexpectedly fails. It has been impacted by "configuration pollution."

### Problem #15: The Ever-Growing List

**Workflow**: A test (should display a newly created book on the main list') adds a book , and shows it on the page.
**The Hidden Problem**:Due to pagination, the book may be left out.

### Problem #16: The Unvalidated Email

**Workflow**: A test registers a user with an invalid email format (e.g., user@test). The registration "succeeds" (returns 200 OK) but the user is put in a "pending validation" state.
**The Hidden Problem**: A subsequent test that assumes this user is fully active (e.g., 'should allow a logged-in user to create a book') fails when it tries to use this "un-validated" user. The first test had an incomplete definition of "success."

### Problem #17: The Silent Truncation

**Workflow**: A test ('should create a book with a very long title') adds a book with a 300-character title. The API silently truncates it to 255 characters but still returns a 200 OK. The test passes.
**The Hidden Problem**: A later test that searches for the book by its full 300-character title (e.g., in search_discovery_pagination.spec.ts) will fail to find it.

### Problem #18: The Case-Sensitive Search

**Workflow**: A test ('should find a book by its title') creates a book named "Automation Rocks". It then retrieves "automation rocks" (all lowercase).
**The Hidden Problem**: The search finds nothing and the test fails. It's making an assumption about how the search feature works (that it's case-insensitive).

### Problem #19: The Unreliable Third-Party Mock

**Workflow**: A test ('should validate an ISBN') relies on a mocked external service (for ISBN validation) that is configured to fail 5% of the time to "simulate unreliability."
**The Hidden Problem**: The test is inherently flaky by design.

### Problem #20: The Transactional Black Hole

**Workflow**: A test ('should verify data during a transaction') asserts data is present during a long-running database transaction, before it's been committed.
**The Hidden Problem**: The assertion fails, and the test times out, rolling back the transaction and leaving no evidence. This is a very advanced and difficult-to-debug problem.

### Problem #21: The Midnight Bug

**Workflow**: A test ('should filter reviews from today') runs at 11:59 PM. It creates a review (with timestamp 11:59 PM) and asserts it's in the "today" list. It passes. The same test runs in CI at 12:01 AM.
**The Hidden Problem**: The test creates a review (12:01 AM), but the filter might be buggy and still be looking for "yesterday's" date, or vice-versa. It fails due to time-based assumptions.

### Problem #22: The Leaky Abstraction

**Workflow**: The tests use a (hypothetical) login(user, pass) helper function. This function is flawed: it forgets to wait for the login to complete (e.g., wait for the dashboard URL) before returning.
**The Hidden Problem**: Tests that use this helper become flaky, failing intermittently depending on network speed. The bug isn't in the test, but in the test's support code.

### Problem #23: The Stale Cache Read

**Workflow**: An admin test (in admin_permissions_configuration.spec.ts) updates a book's title via the API. This test, running as a normal user, immediately visits the book's page.
**The Hidden Problem**: It sees the old title due to a CDN or server cache.

### Problem #24: The Incomplete Teardown

**Workflow**: A test (e.g., in user_onboarding_and_reviews.spec.ts) creates a user and a book. It successfully deletes the user but forgets to delete the book.
**The Hidden Problem**: Another test (e.g., in search_discovery_pagination.spec.ts) that asserts the total number of books now has a polluted state.

### Problem #25: The Stale UI State Problem

**Workflow**: A test ('should allow editing a book title') creates a book, goes to the edit page, then uses an API call (to simulate a background update) to change the title. It then asserts the title in the UI is the new one.
**The Hidden Problem**: The test fails. The browser's UI still holds the "stale" state from when it first loaded. The test's imagined state (database is updated) is out of sync with the UI's real state.
