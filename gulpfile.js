var gulp = require('gulp'),
    sourcemaps = require('gulp-sourcemaps'),
    source = require('vinyl-source-stream'),
    buffer = require('vinyl-buffer'),
    browserify = require('browserify'),
    watchify = require('watchify'),
    babel = require('babelify'),
    connect = require('gulp-connect'),
    livereload = require('gulp-livereload');

function compile(watch) {
  var bundler = watchify(browserify('./src/main.js', { debug: true }).transform(babel));

  function rebundle() {
    bundler.bundle()
      .on('error', function(err) { console.error(err); this.emit('end'); })
      .pipe(source('build.js'))
      .pipe(buffer())
      .pipe(sourcemaps.init({ loadMaps: true }))
      .pipe(sourcemaps.write('./'))
      .pipe(gulp.dest('./build'))
      .pipe(livereload());
  }

  if (watch) {
    bundler.on('update', function() {
      console.log('-> bundling...');
      rebundle();
      console.log('-> done');
    });
  }

  rebundle();
}

function watch() {
  return compile(true);
};

gulp.task('watch', function() { 
  livereload.listen();
  return watch();
});

gulp.task('build', function() { return compile(); });
gulp.task('connect', function() { connect.server(); });

gulp.task('default', ['watch', 'connect']);