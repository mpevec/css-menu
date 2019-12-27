// Gulp loader
const {
    src,
    dest,
    task,
    watch,
    series,
    parallel
} = require('gulp');

// --------------------------------------------
// Dependencies
// --------------------------------------------

// CSS / SASS plugins
const sass = require('gulp-sass');

// JSS / plugins
const uglify = require('gulp-uglify');

// Utility plugins
const concat = require('gulp-concat');
const del = require('del');
const plumber = require('gulp-plumber');
const sourcemaps = require('gulp-sourcemaps');
const rename = require('gulp-rename');

// Browser plugins
const browserSync = require('browser-sync').create();

// Images plugins
const images = require('gulp-imagemin');

// Babel
const gulp = require('gulp');
const babel = require('gulp-babel');

// Project Variables
const styleSrc = 'source/sass/**/*.sass';
const styleDest = 'build/assets/css/';

const vendorSrc = 'source/js/vendors/**/*.js';
const vendorDest = 'build/assets/js/';

const scriptSrc = 'source/js/*.js';
const scriptDest = 'build/assets/js/';


// --------------------------------------------
// Stand Alone Tasks
// --------------------------------------------
// Compiles SASS files
function css(done) {
    src(styleSrc)
        .pipe(plumber())
        .pipe(sass({
            style: 'compressed'
        }))
        .pipe(rename({
            basename: 'main',
            suffix: '.min'
        }))
        .pipe(dest(styleDest));
    done();
};

// Delete scripts
function clean() {
    return del([
        scriptDest + '**/*.js',
        scriptDest + '**/*.map',
        styleDest + '**/*.css',
      ]);
};

// Images
function img(done) {
    src('source/img/*')
        .pipe(images())
        .pipe(dest('build/assets/img'));
    done();
};

// Babel ES6 -> js and sourcemaps
function es6transpile(done) {
    src(scriptSrc)
        .pipe(sourcemaps.init())
        .pipe(babel({
            presets: ['@babel/env']
        }))
        .pipe(concat('main.js'))
        .pipe(sourcemaps.write('.'))
        .pipe(dest(scriptDest));
    done();
};

//Concat and Compress Vendor .js files
function vendor(done) {
    src(vendorSrc)
        .pipe(plumber())
        .pipe(concat('vendors.js'))
        .pipe(uglify())
        .pipe(dest(vendorDest));
    done();
};

// Watch for changes
function watcher() {

    // Serve files from the root of this project
    browserSync.init({
        server: {
            baseDir: "./build"
        },
        notify: false
    });

    watch(styleSrc, series(css));
    watch(scriptSrc, series(es6transpile));
    watch(vendorSrc, series(vendor));
    watch(['build/*.html', 'build/assets/css/*.css', 'build/assets/js/*.js', 'build/assets/js/vendors/*.js']).on('change', browserSync.reload);

};

task('img', series(img));
task('clean', series(clean));
task('build', series(clean, parallel(css, img, vendor, es6transpile)));
task('es6transpile', series(es6transpile));
task('default', series(clean, parallel(css, img, vendor, es6transpile, watcher)));
