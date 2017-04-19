/**
 * book上传任务
 * @author xdimf
 * @log
 */

'use strict';
const gulp = require('gulp');
const del = require('del');
const gulpLoadPlugins = require('gulp-load-plugins');

const $ = gulpLoadPlugins();

// Publishes the site to GitHub Pages
gulp.task('publish.github', () => {
    console.log('Publishing to GH Pages');
return gulp.src(['./_book/**/*','CNAME'])
    .pipe($.ghPages({
        cacheDir:'publish-github',
        origin: 'origin',
        branch: 'gh-pages'
    }));
});


// gulp.task('del',(cb) => {
//     del(['.publish/**'], {dryRun: true}).then(paths => {
//         console.log('Files and folders that would be deleted:\n', paths.join('\n'));
//         cb();
//     });
// });

// Publishes the site to GitHub Pages
gulp.task('publish.coding.net', () => {
    console.log('Publishing to coding.net Pages');
    return gulp.src(['./_book/**/*'])
        .pipe($.ghPages({
            remoteUrl: 'https://git.coding.net/weekly/weekly.coding.me.git',
            cacheDir : 'publish-coding-net',
            branch: 'master',
            force : true
        }));
});