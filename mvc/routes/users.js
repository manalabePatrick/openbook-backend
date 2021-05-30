const express = require('express');
const router = express.Router();
const middleware = require("./middleware/middleware");

const usersCtrl = require("../controllers/users");
// const fakeUsersCtrl = require("../controllers/fake-users");


// Logging In & Registering
router.post("/register", usersCtrl.registerUser);
router.post("/login", usersCtrl.loginUser);
router.post("/create-admin", usersCtrl.registerAdmin);
router.post("/login-admin", usersCtrl.loginAdmin);

// // Get Requests
// router.get("/generate-feed", middleware.authorize, usersCtrl.generateFeed);
router.get("/get-user-data/:userid", middleware.authorize,usersCtrl.getUserData);
router.get("/get-all-data", usersCtrl.getAllData);  //middleware.authorize
router.get("/get-reported",  usersCtrl.getReported);
// router.get("/get-search-results", middleware.authorize, usersCtrl.getSearchResults);


// // Routes Handling Friend Requests
// router.get("/get-friend-requests", middleware.authorize, usersCtrl.getFriendRequests);
// router.post("/make-friend-request/:from/:to", middleware.authorize, usersCtrl.makeFriendRequest);
// router.post("/resolve-friend-request/:from/:to", middleware.authorize, usersCtrl.resolveFriendRequest);


// // Routes Handling Posts
router.post("/create-post", middleware.authorize,usersCtrl.createPost);
router.post("/create-book", middleware.authorize, usersCtrl.createBook);
router.post("/create-chapter",middleware.authorize, usersCtrl.createChapter); 
router.post("/favorite", middleware.authorize, usersCtrl.addToFave); 
router.post("/create-message", middleware.authorize, usersCtrl.createMessage); 
router.post("/remove",  usersCtrl.removeBook); //middleware.authorize,
router.post("/verify",  usersCtrl.verifyUser);
router.post("/verify-admin",  usersCtrl.verifyAdmin);
router.post("/code",  usersCtrl.verifyCode);
router.post("/code-admin",  usersCtrl.AdminCode);
router.post("/report",  usersCtrl.reportBook);

// router.post("/like-unlike/:ownerid/:postid", middleware.authorize, usersCtrl.likeUnlike);
// router.post("/post-comment/:ownerid/:postid", middleware.authorize, usersCtrl.postCommentOnPost);





// // Routes Handling Messages
// router.post("/send-message/:to", middleware.authorize, usersCtrl.sendMessage);
// router.post("/delete-message/:messageid", middleware.authorize, usersCtrl.deleteMessage);
// router.post("/reset-message-notifications", middleware.authorize, usersCtrl.resetMessageNotifications);


// // Misc Routes
// router.post("/bestie-enemy-toggle/:userid", middleware.authorize, usersCtrl.bestieEnemyToggle);
// router.post("/reset-alert-notifications", middleware.authorize, usersCtrl.resetAlertNotifications);




// // ===============================
// // Development & Testing Only!
// router.delete("/all", usersCtrl.deleteAllUsers);
// router.get("/all", usersCtrl.getAllUsers);

// router.post("/create-fake-users", fakeUsersCtrl.createFakeUsers);




module.exports = router;
