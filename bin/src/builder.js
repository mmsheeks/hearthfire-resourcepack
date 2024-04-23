const fs = require('fs')
const archiver = require('archiver')
const path = require('node:path')

class Builder {

    constructor( outputFile = '', userOptions = {} )
    {
        let options = Object.assign({
            outputDir: `build`,
            filename: `ResourcePack.zip`,
            sourceDir: `pack`
        }, userOptions )
        let filename = outputFile.length === 0 ? options.filename : outputFile

        // setup configuration
        let config = {
            tmpfile: path.resolve( options.outputDir, ".builder-artifact.zip" ),
            source: path.resolve( options.sourceDir ),
            target: path.resolve( options.outputDir, filename ),
            targetDir: path.resolve( options.outputDir )
        }
        this.config = config
    }

    compile()
    {
        let config = this.config

        if( fs.existsSync( config.tmpfile ) ) {
            fs.unlinkSync( config.tmpfile )
        }

        if( ! fs.existsSync( config.targetDir )) {
            fs.mkdirSync( config.targetDir )
        }

        const stream = fs.createWriteStream( config.tmpfile )
        const archive = archiver('zip', { zlib: { level: 9 } })

        // setup stream close handler
        stream.on('close', () => {
            fs.copyFileSync( config.tmpfile, config.target )
            fs.unlinkSync( config.tmpfile )
            console.log( `Successfully created: ${config.target}`)
        })

        // setup stream end handler
        stream.on('end', () => {
            console.log('Packaging complete')
        })

        // setup archive warning handler
        archive.on('warning', ( err ) => {
            if( err.code === 'ENOENT' ) {
                console.log(err.message)
            } else {
                throw err
            }
        })

        // setup archive error handler
        archive.on('error', ( err ) => {
            throw err
        })

        // write the pack directory to the output stream, compressed
        archive.pipe(stream)
        archive.directory( config.source, false )
        archive.finalize()
    }
}

module.exports = {
    MCPackBuilder: Builder
}