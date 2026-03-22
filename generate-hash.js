const bcrypt = require('bcryptjs');

const generateHash = async (password) => {
  const hash = await bcrypt.hash(password, 10);
  console.log('Password:', password);
  console.log('Hash:', hash);
};

generateHash('Test@1234');
