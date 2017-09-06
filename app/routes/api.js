var User = require('../models/user');

var Story = require('../models/story');

var config = require('../../config');

var secretKey = config.secretKey;

var jsonwebtoken = require('jsonwebtoken');

function creatToken(user) {
    
    var token = jsonwebtoken.sign({
        id: user.id,
        name: user.name,
        username: user.username
    }, secretKey, {
        expiresIn: 1440
    });

    return token;

}

module.exports = function(app, express) {
    
    var api = express.Router();

    api.post('/signup', function(req, res) {

        var user = new User({

           name: req.body.name,
           username: req.body.username,
           password: req.body.password

        });

        user.save(function(err){
            if(err){
                res.send(err);
                return;
            }
            res.json({ message: 'User has been created!' });
        });

    }); 

    api.get('/users', function(req, res) {
        
        User.find({}, function(err, users) {
            
            if (err){
                res.send(err);
                return;
            }

            res.json(users);
        });
    });

    api.post('/login', function(req, res) {

        User.findOne({
            username: req.body.username
        }).select('password').exec(function(err, user) {
            
            if(err) { res.send(err); return; }

            if(!user) {
                res.send({ message: "The user doesn't exist" });
            } else if (user) {
                
                var validPassword = user.comparePassword(req.body.password);

                if (!validPassword){
                    res.send({ message: "Invalid Password" });
                } else{

                    var token = creatToken(user);

                    res.json({
                       success: true,
                       message: "Successfully Login!",
                       token: token 
                    });
                }
            }
        });
    });

    api.use(function(req, res, next) {
        console.log("Somebody just came to our app!");

        var token = req.body.token || req.param('token') || req.headers['x-access-token'];

        if (token){
            jsonwebtoken.verify(token, secretKey, function (err, decoded) {
                if (err){
                    res.status(403).send({ success: false, message: "Failed to authenticate!" });
                } else {
                    req.decoded = decoded;

                    next();
                }
            });
        }
        else {
            res.status(403).send({ success: false, message: "No Token provided" });
        }
    });

    api.route('/')

        .post(function(req, res) {

            var story = new Story({

                creator: req.decoded.id,
                content: req.body.content

            });

            story.save(function (err) {
                if (err){
                    res.send(err);
                    return
                }

                res.json({ message: "New Story Created!" });
            });
        })

        .get(function (req, res) {

            Story.find({ creator: req.decoded.id }, function (err, stories) {
                if (err){
                    res.send(err);
                    return;
                }

                res.json(stories);
            });

        });

    return api;

}
