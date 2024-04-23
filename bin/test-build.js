const { MCPackBuilder } = require('./src/builder')
require('dotenv').config({ path: `${__dirname}/.env` })

const builder = new MCPackBuilder('', {
    sourceDir: `../pack`,
    outputDir: process.env.TEST_INSTANCE
})
builder.compile()