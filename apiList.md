##authRouter
-POST /signup
-POST /login
-POST /logout

##profileRouter
-GET /profile/view
-PATCH /profile/edit
-PATCH /profile/password

##connectionRequestRouter
-POST /request/send/interested/:userId //right swipe
-POST /request/send/ignored/:userId
-POST /request/review/accepted/:userId //req accepted by other user
-POST /request/review/rejected/:user

will be reduced to

POST /user/send/:status/:userId
POST /request/review/:status/:requestId

##userRouter
-GET /user/connections
-GET /user/requests/received
-GET /user/feed - Gets you the profiles of other users on platform
