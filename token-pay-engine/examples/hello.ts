// 
// npx tsx examples/hello.ts 
//

import 'dotenv/config'; // これ1行で .env をロード、ただし CloudRunでは使えない

console.log('PORT:', process.env);

const world = 'world';

function hello(who: string = world): string {
  return `Hello ${who}!`;
}

console.log(hello());
