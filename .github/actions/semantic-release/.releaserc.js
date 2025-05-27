const { promisify } = require('util')
const dateFormat = require('dateformat')
const path = require('path')
const TEMPLATE_DIR = path.join(__dirname, 'handlebar-templates')
const readFileAsync = promisify(require('fs').readFile)
const template = readFileAsync(path.join(TEMPLATE_DIR,'.github/actions/semantic-release/handlebar-templates'))
const commitTemplate = readFileAsync(path.join(TEMPLATE_DIR,'.github/actions/semantic-release/handlebar-templates'))
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
            ':ambulance:'
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
        "prepareCmd": "mvn version:set -DnewVersion=\"${nextRelease.version}\" && mvn clean install",
        "successCmd": 'echo "Release ${nextRelease.version} published successfully"'
      }
    ],
    [
      "@semantic-release/npm",
      {
        "npmPublish": false
      }
    ],
    [
      "@semantic-release/changelog",
      {
        "changelogFile": "docs/CHANGELOG.md",
        "changelogTitle": ['# Gitmoji Changelog', process.env.REPO_NAME, '\uD83C\uDF88'].join(' ')
      }
    ],
    [
      "@semantic-release/git",
      {
        assets: [
          "**/pom.xml",
          "../../../docs/CHANGELOG.md"
        ],
        message: [
          ':bookmark: ${nextRelease.version} [skip ci]'
        ].join('')
      }
    ]
  ],
  tagFormat: '${version}'
}