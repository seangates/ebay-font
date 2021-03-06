"use strict";

const { join } = require("path");
const mkdirp = require('mkdirp');
const { readFileSync, writeFileSync } = require("fs");

const rootPath = join(__dirname, '..');
const destPath = join(rootPath, 'dist');
const fontloaderFile = join(destPath, 'fontloader.js');

function getFileContent(filePath) {
    try {
        const fileContent = readFileSync(filePath, 'utf8');
        if (!fileContent) {
            console.log(`${filePath} is empty`);
            process.exit(1);
        }
        return fileContent;
    } catch (err) {
        console.log(err);
        process.exit(1);
    }
    return '';
}

function wrapInIIFE(body) {
    return `
        ;(function() {
            ${body}
        }());
    `;
}

function getFontLoaderLogic() {
    const fontLoaderLogic = getFileContent(join(rootPath, 'font/marketsans/fontloader.js'));
    const pattern = `require('lasso-loader').async`;

    if (!fontLoaderLogic.includes(pattern)) {
        // Exit is the pattern is not matching
        console.log(`Pattern (${pattern}) matching in source fontloader.js failed`);
        process.exit(1);
    }

    // Replace with a simple identity function
    return fontLoaderLogic.replace(pattern, `function(_, cb){cb();}`);
}

function generateFile() {
    mkdirp(destPath, err => {
        if (err) {
            console.log(err);
            process.exit(err.code);
        }
        const fontLoaderContent = [];

        // Push the Font Face Observer
        fontLoaderContent.push(getFileContent(join(rootPath, 'font/vendor/fontfaceobserver.js')));

        // Push fontloader logic wrapped in IIFE
        const fontLoaderLogic = getFontLoaderLogic();
        const fontLoaderIIFE = wrapInIIFE(fontLoaderLogic);
        fontLoaderContent.push(fontLoaderIIFE);

        writeFileSync(fontloaderFile, fontLoaderContent.join('\n'), 'utf8');
    });
}

generateFile();

