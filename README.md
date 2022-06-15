## HOT TAKES - THE WEB'S BEST HOT SAUCE REVIEWS

Hot Takes is an API created by PIIQUANTE for sauce lovers. 
It contains a collection of detailed sauces added by our users, that you can like or dislike.
This project forms part of the Openclassrooms course for web development and focuses on 
creating an API REST which is secure and in accordance with regulations.  


## REQUIREMENTS

Node.js, version: 16.15.0 LTS or later  
npm version 8.9.0 or later  
MongoDB  
API client e.g. POSTMAN


## GETTING STARTED

Clone this repository and open it in your code editor. From the root project directory, run *npm install* then *nodemon server*, the server will run on port 3000 (default). You can change the port by setting your own value for the PORT environment variable in .env file (see .env.exemple).

## DATABASE

The API works with MongoDB NoSQL database : don't forget to paste your MongoDB URI as a MONGO_URI value in .env file in order to connect to the database. 


## USE

You can test this API with an API client, like POSTMAN or Thunder client which is the VSCode extension. The documentation is available [here](https://s3.eu-west-1.amazonaws.com/course.oc-static.com/projects/DWJ_FR_P6/Requirements_DW_P6.pdf).
The following extra routes were developed that are not accessible by the Frontend yet:  

|name   |method   |URI   |description   |
|:---|:---|:---|:---|
|readUser   |GET   |/api/auth/   |returns user's data   |
|exportData   |GET   |/api/auth/export/   |prints user's data to a txt document   |
|updateUser   |PUT   |/api/auth/   |updates user's data   |
|deleteUser   |DELETE   |/api/auth   |deletes all user's data   |
|reportUser   |POST   |/api/auth/report/   |reports abusive content for a user id given.   |
|reportSauce   |POST   |/api/sauces/:id/report   |reports abusive content for a sauce id given.  |  

Those routes are only accessible to a logged-in user (a token is required) and, except the report routes, the owner of the profile.


## FRONTEND

The frontend part of the project can be retrieved from this [repository](https://github.com/OpenClassrooms-Student-Center/Web-Developer-P6). Add it to your workspace, open new terminal, then from Web-Developer-P6 directory execute :
- *npm install*
- *npm start*  
The project will run on http://localhost:4200.