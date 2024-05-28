import jwt from 'jsonwebtoken';

const requireAuth = (req, res, next) => {
  const token = req.cookies.jwt;

  if (token) {
    jwt.verify(token, process.env.SECRET_JWT_KEY, (err, decodedToken) => {
      if (err) {
        res.redirect('/login');
      } else {
        console.log(decodedToken);
        next();
      }
    });
  } else {
    res.redirect('/login');
  }
};

export default requireAuth;
