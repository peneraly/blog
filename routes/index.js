
var crypto = require('crypto');
User = require('../modules/user');

module.exports = function (app) {
    app.get('/', function(req, res, next) {
      res.render('index', { title: '主页' });
    });

    app.get('/reg', function(req, res, next) {
      res.render('reg', { title: '注册' });
    });

    app.post('/reg', function(req, res) {
        console.log(req);
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
            password: req.body.password,
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

    app.get('/login', function(req, res, next) {
      res.render('login', { title: '登录' });
    });

    app.post('/login', function(req, res, next) {
    });

    app.get('/post', function(req, res, next) {
      res.render('post', { title: '发表' });
    });

    app.post('/post', function(req, res, next) {
    });

    app.get('/logout', function(req, res, next) {
    });
} 
