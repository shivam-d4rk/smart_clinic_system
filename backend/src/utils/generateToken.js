import jwt from 'jsonwebtoken';

const generateToken = (res, userId) => {
  // .env file me hum ek JWT_SECRET key banayenge
  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '30d' // Yeh token 30 din tak valid rahega
  });

  // Hum token ko secure HTTP-only Cookie me set kar rahe hain taaki koi hacker ise access na kar sake
  res.cookie('jwt', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV !== 'development', // Production me sirf HTTPS par chalega
    sameSite: 'strict',
    maxAge: 30 * 24 * 60 * 60 * 1000 // 30 din milliseconds me
  });

  return token;
};

export default generateToken;