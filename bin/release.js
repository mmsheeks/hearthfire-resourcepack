const { MCPackReleaser } = require('./src/releaser')

require('dotenv').config({ path: `${__dirname}/.env`})

const releaser = new MCPackReleaser( 'build/ResourcePack.zip', process.env )

releaser.create().then(() => {
    releaser.upload().then((upload) => {
        let body = "Download the resource pack here: " + upload.browser_download_url
        releaser.setBody( body ).then((release) => {
            console.log( 'Successfully created Release: ' + release.tag_name )
        })
    })
})