'use strict'

const path = require('path')
const fs = require('fs')

const defaults = {
    directory: path.join(__dirname, 'src'),
    excludes: [],
    extentions: {
        stylesheet: '.css',
        script: '.js'
    }
}

const getFiles = (directory, excludes) => {
    let files = []

    const folder = fs.readdirSync(directory)

    for (let i = 0; i < folder.length; i++) {
        const filePath = path.join(directory, folder[i])
        const stat = fs.statSync(filePath)

        if (stat && stat.isDirectory()) {
            files = files.concat(getFiles(filePath, excludes))
        } else {
            let keep = true

            excludes.forEach(str => {
                if (filePath.includes(str)) { keep = false }
            })

            if (keep) { files.push(filePath) }
        }
    }

    return files
}

/**
 * Represents a cattleman, who gathers from the modular project directory.
 * @constructor
 * @param {object} options - (optional) Object to override default options.
 */
function Cattleman(options) {
    'use strict'

    if (!(this instanceof Cattleman)) {
        throw new Error('Cattleman needs to be called with the new keyword')
    }

    if (typeof options === 'string') {
        options = {
            directory: options
        }
    }

    this.options = Object.assign(defaults, options)
}

/**
 * Parses project directory and creates a list of valid files.
 * @returns {array} - List of valid files
 */
Cattleman.prototype.gatherFiles = function () {
    const files = getFiles(this.options.directory, this.options.excludes)
    return files
}

/**
 * Parses project directory and creates entry object of scripts and stylesheets arrays.
 * Object keys are the module chunk names.
 * @returns {object} - Entry object
 */
Cattleman.prototype.gatherEntries = function () {
    let files = getFiles(this.options.directory, this.options.excludes)

    files = files.filter(file => {
        const ext = path.extname(file)
        return (ext === this.options.extentions.script || ext === this.options.extentions.stylesheet)
    })


    const entries = {}

    files.forEach(file => {
        const filename = file.replace(this.options.directory, '')
        const chunkName = filename.substr(1, filename.indexOf('.') - 1)

        if (!entries[chunkName]) {
            entries[chunkName] = []
        }

        entries[chunkName].push(file)
    })

    return entries
}

module.exports = Cattleman