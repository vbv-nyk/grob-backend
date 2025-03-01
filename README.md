# Express Game Challenge Application

This is an Express-based application for a game challenge involving trivia about various destinations around the world. It includes functionality for retrieving random destinations, submitting answers, and creating user challenges with scores.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Routes](#routes)
  - [Game Routes](#game-routes)
  - [Challenge Routes](#challenge-routes)
- [Testing](#testing)
  - [Test Setup](#test-setup)
  - [Test Files](#test-files)
- [Swagger Documentation](#swagger-documentation)
- [License](#license)

## Installation

1.  Clone the repository:

    ```bash
    git clone https://github.com/yourusername/game-challenge-app.git
    cd game-challenge-app
    ```

2.  Install dependencies:

    ```bash
    npm install
    ```

3.  Set up MongoDB (using in-memory MongoDB for tests):
    The application uses [MongoMemoryServer](https://www.npmjs.com/package/mongodb-memory-server) for running tests with an in-memory database.  This is primarily for the test environment.  You should also ensure you have a real MongoDB instance running for production use, and configure your application (likely via environment variables) to connect to it.

4.  Run the application:

    ```bash
    npm start
    ```

## Usage

(This section needs to be filled in based on the specifics of your API.  It's *crucial* to document your API here, even with Swagger. This section should describe the *purpose* of each endpoint and give examples.  The Routes section below will list the endpoints, but this Usage section explains how to use them.  Think of it as the "user guide" part of your API.)

**Example (replace this with your actual API functionality):**

*   **Starting a Game:**  To start a new game, you'll first need to get a set of trivia questions. This is done by making a GET request to `/game/start`.  The response will include an array of destination objects, each with a question and the correct answer.
*   **Submitting Answers:** Once you have the questions, you can submit answers via a POST request to `/game/submit-answer`.  The request body should include the destination ID and your answer.
*   **Creating a Challenge:**  To create a new challenge for other users, you'll make a POST request to `/challenge/create`. You will likely need to provide details like a challenge name and a set of questions in the request body.
*   **Retrieving a Challenge:**  To retrieve an existing challenge, use a GET request to `/challenge/:challengeId`, where `:challengeId` is the ID of the challenge.

## Routes

### Game Routes

*   `GET /game/start`:  Retrieves a set of random destinations (questions) for a new game. (e.g., 10 destinations)
*   `POST /game/submit-answer`: Submits an answer to a trivia question. Requires a request body with (at least) the destination ID and the submitted answer.

### Challenge Routes

*   `POST /challenge/create`: Creates a new challenge. Requires a request body with challenge details.
*   `GET /challenge/:challengeId`: Retrieves a challenge by its ID.

## Testing

### Test Setup

The tests are written using [Jest](https://jestjs.io/), [Supertest](https://github.com/visionmedia/supertest), and [MongoMemoryServer](https://www.npmjs.com/package/mongodb-memory-server) to run MongoDB in-memory for testing purposes.

1.  Install testing dependencies:

    ```bash
    npm install --save-dev jest supertest mongodb-memory-server
    ```

2.  To run the tests:

    ```bash
    npm test
    ```

### Test Files

#### Game Routes Tests

*   **File**: `game.test.ts`
*   **Testing Libraries**: `jest`, `supertest`
*   **Key Tests**:
    *   `GET /game/start`: Tests returning 10 random destinations.
    *   `POST /game/submit-answer`: Tests for both correct and incorrect answers.  *Important: You should also test edge cases and error handling, such as missing parameters, invalid answer formats, and database connection issues.*

#### Challenge Routes Tests

*   **File**: `challenge.test.ts`
*   **Testing Libraries**: `jest`, `supertest`
*   **Key Tests**:
    *   `POST /challenge/create`: Tests challenge creation.  *Important: Test with valid and invalid data (e.g., missing required fields).*
    *   `GET /challenge/:challengeId`: Tests retrieving a challenge by ID. *Important: Test with valid and invalid IDs, including cases where the challenge doesn't exist.*

These test files are structured to check basic functionality such as ensuring correct answers, handling invalid requests, and simulating server errors. *It is strongly recommended to expand these tests to cover more scenarios and edge cases, including authorization/authentication if your application has those features.*

## Swagger Documentation

Swagger provides interactive API documentation for your Express application. It allows you to explore and test API endpoints directly from the browser.

### Setting up Swagger

1.  **Install Swagger dependencies**:
    To integrate Swagger with your Express app, you need to install `swagger-ui-express` and `swagger-jsdoc`.

    ```bash
    npm install swagger-ui-express swagger-jsdoc
    ```

2.  **Configure Swagger in your application**:
    Add the following code to your main application file (usually `app.js` or `server.js`).  *(This part is *critical* - it was missing in the original.  You need to provide an example of the configuration.)*

    ```javascript
    // Example (adjust paths and options as needed)
    const swaggerUi = require('swagger-ui-express');
    const swaggerJsdoc = require('swagger-jsdoc');

    const options = {
      definition: {
        openapi: '3.0.0', // Specify OpenAPI version
        info: {
          title: 'Game Challenge API',
          version: '1.0.0',
          description: 'API documentation for the Game Challenge application',
        },
        servers: [
          {
            url: 'http://localhost:3000', // Your server URL
            description: 'Development server',
          },
        ],
      },
      apis: ['./routes/*.js'], // Path to the API routes files (adjust as needed)
    };

    const specs = swaggerJsdoc(options);
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
    ```

    **Explanation of the configuration:**

    *   `swaggerUi`:  The middleware to serve the Swagger UI.
    *   `swaggerJsdoc`:  Parses JSDoc comments to generate the Swagger/OpenAPI specification.
    *   `options.definition`:  Contains basic information about your API.
        *   `openapi`: Specifies the OpenAPI version (3.0.0 is recommended).
        *   `info`:  Provides metadata like title, version, and description.
        *   `servers`:  Lists the servers where your API is accessible.
    *   `options.apis`:  An array of file paths or glob patterns pointing to your route files.  Swagger-jsdoc will scan these files for JSDoc comments to build the API documentation.  *This is very important!*
    *   `app.use('/api-docs', ...)`:  This sets up the Swagger UI at the `/api-docs` endpoint.

3.  **Add JSDoc comments to your route files**:  *(This is also *essential* and was missing. Swagger works by reading these comments.)*

    ```javascript
    // Example (routes/game.js)
    /**
     * @swagger
     * /game/start:
     *   get:
     *     summary: Start a new game
     *     description: Retrieves a set of random destinations for a new game.
     *     responses:
     *       200:
     *         description: A list of destinations.
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 type: object
     *                 properties:
     *                   id:
     *                     type: integer
     *                     description: The destination ID.
     *                   question:
     *                     type: string
     *                     description: The trivia question.
     *                   correctAnswer:
     *                     type: string
     *                     description: The correct answer to the question.
     *       500:
     *          description: Internal Server Error
     */
    router.get('/game/start', (req, res) => {
      // ... your route logic ...
    });
    ```

    **Key parts of the JSDoc comment:**

    *   `@swagger`:  Indicates that this is a Swagger documentation block.
    *   `/game/start`:  The path of the endpoint.
    *   `get`:  The HTTP method.
    *   `summary`:  A short summary of the endpoint.
    *   `description`:  A more detailed description.
    *   `responses`:  Describes the possible responses, including status codes and the response body schema.
    *   `content`: Defines the media type and schema of response

4.  **Access the Swagger UI**:
    After setting up the above code, you can access the interactive API documentation at the following URL in your browser:

    ```
    http://localhost:3000/api-docs
    ```

    The swagger docs in production can be found at:

    ```
    https://reportease.ddns.net:3000/docs/
    ```

    *Important Note:* You should adapt the production URL to point to your actual production server and the correct path for your Swagger UI.  It's generally a good idea to *not* expose your Swagger UI on a production server directly, or to protect it with authentication, as it can reveal internal details of your API.

### API Documentation Structure

Swagger will automatically generate documentation for your routes and models based on JSDoc comments in your code. Each API endpoint should include comments to describe the request and response format.

## License

MIT License. See the [LICENSE](LICENSE) file for more information.