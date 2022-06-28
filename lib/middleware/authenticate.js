const jwt = require('jsonwebtoken');

module.exports = async (req, res, next) => {

  try {
    const cookie = req.cookies[process.env.COOKIE_NAME];
    // now check the httpOnly session cookie for the current user
    if (!cookie) throw new Error('You must be signed in to continue');
    // verify the JWT token stored in the cookie, then attach to each request
    const user = jwt.verify(cookie, process.env.JWT_SECRET);
    req.user = user;
    
    next();
  } catch (error) {
    error.status = 401;
    next(error);    
  }
};
