// eslint-disable-next-line no-undef,@typescript-eslint/no-var-requires
var mongoose = require('mongoose');

// eslint-disable-next-line no-undef
const number = process.env.npm_config_number ?? 1;

for (let i = 0; i < number; i++) {
    // eslint-disable-next-line no-undef
    process.stdout.write(`${new mongoose.Types.ObjectId()}\n`);
}
