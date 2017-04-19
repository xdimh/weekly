/**
 * book上传任务
 * @author xdimf
 * @log
 */

'use strict';
const gulp = require('gulp');
const shell = require('shelljs');
const yargs = require('yargs');
const gulpLoadPlugins = require('gulp-load-plugins');

const $ = gulpLoadPlugins();

// 推送到github - weekly - gh-pages上
gulp.task('publish.github',() => {
    console.log('Publishing to GH Pages');
return gulp.src(['./_book/**/*','CNAME'])
    .pipe($.ghPages({
        cacheDir:'publish-github',
        origin: 'origin',
        branch: 'gh-pages'
    }));
});


// 推送到coding.net weely.coding.me 上
gulp.task('publish.coding.net',() => {
    console.log('Publishing to coding.net Pages');
    return gulp.src(['./_book/**/*'])
        .pipe($.ghPages({
            remoteUrl: 'https://git.coding.net/weekly/weekly.coding.me.git',
            cacheDir : 'publish-coding-net',
            branch: 'master',
            force : true
        }));
});

//build gitbook 为静态html
gulp.task('build',(cb) => {
    shell.exec('gitbook build', function(code, stdout, stderr) {
        if (code == 0) {
           cb();
        } else {
           throw new Error('gitbook build 失败!');
        }
    });
});

gulp.task('push-master',()=>{
    let argv = yargs.usage('Usage: gulp push-master [options]')
        .example('gulp push-master -m message')
        .options({
            m: {
                alias: 'msg',
                demand: true,
                describe: 'commit message',
                type: 'string'
            }
        })
        .help('h')
        .alias('h', 'help')
        .epilog('copyright 2017')
        .argv;
    return gulp.src([__dirname + '/**','!' + __dirname + '/_book/**','!' + __dirname + '/*publish*/**','!node_modules/**'])
        .pipe($.ghPages({
            branch: 'master',
            message : argv.m
        }));
});

gulp.task('publish',['publish.coding.net','publish.github']);