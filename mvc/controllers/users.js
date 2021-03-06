const passport = require("passport");
const mongoose = require("mongoose");
const User = mongoose.model("User");
const Post = mongoose.model("Post");
const Book = mongoose.model("Book");
const Message = mongoose.model("Message");
const Favorite = mongoose.model("Favorite");
const Chapter = mongoose.model("Chapter");
const Admin = mongoose.model("Admin");
const Report = mongoose.model("Report");
// const Comment = mongoose.model("Comment");
// const Message = mongoose.model("Message");
// const timeAgo = require("time-ago");

// const containsDuplicate = function(array) {
//     array.sort();
//     for(let i = 0; i < array.length; i++) {
//         if(array[i] == array[i + 1]) {
//             return true;
//         }
//     }
// }

// const addCommentDetails = function(posts) {
//     return new Promise(function(resolve, reject) {
//         let promises = [];
        
//         for(let post of posts) {
//             for(let comment of post.comments) {
//                 let promise = new Promise(function(resolve, reject) {
//                     User.findById(comment.commenter_id, "name profile_image", (err, user) => {
//                         comment.commenter_name = user.name;
//                         comment.commenter_profile_image = user.profile_image;
//                         resolve(comment);
//                     });
//                 });
//                 promises.push(promise);
//             }
//         }
        
//         Promise.all(promises).then((val) => {
//             resolve(posts);
//         });
//     });
// }

// const getRandom = function(min, max) {
//     return Math.floor(Math.random() * (max - min) ) + min;
// }

// const addToPosts = function(array, user) {
//     for(item of array) {
//         item.name = user.name;
//         item.ago = timeAgo.ago(item.date);
//         item.ownerProfileImage = user.profile_image;
//         item.ownerid = user._id;
//     }
// }

// const alertUser = function(fromUser, toId, type, postContent) {
//     return new Promise(function(resolve, reject) {
        
//         let alert = {
//             alert_type: type,
//             from_id: fromUser._id,
//             from_name: fromUser.name,
//         }
        
//         if(postContent && postContent.length > 28) {
//             postContent = postContent.substring(0, 28) + "...";
//         }
        
        
//         switch(type) {
//             case "new_friend":
//                 alert.alert_text = `${alert.from_name} has accepted your friend request.`;
//                 break;
//             case "liked_post":
//                 alert.alert_text = `${alert.from_name} has like your post, '${postContent}'.`;
//                 break;
//             case "commented_post":
//                 alert.alert_text = `${alert.from_name} has commented on your post, '${postContent}'.`;
//                 break;
//             default: return reject("No valid type for alert.");
//         }
        
//         User.findById(toId, (err, user) => {
//             if(err) { reject("Error:", err); return res.json({ err: err }); }
            
//             user.new_notifications++;
//             user.notifications.splice(18);
//             user.notifications.unshift(JSON.stringify(alert));
//             user.save((err) => {
//                 if(err) { reject("Error:", err); return res.json({ err: err }); }
//                 resolve();
//             });
//         });
//     });
// }




// Controllers
const registerUser = function({body}, res) {
    if(
        !body.first_name ||
        !body.last_name ||
        !body.email ||
        !body.password ||
        !body.password_confirm 
    ) {
        return res.send({ message: "All Fields are required." });
    }
    
    if(body.password !== body.password_confirm) {
        return res.send({ message: "Passwords don't match." });
    }
    
    const user = new User();
    
    user.name = body.first_name.trim() + " " + body.last_name.trim();
    user.email = body.email;
    user.setPassword(body.password);
    user.verified = "false";
    user.code = "none";
    
    user.save((err, newUser) => {
        if(err) {
            if(err.errmsg && err.errmsg.includes("duplicate key error") && err.errmsg.includes("email")) {
                return res.json({ message: "The provided email is already registered."} );
            }
            return res.json({ message: "Something went wrong." });
        } else {
            const token = newUser.getJwt();
            res.status(201).json({token, user});
        }
    });
}

const registerAdmin = function({body}, res) {
    if(
        !body.first_name ||
        !body.last_name ||
        !body.email ||
        !body.password ||
        !body.password_confirm 
    ) {
        return res.send({ message: "All Fields are required." });
    }
    
    if(body.password !== body.password_confirm) {
        return res.send({ message: "Passwords don't match." });
    }
    
    const admin = new Admin();
    
    admin.name = body.first_name.trim() + " " + body.last_name.trim();
    admin.email = body.email;
    admin.avatar = body.avatar;
    admin.verified = "false";
    admin.code = "none";
    admin.setPassword(body.password);
    
    admin.save((err, newUser) => {
        if(err) {
            if(err.errmsg && err.errmsg.includes("duplicate key error") && err.errmsg.includes("email")) {
                return res.json({ message: "The provided email is already registered."} );
            }
            return res.json({ message: "Something went wrong." });
        } else {
            const token = newUser.getJwt();
            res.status(201).json({token, admin});
        }
    });
}

const loginUser = function(req, res) {
    if(!req.body.email || !req.body.password) {
        return res.status(400).json({ message: "All fields are required." });
    }
    
    
    passport.authenticate("local", (err, user, info) => {
        if(err) { return res.status(404).json(err) }
        if(user) {
            const token = user.getJwt();
            res.status(201).json({token, user});
        } else { res.json(info); }
    })(req, res);
}

const loginAdmin= function(req, res) {
    if(!req.body.email || !req.body.password) {
        return res.status(400).json({ message: "All fields are required." });
    }
    
    
    passport.authenticate("local", (err, admin, info) => {
        if(err) { return res.status(404).json(err) }
        if(admin) {
            const token = admin.getJwt();
            res.status(201).json({token, admin});
        } else { res.json(info); }
    })(req, res);
}


const removeBook= function(req, res) {
    // if(!req.body.email || !req.body.password) {
    //     return res.status(400).json({ message: "All fields are required." });
    // }
    
    var bookId = req.body.bookId;//req.params.id; 
    var userId = req.body.userId;//req.body.id; 


    User.findOne({ _id: userId }, (err, result) => {
        result.books.id(bookId).remove();
        result.save();
        return res.json(result)
    });
    
   
}

const verifyCode = function(req, res){

    const userId = req.body.id;

    User.updateOne({ _id: userId }, { verified: "true" }, function(err,result) {
        if (err) {
          res.send(err);
        } else {
            res.json("updated");
        }
    });
}

const AdminCode = function(req, res){

    const userId = req.body.id;

    Admin.updateOne({ _id: userId }, { verified: "true" }, function(err,result) {
        if (err) {
          res.send(err);
        } else {
            res.json("updated");
        }
    });
}


const verifyUser= function(req, res) {

    const userEmail = req.body.email;
    const userName = req.body.name;
    const userId = req.body.id;

    let code = Math.random().toString(36).substring(7);

    User.updateOne({ _id: userId }, { code: code }, function(err,result) {
        if (err) {
          
        } else {
            
        }
    });

    User.updateOne({ _id: userId }, { code: code }, function(err,result) {
        if (err) {
          res.send(err);
        } else {
          

            const nodemailer = require('nodemailer');
            const transporter = nodemailer.createTransport({
            service: "hotmail",
            auth:{
                user: "alphaQOpenBook@outlook.com", 
                pass: "sinigangniInangbayan23$343"
            }
            });
        
            const options = {
            from: "alphaQOpenBook@outlook.com",
            to: userEmail,
            subject: "Verify Openbook Account",
            // html: "<h1>Verification code: "+ code +"</h1>"
            html:`<html lang="en">
            <head>
              <style>
                .content {
                  height: 50%;
                  width: 50%;
                  margin-left: auto;
                  margin-right: auto;
                  text-align: center;
                }
              </style>
            </head>
            <body>
              <div class="content">
                <h1>OpenBook</h1>
                <hr />
                <h4>Hi, `+ userName +`Rando!</h4>
                <p>To complete the verification, please enter the code below.</p>
                <br />
                <h1 style="color: rgb(19, 117, 19)">CODE: `+ code +`</h1>
                <br />
                <p>If you do not make this action, please ignore this email.</p>
              </div>
            </body>
          </html>
          `
            }
        
            transporter.sendMail(options, function(err, info){
            if(err){
                return res.json(err);
            }
            return res.json(code);
            });
            
        }
      });


}

const verifyAdmin= function(req, res) {

    const userEmail = req.body.email;
    const userName = req.body.name;
    const userId = req.body.id;

    let code = Math.random().toString(36).substring(7);


    Admin.updateOne({ _id: userId }, { code: code }, function(err,result) {
        if (err) {
          res.send(err);
        } else {
          

            const nodemailer = require('nodemailer');
            const transporter = nodemailer.createTransport({
            service: "hotmail",
            auth:{
                user: "alphaQOpenBook@outlook.com", 
                pass: "sinigangniInangbayan23$343"
            }
            });
        
            const options = {
            from: "alphaQOpenBook@outlook.com",
            to: userEmail,
            subject: "Verify Openbook Account",
            // html: "<h1>Verification code: "+ code +"</h1>"
            html:`<html lang="en">
            <head>
              <style>
                .content {
                  height: 50%;
                  width: 50%;
                  margin-left: auto;
                  margin-right: auto;
                  text-align: center;
                }
              </style>
            </head>
            <body>
              <div class="content">
                <h1>OpenBook</h1>
                <hr />
                <h4>Hi, `+ userName +`Rando!</h4>
                <p>To complete the verification, please enter the code below.</p>
                <br />
                <h1 style="color: rgb(19, 117, 19)">CODE: `+ code +`</h1>
                <br />
                <p>If you do not make this action, please ignore this email.</p>
              </div>
            </body>
          </html>
          `
            }
        
            transporter.sendMail(options, function(err, info){
            if(err){
                return res.json(err);
            }
            return res.json(code);
            });
            
        }
      });


}

// const generateFeed = function({ payload }, res) {
//     let posts = [];
//     let bestiePosts = [];
    
//     let myPosts = new Promise(function(resolve, reject) {
//         User.findById(payload._id, "", {lean: true}, (err, user) => {
//             if(err) { return res.statusJson(400, { err: err }); }
//             if(!user) { return res.json(404, { message: "User does not exist." }); }
//             addToPosts(user.posts, user);
//             posts.push(...user.posts);
            
//             user.friends = user.friends.filter((val) => {
//                 return !user.besties.includes(val);
//             });
            
//             resolve(user);
//         });
//     });
    
//     function getPostsFrom(arrayOfUsers, maxAmountOfPosts, postsArray) {
//         return new Promise(function(resolve, reject) {
//             User.find({ "_id": { $in: arrayOfUsers } }, "name posts profile_image", {lean: true}, (err, users) => {
//                 if(err) { reject("Error", err); return res.json({ err: err }); }
                
//                 for(user of users) {
//                     addToPosts(user.posts, user);
//                     postsArray.push(...user.posts);
//                 }
                
//                 postsArray.sort((a, b) => (a.date > b.date) ? -1 : 1);
//                 postsArray.splice(maxAmountOfPosts);
                
//                 addCommentDetails(postsArray).then(() => {
//                     resolve();
//                 });
//             });
//         });
//     }
    
    
//     let myBestiesPosts = myPosts.then(({ besties }) => {
//         return getPostsFrom(besties, 4, bestiePosts);
//     });
    
//     let myFriendsPosts = myPosts.then(({ friends }) => {
//         return getPostsFrom(friends, 48, posts);
//     });
    
//     Promise.all([myBestiesPosts, myFriendsPosts]).then(() => {
//         res.statusJson(200, { posts, bestiePosts });
//     });
// }

// const getSearchResults = function({ query, payload }, res) {
//     if(!query.query) { return res.json({ err: "Missing a query." }); }
//     User.find({ name: { $regex: query.query, $options: "i" } }, "name profile_image friends friend_requests", (err, results) => {
//         if(err) { return res.json({ err: err }); }
        
//         results = results.slice(0, 20);
        
//         for(let i = 0; i < results.length; i++) {
//             if(results[i]._id == payload._id) {
//                 results.splice(i, 1);
//                 break;
//             }
//         }
        
        
//         return res.status(200).json({ message: "Getting Search Results", results: results });
//     });
// }

// const makeFriendRequest = function({params}, res) {
//     User.findById(params.to, (err, user) => {
//         if(err) { return res.json({ err: err }); }
        
//         if(containsDuplicate([params.from, ...user.friend_requests])) {
//             return res.json({ message: "Friend request is already sent." });
//         }
        
//         user.friend_requests.push(params.from);
//         user.save((err, user) => {
//             if(err) { return res.json({ err: err }); }
//             return res.statusJson(201, { message: "Successfully sent a friend request." });
//         });
//     });
// }

const getReported = function({params}, res){
    Report.find((err, data) =>{
        if(err){
         res.json(err);
        }
        res.json(data);
    })
}

const getAllData = function({params}, res) {
   User.find((err, data) =>{
       if(err){
        res.json(err);
       }
       res.json(data);
   })
}

const getUserData = function({params}, res) {
    User.findById(params.userid, "-salt -password", {lean: true}, (err, user) => {
        if(err) { return res.statusJson(400, { err: err }); }
        if(!user) { return res.json(404, { message: "User does not exist." }); }
        
        // function getRandomFriends(friendsList) {
        //     let copyOfFriendsList = Array.from(friendsList);
        //     let randomIds = [];
            
        //     for(let i = 0; i < 6; i++) {
        //         if(friendsList.length <= 6) { randomIds = copyOfFriendsList; break;  }
                
        //         let randomId = getRandom(0, copyOfFriendsList.length);
        //         randomIds.push(copyOfFriendsList[randomId]);
        //         copyOfFriendsList.splice(randomId, 1);
        //     }
            
        //     return new Promise(function(resolve, reject) {
        //         User.find({'_id': { $in: randomIds }}, "name profile_image", (err, friends) => {
        //             if(err) { return res.json({ err: err }); }
        //             resolve(friends);
        //         });
        //     });
        // }
        
        // function addMessengerDetails(messages) {
        //     return new Promise(function(resolve, reject) {
        //         if(!messages.length) { resolve(messages); }
                
        //         let usersArray = [];
                
        //         for(let message of messages) {
        //             usersArray.push(message.from_id);
        //         }
                
        //         User.find({'_id': { $in: usersArray }}, "name profile_image", (err, users) => {
        //             if(err) { return res.json({ err: err }); }
                    
        //             for(message of messages) {
        //                 for(let i = 0; i < users.length; i++) {
        //                     if(message.from_id == users[i]._id) {
        //                         message.messengerName = users[i].name;
        //                         message.messengerProfileImage = users[i].profile_image;
        //                         users.splice(i, 1);
        //                         break;
        //                     }
        //                 }
        //             }
                    
        //             resolve(messages);
        //         });
        //     });
        // }
        
        // user.posts.sort((a, b) => (a.date > b.date) ? -1 : 1);
        
        // addToPosts(user.posts, user);
        
        // let randomFriends = getRandomFriends(user.friends);
        // let commentDetails = addCommentDetails(user.posts);
        // let messageDetails = addMessengerDetails(user.messages);
        
        // let besties = new Promise(function(resolve, reject) {
        //     User.find({'_id': { $in: user.besties }}, "name profile_image", (err, users) => {
        //         user.besties = users;
        //         resolve();
        //     });
        // });
        
        // let enemies = new Promise(function(resolve, reject) {
        //     User.find({'_id': { $in: user.enemies }}, "name profile_image", (err, users) => {
        //         user.enemies = users;
        //         resolve();
        //     });
        // });
        
        // let waitFor = [randomFriends, commentDetails, messageDetails, besties, enemies];
        
        // Promise.all(waitFor).then((val) => {
            // user.random_friends = val[0];
            // user.messages = val[2];
            res.statusJson(200, { user: user });
        // });
    });
}

// const getFriendRequests = function({query}, res) {
//     let friendRequests = JSON.parse(query.friend_requests);
//     User.find({ '_id': { $in: friendRequests } }, "name profile_image", (err, users) => {
//         if(err) { return res.json({ err: err }); }
//         return res.statusJson(200, { message: "Getting friend requests", users: users });
//     });
// }

// const resolveFriendRequest = function({ query, params }, res) {
//     User.findById(params.to, (err, user) => {
//         if(err) { return res.json({ err: err }); }
        
//         for(let i = 0; i < user.friend_requests.length; i++) {
//             if(user.friend_requests[i] == params.from) {
//                 user.friend_requests.splice(i, 1);
//                 break;
//             }
//         }
        
//         let promise = new Promise(function(resolve, reject) {
            
//             if(query.resolution == "accept") {
                
//                 if(containsDuplicate([params.from, ...user.friends])) {
//                     return res.json({ message: "Duplicate Error." });
//                 }
                
//                 user.friends.push(params.from);
                
//                 User.findById(params.from, (err, user) => {
//                     if(err) { return res.json({ err: err }); }
                    
//                     if(containsDuplicate([params.to, ...user.friends])) {
//                         return res.json({ message: "Duplicate Error." });
//                     }
                    
//                     user.friends.push(params.to);
//                     user.save((err, user) => {
//                         if(err) { return res.json({ err: err }); }
//                         resolve();
//                     });
//                 });
//             } else {
//                 resolve();
//             }
//         });
        
        
//         promise.then(() => {
//             user.save((err, user) => {
//                 if(err) { return res.json({ err: err }); }
//                 alertUser(user, params.from, "new_friend").then(() => {
//                     res.statusJson(201, { message: "Resolved friend request" });
//                 });
//             });
//         })
//     });
// }

const getAllBook = function({params}, res) {
    User.find((err, user) =>{
        if(err){
            res.json(err)
        }
        user.books.find((err, book) =>{
            if(err){
                res.json(err)
            }
            res.json(book)
        });
       
    }) 
}
const createPost = function({ body, payload }, res) {
    if(!body.content) {
        return res.statusJson(400, { message: "Insufficient data sent with the request." });
    }
    
    let userId = payload._id; 
    
    const post = new Post();
    post.content = body.content;
    post.bookId = body.bookId;
    
    User.findById(userId, (err, user) => {
        if(err) { return res.json({ err: err }); }
        
        let newPost = post.toObject();
        // newPost.name = payload.name;
        // newPost.ownerid =payload._id;
        //newPost.ownerProfileImage = user.profile_image;
        user.posts.push(post);
        user.save((err) => {
            if(err) { return res.json({ err: err }); }
            return res.statusJson(201, { message: "Created post", newPost: newPost });
        });
    });
}

//create new Book
const createBook = function({ body, payload }, res) {
    if(!body.title || !body.summary) {
        return res.statusJson(400, { message: "Insufficient data sent with the request." });
    }
    
    let userId = payload._id; 
    
    const book = new Book();
    
    book.title = body.title;
    book.summary = body.summary;
    book.by = body.by;
    book.owner_id = userId;
    book.genre = body.genre;
    User.findById(userId, (err, user) => {
        if(err) { return res.json({ err: err }); }
        
        let newPost = book.toObject();
        newPost.name = payload.name;
        newPost.ownerid = payload._id;
        user.books.push(book);
        user.save((err) => {
            if(err) { return res.json({ err: err }); }
            return res.statusJson(201, { message: "Book created", newPost: newPost });
        });
    });
}


//Report Book
const reportBook = function({ body, payload }, res) {
   

    const report = new Report();
    
    report.bookId = body.bookId;
    report.title = body.title;
    report.info = body.info;
    report.type = body.type;
   

    report.save((err, newUser) => {
        if(err) {
            return res.json(err);
        } else {
            res.status(201).json(newUser);
        }
    });

}

const createMessage = function({ body, payload }, res) {
    if(!body.content || !body.from || !body.to) {
        return res.statusJson(400, { message: "Insufficient data sent with the request." });
    }

    let userId = body.my_id; 
    let otherId = body.other_id;
    
    const message = new Message();
    
    message.content = body.content;
    message.from = body.from;
    message.to = body.to;
    // book.summary = body.summary;
    // book.by = body.by;
    // book.owner_id = userId;
    
    User.findById(userId, (err, user) => {
        if(err) { return res.json({ err: err }); }
        
        let newPost = message.toObject();
        user.messages.push(message);
        user.save((err) => {
            if(err) { return res.json({ err: err }); }
            return res.statusJson(201, { message: "Book created", newPost: newPost });
        });
    });

    User.findById(otherId, (err, other) => {
        if(err) { return res.json({ err: err }); }
        
        let newPost = message.toObject();
        other.messages.push(message);
        other.save((err) => {
            
        });
    });
}

const addToFave = function({ body, payload }, res) {
    if(!body.bookId) {
        return res.statusJson(400, { message: "Insufficient data sent with the request." });
    }
    
    let userId = payload._id; 
    
    const favorite = new Favorite();
    
    favorite.bookId = body.bookId;
    
    User.findById(userId, (err, user) => {
        if(err) { return res.json({ err: err }); }
        
        let newPost = favorite.toObject();
        user.favorites.push(favorite);
        user.save((err) => {
            if(err) { return res.json({ err: err }); }
            return res.statusJson(201, { message: "Added to Fave", newPost: newPost });
        });
    });
}

//db.users.find().pretty()  db.libraries.find().pretty()
//show collections
// function addToLibrary(book){
//     const library = new Library();
//     library.books.push(book);

//     library.save((err) =>{
//         if(err){return console.log(err)}
//         return console.log("Added to Library");
//     })
// }

const createChapter = function({ body, payload }, res) {
    if(!body.title || !body.content || !body.bookId) {
        return res.statusJson(400, { message: "Insufficient data sent with the request." });
    }
    let userId = payload._id; 
    const chapter = new Chapter();
    
    chapter.title = body.title;
    chapter.content = body.content;
    chapter.bookId = body.bookId;

    User.findById(userId, (err, user) => {
        if(err) { return res.json({ err: err }); }
        
        let newPost = chapter.toObject();
        user.chapters.push(chapter);
        user.save((err) => {
            if(err) { return res.json({ err: err }); }
            return res.statusJson(201, { message: "Chapter created", newPost: newPost });
        });
    });
}

// const likeUnlike = function({ payload, params }, res) {
//     User.findById(params.ownerid, (err, user) => {
//         if(err) { return res.json({ err: err }); }
        
//         const post = user.posts.id(params.postid);
        
//         let promise = new Promise(function(resolve, reject) {
            
//             if(post.likes.includes(payload._id)) {
//                 post.likes.splice(post.likes.indexOf(payload._id), 1);
//                 resolve();
//             } else {
//                 post.likes.push(payload._id);
                
//                 if(params.ownerid != payload._id) {
//                     User.findById(payload._id, (err, user) => {
//                         if(err) { reject("Error:", err); return res.json({ err: err }); }
//                         alertUser(user, params.ownerid, "liked_post", post.content).then(() => {
//                             resolve();
//                         });
//                     });
//                 } else { resolve(); }
//             }
//         });
        
//         promise.then(() => {
//             user.save((err, user) => {
//                 if(err) { return res.json({ err: err }); }
//                 res.statusJson(201, { message: "Like or Unlike a post..." });
//             });
//         });
//     });
// }

// const postCommentOnPost = function({ body, payload, params }, res) {
//     User.findById(params.ownerid, (err, user) => {
//         if(err) { return res.json({ err: err }); }
        
//         const post = user.posts.id(params.postid);
        
//         let comment = new Comment();
//         comment.commenter_id = payload._id;
//         comment.comment_content = body.content;
//         post.comments.push(comment);
        
//         user.save((err, user) => {
//             if(err) { return res.json({ err: err }); }
            
//             User.findById(payload._id, "name profile_image", (err, user) => {
//                 if(err) { return res.json({ err: err }); }
                
//                 let promise = new Promise(function(resolve, reject) {
//                     if(payload._id != params.ownerid) {
//                         alertUser(user, params.ownerid, "commented_post", post.content).then(() => {
//                             resolve();
//                         });
//                     } else {
//                         resolve();
//                     }
//                 });
                
//                 promise.then(() => {
//                     res.statusJson(201, {
//                         message: "Posted Comment",
//                         comment: comment,
//                         commenter: user
//                     });
//                 });
//             });
//         });
//     });
// }

// const sendMessage = function({ body, payload, params }, res) {
    
//     let from = payload._id;
//     let to = params.to;
    
//     let fromPromise = new Promise(function(resolve, reject) {
//         User.findById(from, "messages", (err, user) => {
//             if(err) { reject("Error", err); return res.json({ err: err }); }
//             from = user;
//             resolve(user);
//         });
//     });
    
//     let toPromise = new Promise(function(resolve, reject) {
//         User.findById(to, "messages new_message_notifications", (err, user) => {
//             if(err) { reject("Error", err); return res.json({ err: err }); }
//             to = user;
//             resolve(user);
//         });
//     });
    
//     let sendMessagePromise = Promise.all([fromPromise, toPromise]).then(() => {
        
//         function hasMessageFrom(messages, id) {
//             for(let message of messages) {
//                 if(message.from_id == id) {
//                     return message;
//                 }
//             }
//         }
        
//         function sendMessageTo(to, from, notify = false) {
//             return new Promise(function(resolve, reject) {
                
//                 if(notify && !to.new_message_notifications.includes(from._id)) {
//                     to.new_message_notifications.push(from._id);
//                 }
                
//                 if(foundMessage = hasMessageFrom(to.messages, from._id)) {
//                     foundMessage.content.push(message);
//                     to.save((err, user) => {
//                         if(err) { reject("Error", err); return res.json({ err: err }); }
//                         resolve(user);
//                     });
                    
//                 } else {
                    
//                     let newMessage = new Message();
//                     newMessage.from_id = from._id;
//                     newMessage.content = [message];
                    
//                     to.messages.push(newMessage);
//                     to.save((err, user) => {
//                         if(err) { reject("Error", err); return res.json({ err: err }); }
//                         resolve(user);
//                     });
//                 }
//             });
//         }
        
//         let message = {
//             messenger: from._id,
//             message: body.content
//         }
        
//         let sendMessageToRecipient = sendMessageTo(to, from, true);
//         let sendMessageToAuthor = sendMessageTo(from, to);
        
        
//         return new Promise(function(resolve, reject) {
//             Promise.all([sendMessageToRecipient, sendMessageToAuthor]).then(() => {
//                 resolve();
//             });
//         });
//     });
    
    
//     sendMessagePromise.then(() => {
//         return res.statusJson(201, { message: "Sending Message" });
//     });
// }

// const resetMessageNotifications = function({ payload }, res) {
//     User.findById(payload._id, (err, user) => {
//         if(err) { return res.json({ err: err }); }
//         user.new_message_notifications = [];
//         user.save((err) => {
//             if(err) { return res.json({ err: err }); }
//             return res.statusJson(201, { message: "Reset message notifications." });
//         });
//     });
// }

// const deleteMessage = function({ payload, params }, res) {
//     User.findById(payload._id, (err, user) => {
//         if(err) { return res.json({ err: err }); }
//         const message = user.messages.id(params.messageid).remove();
        
//         user.save((err) => {
//             if(err) { return res.json({ err: err }); }
//             return res.statusJson(201, { message: "Deleted Message" });
//         });
//     });
// }

// const bestieEnemyToggle = function({ payload, params, query }, res) {
//     let toggle = query.toggle;
//     if(toggle != "besties" && toggle != "enemies") {
//         return res.json({ message: "Incorrect query supplied" });
//     }
    
//     let myId = payload._id;
//     let friendId = params.userid;
    
//     User.findById(myId, (err, user) => {
//         if(err) { return res.json({ err: err }); }
//         if(!user.friends.includes(friendId)) {
//             return res.json({ message: "You are not friends with this user." });
//         }
        
//         let arr = user[toggle];
        
        
//         if(arr.includes(friendId)) {
//             arr.splice(arr.indexOf(friendId), 1);
//         } else {
//             if(toggle == "besties" && user.besties.length >= 2) {
//                 return res.json({ message: "You have the max amount of besties." });
//             }
//             arr.push(friendId);
//         }
        
//         user.save((err) => {
//             if(err) { return res.json({ err: err }); }
//             return res.statusJson(201, { message: "Bestie/Enemy Toggle" });
//         });
//     });
// }

// const resetAlertNotifications = function({ payload }, res) {
//     User.findById(payload._id, (err, user) => {
//         if(err) { return res.json({ err: err }); }
//         user.new_notifications = 0;
//         user.save((err) => {
//             if(err) { return res.json({ err: err }); }
//             return res.statusJson(201, { message: "Reset Alert Notifications." });
//         });
//     });
// }




// const deleteAllUsers = function(req, res) {
//     User.deleteMany({}, (err, info) => {
//         if(err) { return res.send({ error: err }); }
//         return res.json({ message: "Deleted All Users", info: info });
//     });
// }

// const getAllUsers = function(req, res) {
//     User.find((err, users) => {
//         if(err) { return res.send({ error: err }); }
//         return res.json({ users: users });
//     });
// }


module.exports = {
    // deleteAllUsers,
    // getAllUsers,
    registerUser,
    loginUser,
    getAllBook,
    // generateFeed,
    // getSearchResults,
    // makeFriendRequest,
    getUserData,
    getAllData,
    // getFriendRequests,
    // resolveFriendRequest,
    createPost,
    createBook,
    createMessage,
    createChapter,
    addToFave,
    registerAdmin,
    loginAdmin,
    removeBook,
    verifyUser,
    verifyCode,
    reportBook,
    getReported,
    verifyAdmin,
    AdminCode,
    // likeUnlike,
    // postCommentOnPost,
    // sendMessage,
    // resetMessageNotifications,
    // deleteMessage,
    // bestieEnemyToggle,
    // resetAlertNotifications
}