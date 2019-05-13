var gulp = require('gulp'),
    gutil = require('gulp-util'),
    browserify = require('gulp-browserify'),
    gsass = require('gulp-sass'),
    coffee = require('gulp-coffee'),
    connect = require('gulp-connect'),
    gulpif = require('gulp-if'),
    uglify = require('gulp-uglify'),
    minifyHTML = require('gulp-minify-html'),
    jsonminify = require('gulp-jsonminify'),
    imagemin = require('gulp-imagemin'),
    pngcrush = require('imagemin-pngcrush'),
    concat = require('gulp-concat');

var env,
    coffeeSources,
    jsSources,
    sassSources,
    outputDir,
    sassStyle;

env = process.env.NODE_ENV || 'development';

if (env === 'development') {
    outputDir = 'builds/development/';
    sassStyle = 'expanded';
} else {
    outputDir = 'builds/production/';
    sassStyle = 'compressed';
}

coffeeSources = ['components/coffee/*.coffee'];
jsSources = ['components/scripts/*.js'];
sassSources = ['components/sass/*.scss'];
htmlSources = [outputDir + '/*.html'];
jsonSources = [outputDir + '/js/*.json'];

gulp.task('html', function(done) {
    gulp.src('builds/development/*.html')
        .pipe(gulpif(env === 'production', minifyHTML()))
        .pipe(gulpif(env === 'production', gulp.dest(outputDir)))
        .pipe(connect.reload());
    done();
});
gulp.task('json', function(done) {
    gulp.src('builds/development/js/*.json')
        .pipe(gulpif(env === 'production', jsonminify()))
        .pipe(gulpif(env === 'production', gulp.dest('builds/production/js')))
        .pipe(connect.reload())
    done();
});
gulp.task('coffee', function(done) {
    gulp.src(coffeeSources)
        .pipe(coffee({ bare: true })
            .on('error', gutil.log))
        .pipe(gulp.dest('components/scripts'));
    done();
});
gulp.task('js', function(done) {
    gulp.src(jsSources)
        .pipe(concat('script.js'))
        .pipe(browserify())
        .pipe(gulpif(env === 'production', uglify()))
        .pipe(gulp.dest(outputDir + '/js'))
        .pipe(connect.reload());
    done();
});
gulp.task('sass', function(done) {
    gulp.src(sassSources)
        .pipe(gsass({
            sass: 'components/sass',
            image: outputDir + '/images',
            style: sassStyle
        })
        .on('error', gutil.log))
        .pipe(gulp.dest(outputDir + '/css'))
        .pipe(connect.reload());
    done();
});
gulp.task('images', function(done) {
    gulp.src('builds/development/images/**/*.*')
        .pipe(gulpif(env === 'production', imagemin({
            progressive: true,
            svgoPlugins: [{ removeViewBox: false }],
            use: [pngcrush()]
        })))
        .pipe(gulpif(env === 'production', gulp.dest(outputDir + "images")))
        .pipe(connect.reload());
    done();
});


gulp.task('default', gulp.series('html', 'json', 'coffee', 'js', 'sass', 'images', function watching() {
    connect.server({
        root: outputDir + '/',
        livereload: true
    });
    gulp.watch(coffeeSources, gulp.series('coffee')),
    gulp.watch(jsSources, gulp.series('js')),
    gulp.watch(sassSources, gulp.series('sass')),
    gulp.watch('builds/developmen/*.html', gulp.series('html'));
    gulp.watch('builds/development/js/*.json', gulp.series('json'));
    gulp.watch('builds/development/images/**/*.*', gulp.series('images'));
    return;
}));