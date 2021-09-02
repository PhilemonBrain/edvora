# Awesome Project Build with TypeORM

Steps to run this project:

1. Install dependencies
2. yarn start

Project Structure
This project was written with Node(Express), Typescript, TypeORM, Joi(for validation), express-session.
Has 4 endpoints
1. /register: takes an email and password values in d request body. If the email already exists, returns a response or creates the user otherwise.

2. /login: takes and email and password values in the request body. If the email isnt registered, or incorrect, returns a response or logs the user in otherwise. Here the current user sessionID is addded to an array of user sessionID in the User document, and the userID is added to the request.session. We can then check if there is a session and session.userID properties on the request object in authentication required endpoints like change_password. 

3. /terminate: takes a sessionID and destroys the session. This endpoint should be an Admin endpoint.

4. /change_password: destroys all the sessions saved for that particular user. leaving only the current session.


Improvements
Here are a few things i just ignored because of time and scope of the task. I would(depending on the project managers guideline) include these.
1. Async Validation : Since Joi validator supports async validation, i normally love to check for things like 'an existing email address' during registration, and any other external async validation in the validation middleware
2. Building containers: Spinning up this project as a docker image is also something i would do.
3. Data Stores: Since we are using typeorm, we could easily change to another db with a least amount of refactor. I would have a 'controller' class(DataStore) with all the methods for DB actions e.g getUserByEmail, getUserById, addNewUser, etc. This will ensure that even if we decide to drop TypeORM we could easily migrate to any other service or tool.
4. Use the 'debug' for logging. I feel i dont have much to log so i skipped it.