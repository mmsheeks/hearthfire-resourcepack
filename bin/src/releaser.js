const fs = require('fs')
const path = require('node:path')
const crypto = require('node:crypto')
const { Octokit } = require("@octokit/core")

class Releaser {

    constructor(filepath = '', env) {
        this.token = env.GITHUB_TOKEN
        this.branch = env.RELEASE_BRANCH
        this.octokit = new Octokit({ auth: this.token })
        this.resource = path.resolve(filepath)
    }

    async create() {
        const newTag = await this.getTag()
        const release = await this.api(
            'POST',
            '/repos/{owner}/{repo}/releases',
            {
                owner: 'clovercraft',
                repo: 'resource-pack',
                tag_name: newTag,
                target_commitish: this.branch,
                name: newTag,
                draft: false,
                prerelease: false,
                generate_release_notes: false
            }
        )
        this.release = release
        return release
    }

    async upload() {
        let upload_url = this.release.upload_url
        let response = await this.api(
            'POST',
            upload_url,
            {
                name: 'ResourcePack.zip',
                data: fs.readFileSync(this.resource)
            }
        )
        return response
    }

    async setBody(string) {
        let body = this.appendShaToBody(string)
        let release_url = this.release.url
        let response = await this.api(
            'PATCH',
            release_url, {
            body: body
        }
        )
        return response
    }

    appendShaToBody(body) {
        const file = fs.readFileSync(this.resource)
        const hashSum = crypto.createHash('sha1')
        hashSum.update(file)
        const sha = hashSum.digest('hex')
        body += '\n\n Hash: ' + sha
        return body
    }

    async getTag() {
        let response = await this.api(
            'GET',
            '/repos/{owner}/{repo}/tags',
            {
                owner: 'clovercraft',
                repo: 'resource-pack',
            }
        )
        let latest = response[0].name.split('.');
        let major = latest[0];
        let minor = latest[1];
        let patch = latest[2];
        let build = 1;
        if (latest.length == 4) {
            build = latest[3];
        }

        if (this.branch !== 'production') {
            build++
            return [major, minor, patch, build].join('.');
        } else {
            patch++
            return [major, minor, patch].join('.');
        }
    }

    async api(method, endpoint, options) {
        options.url = endpoint
        options.method = method
        options.headers = {
            authorization: `token ${this.token}`
        }
        let response = await this.octokit.request(options)

        if (response.status >= 300) {
            console.error(response)
            throw new Error('API request failed.')
        }

        return response.data
    }
}

module.exports = {
    MCPackReleaser: Releaser
}