const argon2 = require('argon2');

async function main() {
  try {
    const hash = '$argon2id$v=19$m=65536,t=3,p=4$Vggc7zLFA9rQ1LAw6qwyKA$6PWt71+QCjkoL2fiElizxgYRvNEb+JDMBTiPYx/PSm8';
    const password = 'AdminPass123!';

    const isValid = await argon2.verify(hash, password);
    console.log('Password verification result:', isValid);

    if (isValid) {
      console.log('✅ Password is correct');
    } else {
      console.log('❌ Password is incorrect');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

main();
