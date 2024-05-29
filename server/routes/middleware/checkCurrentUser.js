import jwt from 'jsonwebtoken';
import User from '../../db/models/user.js';

const checkCurrentUser = (req, res, next) => {
  const token = req.cookies.auth;
  if (token) {
    jwt.verify(token, process.env.SECRET_JWT_KEY, async (err, decodedToken) => {
      if (err) {
        console.error(err.message);
        res.locals.user = null;
        next();
      } else {
        let user = await User.findById(decodedToken.id).exec();
        res.locals.user = user;
        next();
      }
    });
  } else {
    res.locals.user = null;
    next();
  }
};

export default checkCurrentUser;
