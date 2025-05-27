const { promisify } = require('util')
const dateFormat = require('dateformat')
const path = require('path')
const TEMPLATE_DIR = path.join(__dirname, 'templates')
const readFileAsync = promisify(require('fs').readFile)
const template = readFileAsync(path.join(TEMPLATE_DIR, '/default-template.hbs'))
const commitTemplate = readFileAsync(path.join(TEMPLATE_DIR,'/commit-template.hbs'))
module.exports = {

  branches: [
    "main",
    "dev",
    {
      name: 'develop',
      prerelease: true
    }
  ],
  plugins: [
    [
      'semantic-release-gitmoji', {
        releaseRules: {
          major: [':boom:'],
          minor: [':sparkles:'],
          patch: [
            ':bug:',
            ':zap:',
            ':ambulance:',
            ':lock:',
            ':hammer:',
            ':white_check_mark:'
          ]
        },
        releaseNotes: {
          template,
          partials: {
            commitTemplate
          },
          helpers: {
            formatDate: function(date){
              return dateFormat(date, 'yyy-mm-dd HH:MM:ss');
            },
            split: function(string){
              return string.trim().split('\n');
            },
            formatDateCol: function(date) {
              if(!date) date = new Date();
              return date.toLocaleString('en-US', { 
                timeZone: 'America/Bogota', 
                year: 'numeric', 
                month: '2-digit', 
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false
              }).replace(',','');
            }
          }
        }
      }
    ],
    [
      "@semantic-release/exec",
      {
        "prepareCmd": "mvn version:set -DnewVersion=\"${nextRelease.version}\" && mvn clean install"
      }
    ],
    [
      "@semantic-release/changelog",
      {
        "changelogFile": "docs/prerelease/CHANGELOG.md",
        "changelogTitle": ['# Gitmoji Prerelease Changelog', process.env.REPO_NAME, '\uD83C\uDF88'].join(' ')
      }
    ],
    [
      "@semantic-release/git",
      {
        assets: [
          "**/pom.xml",
          "docs/prerelease/PRERELEASE-CHANGELOG.md"
        ],
        message: [
          ':bookmark: ${nextRelease.version} [skip ci]'
        ].join('')
      }
    ]
  ],
  tagFormat: '${version}'
}