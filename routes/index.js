
var crypto = require('crypto');
User = require('../modules/user');
Post = require('../modules/post');


module.exports = function (app) {
    app.get('/', function(req, res, next) {
        // 获取该用户的所有文章列表
        Post.getAll(null, function (err, posts) {
            if (err) {
                posts = [];
            }
            res.render('index', {
                title: '主页',
                user: req.session.user,
                posts: posts,
                success: req.flash('success').toString(),
                error: req.flash('error').toString()
            });
        });
    });

    app.get('/reg', checkNotLogin);
    app.get('/reg', function(req, res, next) {
        res.render('reg', {
            title: '注册',
            user: req.session.user,
            success: req.flash('success').toString(),
            error: req.flash('error').toString()
        });
    });

    app.post('/reg', checkNotLogin);
    app.post('/reg', function(req, res) {
        var name = req.body.name,
            password = req.body.password,
            password_re = req.body['password-repeat'];

        // 验证密码
        if (password_re !== password) {
            req.flash('error', '两次数据的密码不一致');
            return res.redirect('/reg'); //返回注册页
        }

        // 生成密码MD5值
        var md5 = crypto.createHash('md5'),
            password = md5.update(req.body.password).digest('hex');
        var newUser = new User({
            name: req.body.name,
            password: password,
            email: req.body.email
        });

        // 检查用户是否已经存在
        User.get(newUser.name, function (err, user) {
            if (err) {
                req.flash('error', err);
                return res.redirect('/');
            }
            if (user) {
                req.flash('error', '用户已存在！');
                return res.redirect('/reg');
            }
            // 不存在，则新增用户
            newUser.save(function (err, user) {
                if (err) {
                    req.flash('error', err);
                    return res.redirect('/reg');
                }
                req.session.user = user; //用户信息存入session
                req.flash('success', '注册成功！');
                res.redirect('/');
            });
        });
    });
    
    app.get('/login', checkNotLogin);
    app.get('/login', function(req, res, next) {
        res.render('login', {
            title: '登录',
            user: req.session.user,
            success: req.flash('success').toString(),
            error: req.flash('error').toString()
        });
    });

    app.post('/login', checkNotLogin);
    app.post('/login', function(req, res, next) {
        var md5 = crypto.createHash('md5'),
            password = md5.update(req.body.password).digest('hex');
        // 检查用户是否存在
        User.get(req.body.name, function (err,user) {
            if (!user) {
                req.flash('error', '用户不存在!');
                return res.redirect('/login');
            }
            // 检查密码是否一致
            if (user.password != password) {
                req.flash('error', '密码错误！');
                return res.redirect('/login');
            }

            // 用户信息存入session
            req.session.user = user;
            req.flash('success', '登录成功');
            res.redirect('/');
        })
    });

    app.get('/post', checkLogin);
    app.get('/post', function(req, res, next) {
        res.render('post', {
            title: '发表',
            user: req.session.user,
            success: req.flash('success').toString(),
            error: req.flash('error').toString()
        });
    });

    app.post('/post', checkLogin);
    app.post('/post', function(req, res, next) {
        var currentUser = req.session.user,
            post = new Post(currentUser.name, req.body.title, req.body.post);
        post.save(function (err) {
            if (err) {
                req.flash('error', err);
                return res.redirect('/');
            }
            req.flash('success', '发布成功！');
            res.redirect('/');
        });
    });

    app.post('/logout', checkLogin);
    app.get('/logout', function(req, res, next) {
        req.session.user = null;
        req.flash('success', '登出成功!');
        res.redirect('/');
    });
}

function checkLogin (req, res, next) {
    if (!req.session.user) {
        req.flash('error', '未登录');
        res.redirect('/login');
    }
    next();
}

function checkNotLogin (req, res, next) {
    if (req.session.user) {
        req.flash('error', '已登录');
        res.redirect('back'); //返回之前的页面
    }
    next();
}
