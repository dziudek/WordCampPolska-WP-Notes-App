'use strict';

import gulp from 'gulp';
import sass from 'gulp-sass';
import sourcemaps from 'gulp-sourcemaps';
import babel from 'gulp-babel';
import plumber from 'gulp-plumber';

const dirs = {
    js: {
        src: 'app/renderer/src/js',
        dest: 'app/renderer/dist/'
    },
    jsx: {
        src: 'app/renderer/src/jsx/',
        dest: 'app/renderer/dist/js/components/'
    },
    scss: {
        src: 'app/renderer/src/scss/',
        dest: 'app/renderer/dist/css/'
    }
};

gulp.task('scss', () => {
    return gulp.src(dirs.scss.src + 'app.scss')
        .pipe(plumber())
        .pipe(sourcemaps.init())
        .pipe(sass())
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(dirs.scss.dest));
});

gulp.task('jsx', function () {
    return gulp.src(dirs.jsx.src + '**/*.jsx')
        .pipe(plumber())
        .pipe(sourcemaps.init())
        .pipe(babel({
            presets: ['react']
        }))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(dirs.jsx.dest));
});

gulp.task('js', function() {
    return gulp.src(dirs.js.src + '**/*.js')
        .pipe(plumber())
        .pipe(sourcemaps.init())
        .pipe(babel({
            presets: ['es2015']
        }))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(dirs.js.dest));
});

gulp.task('default', function() {
    gulp.watch(dirs.scss.src + '**/*.scss', ['scss']);
    gulp.watch(dirs.jsx.src + '**/*.jsx', ['jsx']);
    gulp.watch(dirs.js.src + '**/*.js', ['js']);
});
